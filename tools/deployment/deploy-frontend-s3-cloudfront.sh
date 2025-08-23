#!/usr/bin/env bash
set -Eeuo pipefail

# =============================================
# Deploy Frontend to S3 + CloudFront (SPA-safe)
# =============================================
# What it does:
# - Builds the Vite frontend (dist/)
# - Creates/uses a private S3 bucket (no public access)
# - Creates/uses a CloudFront distribution with OAC (SigV4)
# - Configures SPA routing (404/403 -> index.html)
# - Uploads the build and invalidates the cache
#
# Prereqs:
# - AWS CLI v2, jq, Node 18+
# - aws sts get-caller-identity works
# - frontend/.env.production set (VITE_* vars)
#
# Optional env vars:
#   REGION          (default: us-east-2)
#   BUCKET_NAME     (default: disaster-response-frontend-<account>-<region>)
#   DIST_COMMENT    (default: "Disaster Response Frontend")
#   PRICE_CLASS     (default: PriceClass_100)   # 100 | 200 | All
#   ALT_DOMAIN      (optional: example.com)     # needs Route53+ACM in us-east-1
#   ACM_CERT_ARN    (optional: cert arn in us-east-1; required if ALT_DOMAIN set)
# =============================================

REGION="${REGION:-us-east-2}"
PRICE_CLASS="${PRICE_CLASS:-PriceClass_100}"
DIST_COMMENT="${DIST_COMMENT:-Disaster Response Frontend}"

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
: "${ACCOUNT_ID:?Need AWS credentials (aws sts get-caller-identity failed)}"

BUCKET_NAME_DEFAULT="disaster-response-frontend-${ACCOUNT_ID}-${REGION}"
BUCKET_NAME="${BUCKET_NAME:-$BUCKET_NAME_DEFAULT}"

echo "Region:        $REGION"
echo "Account:       $ACCOUNT_ID"
echo "Bucket:        $BUCKET_NAME"
echo "Price class:   $PRICE_CLASS"
echo "Dist comment:  $DIST_COMMENT"
echo "Alt domain:    ${ALT_DOMAIN:-<none>}"
echo

# jq (for CloudShell this is yum; ignore if already installed)
command -v jq >/dev/null || { echo "Installing jq..."; sudo yum -y install jq >/dev/null 2>&1 || true; }

# 1) Build the Vite app
if [ ! -d frontend ]; then
  echo "ERROR: run from repo root (frontend/ missing)"; exit 1
fi
pushd frontend >/dev/null
echo "📦 Installing deps & building Vite app..."
npm ci
npm run build
[ -d dist ] || { echo "ERROR: build failed; dist/ missing"; exit 1; }
popd >/dev/null

# 2) Create private S3 bucket (block public access)
echo "🪣 Ensuring private S3 bucket exists: $BUCKET_NAME"
if ! aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
  if [ "$REGION" = "us-east-1" ]; then
    aws s3api create-bucket --bucket "$BUCKET_NAME"
  else
    aws s3api create-bucket --bucket "$BUCKET_NAME" \
      --create-bucket-configuration LocationConstraint="$REGION"
  fi
fi

aws s3api put-public-access-block --bucket "$BUCKET_NAME" --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

aws s3api put-bucket-ownership-controls --bucket "$BUCKET_NAME" \
  --ownership-controls='{"Rules":[{"ObjectOwnership":"BucketOwnerPreferred"}]}'

# 3) Create (or reuse) CloudFront OAC
echo "🛡  Ensuring CloudFront OAC exists..."
OAC_NAME="oac-${BUCKET_NAME}"
OAC_ID="$(aws cloudfront list-origin-access-controls \
  --query "OriginAccessControlList.Items[?Name=='${OAC_NAME}'].Id" --output text 2>/dev/null || true)"
if [ -z "$OAC_ID" ] || [ "$OAC_ID" = "None" ]; then
  cat > oac.json <<JSON
{
  "Name": "${OAC_NAME}",
  "Description": "OAC for ${BUCKET_NAME}",
  "SigningProtocol": "sigv4",
  "SigningBehavior": "always",
  "OriginAccessControlOriginType": "s3"
}
JSON
  OAC_ID="$(aws cloudfront create-origin-access-control \
    --origin-access-control-config file://oac.json \
    --query 'OriginAccessControl.Id' --output text)"
fi
echo "OAC_ID=$OAC_ID"

