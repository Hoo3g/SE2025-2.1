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
1. ✅ Khởi động MySQL container (Docker)
2. ✅ Đợi MySQL sẵn sàng
3. ✅ Sync database schema (Prisma)
4. ✅ Chạy dev server (port 3000)

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

> ⚠️ **Lưu ý**: File `server-key.pem` đã có trong `.gitignore`. KHÔNG commit file này lên Git.

---

## 📦 Deploy Code Mới

### Phương pháp 1: Automated Script (Khuyến nghị)

```bash
./deploy-to-server.sh
```

Script tự động:
- ✅ Backup trên server
- ✅ Sync code
- ✅ Install dependencies (nếu cần)
- ✅ Sync database (nếu cần)
- ✅ Restart PM2
- ✅ Health check

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

## 📊 Xem Logs & Monitor

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

## 🎛️ Quản lý Server với PM2

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

## 🗄️ Quản lý MySQL Database

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

## 🆘 Troubleshooting

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

## 📁 Project Structure

```
SE2025-2.1/
├── src/                    # Source code
├── prisma/                 # Database schema
├── docker/                 # Docker configs
│   ├── docker-compose.yml
│   └── start.sh
├── server-key.pem         # ⚠️ SSH key (KHÔNG commit)
├── deploy-to-server.sh    # Deploy script
├── ecosystem.config.js    # PM2 config (cho server)
├── package.json
└── README.md              # This file
```

---

## ⚠️ Important Notes

### ❌ KHÔNG làm:

- Commit `server-key.pem` lên Git
- Share SSH key qua email/chat công khai
- Deploy từ feature branch
- Upload `.env` từ local lên server
- Hardcode đường dẫn tuyệt đối

### ✅ LUÔN làm:

- Test local trước khi deploy
- Kiểm tra logs sau deploy
- Deploy từ `main` branch
- Thông báo team trước khi deploy production

---

## 🔄 Workflow Chuẩn

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

## 🔒 Security

- SSH key được share riêng, KHÔNG commit lên Git
- `.env` files chỉ tồn tại trên server
- Báo ngay nếu phát hiện security issue

---

## 📞 Support

Cần giúp đỡ?
- Liên hệ Team Lead
- Check logs với PM2
- Xem error messages chi tiết

---

**Happy Deploying! 🚀**


# Goals and Objectives

## Mục tiêu tổng quát
- Xây dựng hệ thống Identity Provider theo chuẩn OAuth 2.0 và OpenID Connect để quản lý danh tính người dùng tập trung.
- Cung cấp nền tảng xác thực an toàn, dễ tích hợp với các ứng dụng bên ngoài thông qua giao thức chuẩn.
- Hỗ trợ quy trình quản lý tài khoản đầy đủ (đăng ký, xác thực email, đăng nhập, cập nhật hồ sơ, đổi mật khẩu).

## Mục tiêu cụ thể
- Xây dựng các API nội bộ cho đăng ký, đăng nhập, xác thực email, cập nhật hồ sơ và đổi mật khẩu.
- Triển khai luồng OAuth2 Authorization Code và các endpoint chuẩn OIDC (auth, token, jwks, userinfo, introspection, revocation).
- Lưu trữ người dùng, token và log hoạt động bằng MySQL thông qua Prisma.
- Bảo vệ hệ thống bằng JWT (HS256) và bcrypt hash mật khẩu, đảm bảo chỉ người đã xác thực email mới được đăng nhập.
- Cung cấp giao diện người dùng cho đăng ký, đăng nhập, xác thực email, hồ sơ và bảo mật tài khoản.

# 1. Giới thiệu dự án
Dự án xây dựng một máy chủ xác thực (Identity Provider) theo chuẩn OAuth 2.0 và OpenID Connect (OIDC), kết hợp với hệ thống đăng ký/đăng nhập nội bộ. Hệ thống đóng vai trò trung tâm quản lý danh tính, cấp phát token truy cập và cung cấp các endpoint chuẩn để các ứng dụng khác có thể tích hợp xác thực một cách thống nhất. Bên cạnh đó, dự án còn hỗ trợ các tính năng quản trị tài khoản người dùng như xác thực email, cập nhật hồ sơ và đổi mật khẩu.

# 2. Mục tiêu nghiệp vụ
- Người dùng đăng ký tài khoản và phải xác thực email trước khi đăng nhập.
- Người dùng đăng nhập nhận JWT để truy cập các API nội bộ.
- Hỗ trợ đổi mật khẩu và cập nhật hồ sơ cá nhân.
- Cho phép client bên thứ ba dùng luồng OAuth2 Authorization Code và Refresh Token để đăng nhập qua IdP.

# 3. Công nghệ sử dụng
- Backend: Node.js, Express.
- OIDC/OAuth2: oidc-provider.
- ORM: Prisma.
- Database: MySQL.
- Bảo mật: JWT (HS256), bcrypt hash mật khẩu.
- Mail: Nodemailer (SMTP).
- Frontend: HTML/CSS/JS thuần.

