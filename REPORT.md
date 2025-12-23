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
