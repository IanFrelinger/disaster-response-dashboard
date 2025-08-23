# Environment Variables Setup Guide

## Step 1: Update Your Production Environment File

You need to edit `backend/.env.production.final` with your real values. Here's how:

### 1.1 Open the file for editing:
```bash
# Open in your preferred editor
nano backend/.env.production.final
# OR
code backend/.env.production.final
# OR
vim backend/.env.production.final
```

### 1.2 Update these critical values:

#### **CORS_ORIGINS** (REQUIRED - Replace with your actual domain):
```bash
# Change this line:
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# To your actual domain, for example:
CORS_ORIGINS=https://disaster-response.gov,https://www.disaster-response.gov
# OR
CORS_ORIGINS=https://myapp.herokuapp.com
# OR
CORS_ORIGINS=https://myapp.aws.com
```

#### **Database Configuration** (if you're using a database):
```bash
# If you have a PostgreSQL database, update these:
DATABASE_URL=postgresql://username:secure_password@your-db-host:5432/disaster_response
POSTGRES_HOST=your-db-host
POSTGRES_USER=disaster_user
POSTGRES_PASSWORD=your-secure-database-password

# Example for AWS RDS:
DATABASE_URL=postgresql://disaster_user:MySecurePassword123@disaster-db.abc123.us-east-2.rds.amazonaws.com:5432/disaster_response
POSTGRES_HOST=disaster-db.abc123.us-east-2.rds.amazonaws.com
POSTGRES_USER=disaster_user
POSTGRES_PASSWORD=MySecurePassword123
```

#### **Redis Configuration** (if you're using Redis):
```bash
# If you have Redis, update these:
REDIS_URL=redis://your-redis-host:6379
REDIS_HOST=your-redis-host
REDIS_PASSWORD=your-secure-redis-password

# Example for AWS ElastiCache:
REDIS_URL=redis://disaster-cache.abc123.us-east-2.cache.amazonaws.com:6379
REDIS_HOST=disaster-cache.abc123.us-east-2.cache.amazonaws.com
REDIS_PASSWORD=MySecureRedisPassword123
```

#### **JWT and Encryption Keys** (Generate secure keys):
```bash
# Generate secure JWT secret key:
openssl rand -hex 32

# Generate encryption key:
openssl rand -base64 32

# Update these lines with the generated keys:
JWT_SECRET_KEY=your-generated-jwt-secret-key
ENCRYPTION_KEY=your-generated-encryption-key
DATA_ENCRYPTION_KEY=your-generated-data-encryption-key
```

### 1.3 Save the file and verify:
```bash
# Check that the file was updated correctly
grep "CORS_ORIGINS" backend/.env.production.final
```

## Step 2: Generate Secure Keys (if needed)

If you need to generate secure keys for JWT and encryption:

```bash
# Generate JWT secret key
echo "JWT_SECRET_KEY=$(openssl rand -hex 32)"

# Generate encryption key
echo "ENCRYPTION_KEY=$(openssl rand -base64 32)"

# Generate data encryption key
echo "DATA_ENCRYPTION_KEY=$(openssl rand -base64 32)"
```

## Step 3: Test Your Configuration

```bash
# Test that your environment loads correctly
cd backend
python -c "from config import Config; c = Config(); print('✅ Config loaded'); print(f'CORS: {c.CORS_ORIGINS}')"
```

## Common Domain Examples

### For AWS:
```bash
CORS_ORIGINS=https://your-app.elasticbeanstalk.com
```

### For Heroku:
```bash
CORS_ORIGINS=https://your-app.herokuapp.com
```

### For Custom Domain:
```bash
CORS_ORIGINS=https://disaster-response.gov,https://www.disaster-response.gov
```

### For Local Development (temporary):
```bash
CORS_ORIGINS=http://localhost:3000,https://localhost:3000
```

## Important Notes

1. **Never commit** `backend/.env.production.final` to git
2. **Use HTTPS** for production domains
3. **Generate strong passwords** for databases
4. **Keep keys secure** and rotate them regularly
5. **Test configuration** before deployment

## Next Steps

After updating your environment variables:
1. Set up SSL certificate (see next section)
2. Configure CORS (see next section)
3. Deploy your application