# 4. Kiến trúc tổng thể
Hệ thống gồm 3 thành phần chính:
- Express server xử lý API nội bộ và phục vụ giao diện tĩnh.
- OIDC Provider xử lý các luồng chuẩn OAuth2/OIDC.
- Database MySQL lưu thông tin user, token, client và log.

# 5. Cơ sở dữ liệu
Schema chính (Prisma):
- users: thông tin người dùng (id, first_name, last_name, email, phone_number, password, role, status, avatar).
- verify_emails: token xác thực email và thời hạn.
- change_password: token reset mật khẩu.
- clients: thông tin client OAuth.
- tokens: access/refresh/authorization_code/id_token.
- logs: log hoạt động đăng nhập/ủy quyền.

# 6. API nội bộ (Custom API)
Base URL: /api

## 6.1 Auth API
POST /api/auth/signup
- Mục đích: đăng ký user mới.
- Body: email, password, first_name, last_name, phone_number.
- Logic: kiểm tra email trùng, validate mật khẩu, tạo user NOT_ACTIVE, sinh token verify email, gửi mail verify.
- Response: 201 Signup successful.

POST /api/auth/signin
- Mục đích: đăng nhập.
- Body: email, password, redirect_url.
- Logic: kiểm tra user tồn tại, status=ACTIVE, ký JWT HS256, redirect về redirect_url?token=...
- Response: redirect 302.

GET /api/auth/verify-email?token=...
- Mục đích: xác thực email.
- Logic: kiểm tra token, kiểm tra thời hạn, update user.status=ACTIVE, update verify_emails.verified_email=true.
- Response: JSON hoặc redirect verify-email.html.

## 6.2 Profile API
GET /api/user/profile
- Header: Authorization Bearer <token>
- Response: id, email, first_name, last_name, phone_number, avatar, email_verified.

PUT /api/user/profile
- Body: email?, first_name?, last_name?, phone_number?, avatar?
- Logic: update user data trong DB.

## 6.3 Password API
PUT /api/user/password
- Body: current_password, new_password.
- Logic: so sánh mật khẩu hiện tại, validate mật khẩu mới, update hash.

## 6.4 Token API
POST /api/token/refresh
- Body: refresh_token.
- Logic: verify refresh_token, sinh access_token mới, sinh refresh_token mới.
- Response: access_token, refresh_token.

POST /api/token/revoke
- Body: token, token_type_hint?
- Logic: xóa token trong DB.

# 7. OIDC/OAuth2 Endpoints chuẩn
Do oidc-provider cung cấp:
- /.well-known/openid-configuration
- /auth
- /token
- /jwks
- /userinfo
- /token/introspection
- /token/revocation
- /session/end
- /request

# 8. Luồng xử lý chính (chi tiết)
## 8.1 Luồng đăng ký
1) Người dùng gửi form đăng ký.
2) Backend validate dữ liệu, tạo user NOT_ACTIVE.
3) Sinh token xác thực email + lưu DB.
4) Gửi email xác thực (SMTP hoặc log).
5) Người dùng nhấn link, hệ thống cập nhật ACTIVE.

## 8.2 Luồng đăng nhập
1) Người dùng nhập email + password.
2) Backend kiểm tra ACTIVE và so khớp mật khẩu.
3) Ký JWT HS256.
4) Redirect về trang kèm token.

## 8.3 Luồng xác thực email
1) User click /auth/verify-email?token=...
2) Backend kiểm tra token và thời hạn.
3) Update status ACTIVE và verified_email=true.
4) Redirect sang verify-email.html.

## 8.4 Luồng cập nhật hồ sơ
1) Frontend gọi GET /api/user/profile.
2) User chỉnh sửa.
3) PUT /api/user/profile để lưu.

## 8.5 Luồng đổi mật khẩu
1) User nhập current + new password.
2) Backend validate và update hash.

## 8.6 Luồng OAuth2 Authorization Code
1) Client redirect user tới /auth.
2) User login qua UI tương tác.
3) User consent.
4) Provider trả authorization code và token.

# 9. Giao diện người dùng
- login.html: đăng nhập.
- signup.html: đăng ký.
- verify-email.html: xác thực email.
- account-profile.html: cập nhật hồ sơ.
- account-security.html: đổi mật khẩu.
- dashboard.html: trang tổng quan.

# 10. Kết luận
Dự án hoàn thiện các chức năng xác thực cơ bản theo chuẩn OAuth2/OIDC, tích hợp đầy đủ quy trình đăng ký, xác thực email, đăng nhập, quản lý hồ sơ và đổi mật khẩu. Hệ thống có thể mở rộng thêm các luồng OAuth2 khác hoặc tích hợp thêm các ứng dụng client trong tương lai.





