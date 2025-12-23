# OAuth Server - Deployment Guide

## 📋 Mục lục

1. [Quick Start](#-quick-start)
2. [Local Development](#-local-development-test-trên-máy)
3. [Kết nối Server](#-kết-nối-server)
4. [Deploy Code Mới](#-deploy-code-mới)
5. [Xem Logs](#-xem-logs--monitor)
6. [Quản lý Server](#-quản-lý-server-với-pm2)
7. [Quản lý MySQL Database](#️-quản-lý-mysql-database)
8. [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

### Setup lần đầu

```bash
# 1. Clone repository
git clone <repo-url>
cd SE2025-2.1

# 2. Nhận file server-key.pem từ team lead và đặt vào project root

# 3. Set permissions
chmod 600 server-key.pem
chmod +x deploy-to-server.sh

# 4. Deploy!
./deploy-to-server.sh
```

---

## 💻 Local Development (Test trên máy)

### Quick Start - Chạy local

```bash
# Tất cả trong một lệnh!
npm run docker:start
```

Script này sẽ tự động:
1.  Khởi động MySQL container (Docker)
2.  Đợi MySQL sẵn sàng
3.  Sync database schema (Prisma)
4.  Chạy dev server (port 3000)

Sau đó truy cập: **http://localhost:3000**

### Các lệnh hữu ích khi dev

```bash
# Chỉ chạy dev server (MySQL đã khởi động)
npm run dev

# Sync database schema
npm run db:push

# Build production
npm run build

# Chạy production build
npm start
```

### Kiểm tra MySQL local

```bash
# Kết nối MySQL
docker exec -it mysql_oauth mysql -uroot asset3d_db

# Xem tables
docker exec -i mysql_oauth mysql -uroot asset3d_db -e "SHOW TABLES;"

# Xem logs
docker logs mysql_oauth
```

### Stop/Restart MySQL

```bash
cd docker

# Stop
docker compose down

# Restart
docker compose restart
```

---

## 🔐 Kết nối Server

### Thông tin Server

- **IP**: 136.114.70.164
- **User**: se2025_2_1
- **SSH Key**: server-key.pem
- **Server Path**: ~/oauth-server/
- **Port**: 3000
- **URL**: http://136.114.70.164:3000

### SSH vào Server

```bash
ssh -i server-key.pem se2025_2_1@136.114.70.164
```

### Setup SSH Key (Lần đầu)

File `server-key.pem` phải có quyền 600:

```bash
chmod 600 server-key.pem
```

>  **Lưu ý**: File `server-key.pem` đã có trong `.gitignore`. KHÔNG commit file này lên Git.

---

## 📦 Deploy Code Mới

### Phương pháp 1: Automated Script (Khuyến nghị)

```bash
./deploy-to-server.sh
```

Script tự động:
-  Backup trên server
-  Sync code
-  Install dependencies (nếu cần)
-  Sync database (nếu cần)
-  Restart PM2
-  Health check

**Options:**
```bash
./deploy-to-server.sh --install  # Force install dependencies
./deploy-to-server.sh --migrate  # Force database sync
```

### Phương pháp 2: Manual với SCP

```bash
# Upload code
scp -i server-key.pem -r src/ se2025_2_1@136.114.70.164:~/oauth-server/

# Restart server
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'cd ~/oauth-server && npx pm2 restart oauth-server'
```

### Phương pháp 3: Manual với RSYNC (Nhanh hơn)

```bash
# Sync code
rsync -avz --delete \
  --exclude 'node_modules' --exclude 'logs' --exclude '.env' \
  -e "ssh -i server-key.pem" \
  . se2025_2_1@136.114.70.164:~/oauth-server/

# Restart server
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'cd ~/oauth-server && npx pm2 restart oauth-server'
```

---

## Xem Logs & Monitor

### Xem logs real-time

```bash
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'cd ~/oauth-server && npx pm2 logs oauth-server'
```

Nhấn `Ctrl+C` để thoát.

### Xem logs (50 dòng cuối)

```bash
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'cd ~/oauth-server && npx pm2 logs oauth-server --lines 50 --nostream'
```

### Xem logs từ file

```bash
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'cat ~/oauth-server/logs/out-0.log'

ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'cat ~/oauth-server/logs/err-0.log'
```

### Monitor (Interactive Dashboard)

```bash
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'cd ~/oauth-server && npx pm2 monit'
```

---

## Quản lý Server với PM2

### Xem trạng thái

```bash
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'cd ~/oauth-server && npx pm2 status'
```

### Restart server

```bash
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'cd ~/oauth-server && npx pm2 restart oauth-server'
```

### Stop server

```bash
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'cd ~/oauth-server && npx pm2 stop oauth-server'
```

### Start server

```bash
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'cd ~/oauth-server && npx pm2 start oauth-server'
```

### Reload (Zero downtime)

```bash
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'cd ~/oauth-server && npx pm2 reload oauth-server'
```

---

## Quản lý MySQL Database

### Kết nối MySQL trong Docker

#### Từ server (SSH vào server trước)

```bash
# SSH vào server
ssh -i server-key.pem se2025_2_1@136.114.70.164

# Kết nối MySQL
docker exec -it mysql_oauth mysql -uroot asset3d_db
```

#### Từ máy local (remote connection)

```bash
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'docker exec -i mysql_oauth mysql -uroot asset3d_db -e "SHOW TABLES;"'
```

### Xem dữ liệu trong database

#### Xem danh sách databases

```bash
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'docker exec -i mysql_oauth mysql -uroot -e "SHOW DATABASES;"'
```

#### Xem danh sách tables

```bash
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'docker exec -i mysql_oauth mysql -uroot asset3d_db -e "SHOW TABLES;"'
```

#### Xem structure của table

```bash
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'docker exec -i mysql_oauth mysql -uroot asset3d_db -e "DESCRIBE User;"'
```

#### Xem dữ liệu trong table

```bash
# Xem tất cả records
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'docker exec -i mysql_oauth mysql -uroot asset3d_db -e "SELECT * FROM User;"'

# Xem 10 records đầu tiên
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'docker exec -i mysql_oauth mysql -uroot asset3d_db -e "SELECT * FROM User LIMIT 10;"'

# Đếm số lượng records
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'docker exec -i mysql_oauth mysql -uroot asset3d_db -e "SELECT COUNT(*) FROM User;"'

# Tìm kiếm theo điều kiện
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'docker exec -i mysql_oauth mysql -uroot asset3d_db -e "SELECT * FROM User WHERE email LIKE '\''%@gmail.com'\'';"'
```

### MySQL Interactive Mode

```bash
# SSH vào server
ssh -i server-key.pem se2025_2_1@136.114.70.164

# Vào MySQL shell
docker exec -it mysql_oauth mysql -uroot asset3d_db

# Trong MySQL shell, bạn có thể chạy:
mysql> SHOW TABLES;
mysql> SELECT * FROM User LIMIT 5;
mysql> DESCRIBE User;
mysql> SELECT email, name FROM User WHERE verified = 1;
mysql> EXIT;  # Để thoát
```

### Export/Import Database

#### Export database

```bash
# Export toàn bộ database
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'docker exec mysql_oauth mysqldump -uroot asset3d_db > ~/backup_$(date +%Y%m%d).sql'

# Download về local
scp -i server-key.pem se2025_2_1@136.114.70.164:~/backup_*.sql ./
```

#### Import database

```bash
# Upload file SQL lên server
scp -i server-key.pem backup.sql se2025_2_1@136.114.70.164:~/

# Import vào database
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'docker exec -i mysql_oauth mysql -uroot asset3d_db < ~/backup.sql'
```

### Quản lý MySQL Container

#### Xem logs của MySQL

```bash
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'docker logs mysql_oauth'

# Tail logs (real-time)
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'docker logs -f mysql_oauth'
```

#### Restart MySQL container

```bash
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'cd ~/oauth-server/docker && docker compose restart mysql'
```

#### Kiểm tra MySQL status

```bash
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'docker exec mysql_oauth mysqladmin -uroot status'
```

### Prisma Database Commands

#### View database schema

```bash
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'cd ~/oauth-server && npx prisma db pull'
```

#### Sync schema với database

```bash
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'cd ~/oauth-server && npx prisma db push'
```

#### Open Prisma Studio (Database GUI)

```bash
# SSH với port forwarding
ssh -i server-key.pem -L 5555:localhost:5555 se2025_2_1@136.114.70.164

# Trên server, chạy:
cd ~/oauth-server
npx prisma studio

# Mở browser local: http://localhost:5555
```

### Tips & Tricks

#### Pretty print output

```bash
# Thêm -t flag để có table format đẹp hơn
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'docker exec -it mysql_oauth mysql -uroot asset3d_db -t -e "SELECT * FROM User LIMIT 5;"'
```

#### Save query results to file

```bash
# Lưu kết quả vào file CSV
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'docker exec mysql_oauth mysql -uroot asset3d_db -e "SELECT * FROM User;" | sed "s/\t/,/g" > ~/users.csv'

# Download về
scp -i server-key.pem se2025_2_1@136.114.70.164:~/users.csv ./
```

---

## Troubleshooting

### "Permission denied (publickey)"

```bash
chmod 600 server-key.pem
```

### "deploy-to-server.sh: Permission denied"

```bash
chmod +x deploy-to-server.sh
```

### Server không phản hồi sau deploy

```bash
# Xem logs
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'cd ~/oauth-server && npx pm2 logs oauth-server --lines 100'

# Restart
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'cd ~/oauth-server && npx pm2 restart oauth-server'
```

### MySQL không chạy

```bash
# SSH vào server
ssh -i server-key.pem se2025_2_1@136.114.70.164

# Kiểm tra MySQL
docker ps | grep mysql_oauth

# Khởi động MySQL
cd ~/oauth-server/docker
docker compose up -d

# Sync database
cd ~/oauth-server
npx prisma db push --skip-generate
```

### Port 3000 đã được sử dụng

```bash
# Kiểm tra process nào đang dùng port
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'sudo lsof -i :3000'

# Hoặc
ssh -i server-key.pem se2025_2_1@136.114.70.164 \
  'sudo netstat -tulpn | grep 3000'
```

---

## Project Structure

```
SE2025-2.1/
├── src/                    # Source code
├── prisma/                 # Database schema
├── docker/                 # Docker configs
│   ├── docker-compose.yml
│   └── start.sh
├── server-key.pem         # SSH key (KHÔNG commit)
├── deploy-to-server.sh    # Deploy script
├── ecosystem.config.js    # PM2 config (cho server)
├── package.json
├── README.md              # Project overview & goals
└── DEPLOYMENT.md          # This file - deployment guide
```

---

##  Important Notes

###  KHÔNG làm:

- Commit `server-key.pem` lên Git
- Share SSH key qua email/chat công khai
- Deploy từ feature branch
- Upload `.env` từ local lên server
- Hardcode đường dẫn tuyệt đối


## Workflow Chuẩn

```bash
# 1. Tạo feature branch
git checkout -b feature/my-feature

# 2. Code & test local
npm run dev

# 3. Commit & push
git add .
git commit -m "Add feature"
git push origin feature/my-feature

# 4. Tạo Pull Request và merge vào main

# 5. Deploy
git checkout main
git pull
./deploy-to-server.sh
```

---

## Security

- SSH key được share riêng, KHÔNG commit lên Git
- `.env` files chỉ tồn tại trên server
- Báo ngay nếu phát hiện security issue

---

## Support

Cần giúp đỡ?
- Liên hệ Team Lead
- Check logs với PM2
- Xem error messages chi tiết

---

**Happy Deploying!**