# 4) Create (or reuse) CloudFront distribution
echo "🌐 Ensuring CloudFront distribution exists..."
DIST_ID="$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Origins.Items[0].DomainName=='${BUCKET_NAME}.s3.${REGION}.amazonaws.com'].Id" \
  --output text 2>/dev/null | head -n1 || true)"

if [ -z "$DIST_ID" ] || [ "$DIST_ID" = "None" ]; then
  ORIGIN_ID="s3-${BUCKET_NAME}"
  CALLER_REF="dr-frontend-$(date +%s)"

  # Viewer certificate & aliases
  if [ -n "${ALT_DOMAIN:-}" ] && [ -n "${ACM_CERT_ARN:-}" ]; then
    # NOTE: ACM cert must be in us-east-1 for CloudFront
    VIEWER_CERT=$(jq -n --arg arn "$ACM_CERT_ARN" '{ACMCertificateArn:$arn, SSLSupportMethod:"sni-only", MinimumProtocolVersion:"TLSv1.2_2021"}')
    ALIASES_JSON=$(jq -n --arg d "$ALT_DOMAIN" '{Quantity:1, Items:[$d]}')
  else
    VIEWER_CERT=$(jq -n '{CloudFrontDefaultCertificate:true}')
    ALIASES_JSON=$(jq -n '{Quantity:0}')
  fi

  cat > dist-config.json <<JSON
{
  "CallerReference": "${CALLER_REF}",
  "Aliases": ${ALIASES_JSON},
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "${ORIGIN_ID}",
      "DomainName": "${BUCKET_NAME}.s3.${REGION}.amazonaws.com",
      "S3OriginConfig": { "OriginAccessIdentity": "" },
      "OriginAccessControlId": "${OAC_ID}"
    }]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "${ORIGIN_ID}",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": { "Quantity": 2, "Items": ["GET", "HEAD"] },
    "CachedMethods":  { "Quantity": 2, "Items": ["GET", "HEAD"] },
    "Compress": true,
    "ForwardedValues": {
      "QueryString": true,
      "Cookies": { "Forward": "none" }
    },
    "MinTTL": 0,
    "DefaultTTL": 3600,
    "MaxTTL": 86400
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [{
      "ErrorCode": 404,
      "ResponsePagePath": "/index.html",
      "ResponseCode": "200",
      "ErrorCachingMinTTL": 0
    },{
      "ErrorCode": 403,
      "ResponsePagePath": "/index.html",
      "ResponseCode": "200",
      "ErrorCachingMinTTL": 0
    }]
  },
  "Comment": "${DIST_COMMENT}",
  "PriceClass": "${PRICE_CLASS}",
  "Enabled": true,
  "ViewerCertificate": ${VIEWER_CERT}
}
JSON

  DIST_ID="$(aws cloudfront create-distribution \
    --distribution-config file://dist-config.json \
    --query 'Distribution.Id' --output text)"
  echo "Created distribution: $DIST_ID"
else
  echo "Reusing distribution: $DIST_ID"
fi

# 5) Bucket policy to allow CloudFront (OAC) to read
echo "🔐 Updating S3 bucket policy for CloudFront OAC..."
DIST_ARN="arn:aws:cloudfront::${ACCOUNT_ID}:distribution/${DIST_ID}"
cat > bucket-policy.json <<JSON
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowCloudFrontReadOAC",
    "Effect": "Allow",
    "Principal": { "Service": "cloudfront.amazonaws.com" },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::${BUCKET_NAME}/*",
    "Condition": { "StringEquals": { "AWS:SourceArn": "${DIST_ARN}" } }
  }]
}
JSON
aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file://bucket-policy.json

# 6) Upload the build
echo "⬆️  Syncing build to S3..."
aws s3 sync frontend/dist/ "s3://${BUCKET_NAME}/" --delete

# 7) Invalidate CloudFront cache
echo "🧹 Creating CloudFront invalidation..."
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*" >/dev/null

# 8) Output CloudFront domain
DOMAIN=$(aws cloudfront get-distribution --id "$DIST_ID" --query 'Distribution.DomainName' --output text)
echo
echo "✅ Deployed!"
echo "CloudFront URL: https://${DOMAIN}"
if [ -n "${ALT_DOMAIN:-}" ]; then
  echo "Custom domain:  https://${ALT_DOMAIN}"
fi

# Cleanup temporary files
rm -f oac.json dist-config.json bucket-policy.json
