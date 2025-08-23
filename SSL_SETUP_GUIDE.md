# SSL Certificate Setup Guide

## Overview

SSL certificates are essential for production deployments to enable HTTPS. Here are the most common methods:

## Method 1: Let's Encrypt (Free, Recommended)

### For AWS EC2/Linux Server:

#### Step 1: Install Certbot
```bash
# For Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# For CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

#### Step 2: Get SSL Certificate
```bash
# Replace 'yourdomain.com' with your actual domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose redirect option (recommend option 2 for HTTPS redirect)
```

#### Step 3: Auto-renewal Setup
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Add to crontab for automatic renewal
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

### For Docker/Nginx:

#### Step 1: Create nginx configuration
```bash
# Create nginx config for your domain
sudo nano /etc/nginx/sites-available/yourdomain.com
```

#### Step 2: Add this configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL configuration (will be added by certbot)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy to your application
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # API endpoints
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Step 3: Enable site and get certificate
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Method 2: AWS Certificate Manager (ACM) - For AWS

### For AWS Load Balancer:

#### Step 1: Request Certificate in ACM
1. Go to AWS Console → Certificate Manager
2. Click "Request a certificate"
3. Enter your domain: `yourdomain.com`
4. Add additional domain: `*.yourdomain.com`
5. Choose DNS validation
6. Click "Request"

#### Step 2: Validate Certificate
1. Click on your certificate
2. Click "Create records in Route 53" (if using Route 53)
3. Or manually add CNAME records to your DNS provider

#### Step 3: Attach to Load Balancer
1. Go to EC2 → Load Balancers
2. Create or edit your load balancer
3. Add HTTPS listener (port 443)
4. Select your ACM certificate
5. Configure security groups to allow port 443

### For AWS CloudFront:

#### Step 1: Request Certificate
1. Go to AWS Console → Certificate Manager
2. Request certificate for your domain
3. Validate using DNS or email

#### Step 2: Configure CloudFront
1. Go to CloudFront
2. Create or edit distribution
3. Set origin to your application
4. Add custom domain
5. Select your ACM certificate

## Method 3: Heroku (Automatic SSL)

### For Heroku Apps:
```bash
# Heroku provides SSL automatically for *.herokuapp.com domains
# For custom domains, add SSL certificate:

# Add custom domain
heroku domains:add yourdomain.com

# Enable SSL (Heroku will provision certificate automatically)
heroku certs:auto:enable
```

## Method 4: Cloudflare (Free SSL)

### For Cloudflare:
1. Sign up for Cloudflare account
2. Add your domain
3. Update DNS nameservers to Cloudflare
4. Enable "Always Use HTTPS" in SSL/TLS settings
5. Set SSL mode to "Full" or "Full (strict)"

## Testing SSL Setup

### Check SSL Certificate:
```bash
# Test SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check certificate expiration
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Test HTTPS Redirect:
```bash
# Test HTTP to HTTPS redirect
curl -I http://yourdomain.com
# Should return 301 redirect to https://

# Test HTTPS directly
curl -I https://yourdomain.com
# Should return 200 OK
```

### Security Headers Test:
```bash
# Check security headers
curl -I https://yourdomain.com | grep -E "(Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options|X-XSS-Protection)"
```

## Common Issues and Solutions

### Issue: Certificate not trusted
**Solution**: Ensure you're using a valid certificate from a trusted CA

### Issue: Mixed content warnings
**Solution**: Ensure all resources (CSS, JS, images) use HTTPS

### Issue: Certificate expiration
**Solution**: Set up auto-renewal or use a service that handles this automatically

### Issue: SSL handshake errors
**Solution**: Check firewall settings and ensure port 443 is open

## SSL Configuration Best Practices

### Security Headers:
```nginx
# Add these headers to your nginx configuration
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### SSL Configuration:
```nginx
# Strong SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

## Next Steps

After setting up SSL:
1. Update your CORS configuration (see next section)
2. Test your application with HTTPS
3. Update any hardcoded HTTP URLs to HTTPS
4. Monitor certificate expiration
