#!/bin/bash
# Automated deployment script for OAuth Server
# Usage: ./deploy-to-server.sh

set -e

# Auto-detect project directory (works for all team members)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOCAL_DIR="$SCRIPT_DIR"

# Configuration
SERVER="se2025_2_1@136.114.70.164"
KEY="server-key.pem"
REMOTE_DIR="~/oauth-server"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting deployment to $SERVER...${NC}\n"

# Check if SSH key exists
if [ ! -f "$KEY" ]; then
    echo -e "${RED}❌ Error: SSH key '$KEY' not found!${NC}"
    exit 1
fi

# Check SSH key permissions
KEY_PERMS=$(stat -c %a "$KEY" 2>/dev/null || stat -f %A "$KEY" 2>/dev/null)
if [ "$KEY_PERMS" != "600" ]; then
    echo -e "${YELLOW}⚠️  Warning: SSH key permissions are $KEY_PERMS, setting to 600...${NC}"
    chmod 600 "$KEY"
fi

# 1. Create backup on server
echo -e "${YELLOW}💾 Creating backup on server...${NC}"
ssh -i "$KEY" "$SERVER" "cd ~ && tar -czf oauth-server-backup-\$(date +%Y%m%d-%H%M%S).tar.gz oauth-server/ 2>/dev/null || echo 'Backup skipped'" || true

# 2. Sync code to server
echo -e "\n${BLUE}📦 Syncing code to server...${NC}"
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude 'logs' \
  --exclude '.env' \
  --exclude '.env.local' \
  --exclude 'docker/mysql_data' \
  --exclude '.git' \
  --exclude 'deploy-to-server.sh' \
  --exclude '*.log' \
  --exclude '.DS_Store' \
  -e "ssh -i $KEY" \
  "$LOCAL_DIR/" "$SERVER:$REMOTE_DIR/"

# 3. Check if package.json changed (install dependencies if needed)
echo -e "\n${BLUE}📥 Checking dependencies...${NC}"
PACKAGE_CHANGED=$(ssh -i "$KEY" "$SERVER" "cd $REMOTE_DIR && git diff --name-only HEAD~1 HEAD 2>/dev/null | grep package.json || echo ''")
if [ -n "$PACKAGE_CHANGED" ] || [ "$1" == "--install" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    ssh -i "$KEY" "$SERVER" "cd $REMOTE_DIR && npm install --production"
else
    echo -e "${GREEN}No dependency changes detected. Skipping npm install.${NC}"
fi

# 4. Check if Prisma schema changed (sync database if needed)
echo -e "\n${BLUE}🗄️  Checking database schema...${NC}"
PRISMA_CHANGED=$(ssh -i "$KEY" "$SERVER" "cd $REMOTE_DIR && git diff --name-only HEAD~1 HEAD 2>/dev/null | grep prisma/schema.prisma || echo ''")
if [ -n "$PRISMA_CHANGED" ] || [ "$1" == "--migrate" ]; then
    echo -e "${YELLOW}Syncing database schema...${NC}"
    ssh -i "$KEY" "$SERVER" "cd $REMOTE_DIR && npx prisma db push --skip-generate"
else
    echo -e "${GREEN}No schema changes detected. Skipping database sync.${NC}"
fi

# 5. Restart PM2
echo -e "\n${BLUE}🔄 Restarting server with PM2...${NC}"
ssh -i "$KEY" "$SERVER" "cd $REMOTE_DIR && npx pm2 restart oauth-server"

# Wait a bit for server to start
sleep 3

# 6. Check status
echo -e "\n${BLUE}✅ Checking server status...${NC}"
ssh -i "$KEY" "$SERVER" "cd $REMOTE_DIR && npx pm2 status"

# 7. Test server endpoint
echo -e "\n${BLUE}🧪 Testing server health...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://136.114.70.164:3000 || echo "000")
if [ "$HTTP_STATUS" == "200" ] || [ "$HTTP_STATUS" == "302" ]; then
    echo -e "${GREEN}✅ Server is responding! (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  Server responded with HTTP $HTTP_STATUS${NC}"
fi

# 8. Show recent logs
echo -e "\n${BLUE}📝 Recent logs (last 20 lines):${NC}"
ssh -i "$KEY" "$SERVER" "cd $REMOTE_DIR && npx pm2 logs oauth-server --lines 20 --nostream"

echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Server URL:${NC} http://136.114.70.164:3000"
echo -e "${BLUE}View logs:${NC} ssh -i $KEY $SERVER 'cd $REMOTE_DIR && npx pm2 logs oauth-server'"
echo -e "${BLUE}View status:${NC} ssh -i $KEY $SERVER 'cd $REMOTE_DIR && npx pm2 status'"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
