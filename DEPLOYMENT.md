# OAuth Server - Deployment Guide

## 🔐 SSH Access

```bash
ssh -i server-key.pem se2025_2_1@136.114.70.164
```

## 🚀 Starting Server

### Option 1: Production Mode (Recommended)
```bash
cd ~/oauth-server

# Build and start
npm run build
npm start
```

### Option 2: Development Mode
```bash
cd ~/oauth-server
npm run dev
```

### Option 3: With Docker (auto-start MySQL)
```bash
cd ~/oauth-server
npm run docker:start
```

## 🛑 Stopping Server

```bash
# If running in terminal: Ctrl + C

# If using PM2:
pm2 stop oauth-server
pm2 delete oauth-server
```

## 📊 Check Server Status

```bash
# Check if server is running
ps aux | grep node

# Check port 3000
netstat -tlnp | grep 3000

# Check Nginx
sudo systemctl status nginx

# Test from server
curl http://localhost:3000
```

## 🌐 Access URL

**Public URL:** http://136.114.70.164

## 📝 Common Tasks

### Update Code
```bash
# On local machine
./deploy.sh 136.114.70.164 server-key.pem

# On server
cd ~/oauth-server
npm install
npm run build
# Restart server
```

### View Logs
```bash
# If running with npm start/dev: check terminal

# If using PM2:
pm2 logs oauth-server
```

### Restart Nginx
```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

### Check Database
```bash
# Check MySQL container
docker ps | grep mysql

# Access MySQL
docker exec -it mysql_oauth mysql -uroot asset3d_db
```

## 🐛 Troubleshooting

### Server not accessible from browser
1. Check if Node.js is running: `ps aux | grep node`
2. Check if Nginx is running: `sudo systemctl status nginx`
3. Check if port 3000 is listening: `netstat -tlnp | grep 3000`

### Database connection error
1. Check MySQL container: `docker ps`
2. Start MySQL: `cd ~/oauth-server && docker compose -f docker/docker-compose.yml up -d`
3. Run migrations: `npx prisma db push`

### Email not sending
1. Check SMTP settings in `.env`
2. Verify Gmail App Password is correct
3. Check logs for email errors

## 📂 Important Files

- **Environment**: `~/oauth-server/.env`
- **Nginx Config**: `/etc/nginx/sites-available/oauth`
- **Logs**: Terminal output or `pm2 logs`
- **Database**: Docker volume `~/oauth-server/docker/mysql_data`

## 🔄 Complete Restart

```bash
# Stop everything
pm2 stop all  # or Ctrl+C if running in terminal
docker compose -f docker/docker-compose.yml down

# Start everything
docker compose -f docker/docker-compose.yml up -d
npm run build
npm start
```



# SSH vào server
ssh -i server-key.pem se2025_2_1@136.114.70.164

# Vào thư mục project
cd ~/oauth-server

# Xem trạng thái
npx pm2 status

# Xem logs (real-time)
npx pm2 logs oauth-server

# Xem logs (30 dòng cuối)
npx pm2 logs oauth-server --lines 30 --nostream

# Restart server
npx pm2 restart oauth-server

# Stop server
npx pm2 stop oauth-server

# Start server
npx pm2 start oauth-server

# Delete process khỏi PM2
npx pm2 delete oauth-server



# SSH vào server
ssh -i server-key.pem se2025_2_1@136.114.70.164

# Setup PM2 startup (cần sudo)
npx pm2 startup
# Chạy lệnh mà PM2 gợi ý