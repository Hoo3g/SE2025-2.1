#!/bin/bash

# ===========================================
# DEPLOYMENT SCRIPT - OAuth Server (using scp)
# ===========================================
# Usage: ./deploy.sh <server_ip> <ssh_key_path>
# Example: ./deploy.sh 136.114.70.164 server-key.pem
# ===========================================

set -e

SERVER_IP="${1:?Error: Please provide server IP}"
SSH_KEY="${2:?Error: Please provide SSH key path}"
REMOTE_USER="se2025_2_1"
REMOTE_DIR="/home/se2025_2_1/oauth-server"

echo "🚀 Deploying to $SERVER_IP..."

# Test SSH connection
echo "🔐 Testing SSH connection..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$REMOTE_USER@$SERVER_IP" "echo 'SSH connection successful!'"

# Create archive excluding unnecessary files
echo "📦 Creating deployment archive..."
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='docker/mysql_data' \
    --exclude='*.log' \
    --exclude='.env' \
    --exclude='server-key*' \
    -czf /tmp/oauth-deploy.tar.gz .

# Copy archive to server
echo "📤 Uploading to server..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no /tmp/oauth-deploy.tar.gz "$REMOTE_USER@$SERVER_IP:/tmp/"

# Extract on server and setup
echo "📋 Setting up on server..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$REMOTE_USER@$SERVER_IP" << REMOTE_SCRIPT
set -e

# Create directory
mkdir -p $REMOTE_DIR
cd $REMOTE_DIR

# Extract files
tar -xzf /tmp/oauth-deploy.tar.gz
rm /tmp/oauth-deploy.tar.gz

# Copy .env template if not exists
if [ ! -f .env ]; then
    cp .env.production .env 2>/dev/null || cp .env.example .env 2>/dev/null || true
    echo "⚠️  Please configure .env file!"
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install Node.js first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo "✅ Setup complete!"
REMOTE_SCRIPT

# Cleanup local archive
rm /tmp/oauth-deploy.tar.gz

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "   1. SSH to server: ssh -i $SSH_KEY $REMOTE_USER@$SERVER_IP"
echo "   2. Edit .env: cd $REMOTE_DIR && nano .env"
echo "   3. Update APP_URL=http://$SERVER_IP:3000"
echo "   4. Start server: npm run docker:start"
