# GitHub Secrets Setup Guide

## 🔑 Required Secrets

Add these secrets to your GitHub repository:

1. Go to: `https://github.com/IanFrelinger/disaster-response-dashboard/settings/secrets/actions`

2. Click "New repository secret" and add:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AWS_ACCESS_KEY_ID` | `AKIA...` | AWS Access Key ID |
| `AWS_SECRET_ACCESS_KEY` | `wJalr...` | AWS Secret Access Key |
| `AWS_REGION` | `us-east-2` | AWS Region |

## 🚀 How to Add Secrets

1. **Navigate to your repository**
2. **Click Settings tab**
3. **Click Secrets and variables → Actions**
4. **Click "New repository secret"**
5. **Add each secret above**

## ✅ Verification

After adding secrets:
1. Make a small change to your code
2. Push to trigger the workflow
3. Check the Actions tab for progress
4. Monitor AWS ECR and ECS for deployment

## 🆘 Troubleshooting

- **Permission denied**: Check IAM user policies
- **ECR login failed**: Verify ECR repository exists
- **ECS update failed**: Check ECS service configuration
- **Build failed**: Review workflow logs in Actions tab
