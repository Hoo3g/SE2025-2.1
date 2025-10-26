import { layout } from './layout.js';

// 🔹 Login Form
export function loginForm(err?: string, redirect_url?: string) {
  return layout('Đăng nhập', `
    <h1>Đăng nhập</h1>
    ${err ? `<p class="error">${err}</p>` : ''}
    <form method="POST" action="/login">
      <input type="hidden" name="redirect_url" value="${redirect_url ?? ''}"/>
      <label>Email <input type="email" name="email" required /></label>
      <label>Mật khẩu <input type="password" name="password" required /></label>
      <button type="submit">Đăng nhập</button>
    </form>
    <p class="muted">Chưa có tài khoản? <a href="/signup">Đăng ký</a></p>
  `);
}

// 🔹 Signup Form
export function signupForm(err?: string) {
  return layout('Đăng ký', `
    <h1>Đăng ký</h1>
    ${err ? `<p class="error">${err}</p>` : ''}
    <form method="POST" action="/signup">
      <label>Email <input type="email" name="email" required /></label>
      <label>Mật khẩu <input type="password" name="password" minlength="8" required /></label>
      <button type="submit">Tạo tài khoản</button>
    </form>
    <p class="muted">Đã có tài khoản? <a href="/login">Đăng nhập</a></p>
  `);
}

// 🔹 Change Password Form
export function changePasswordForm(message?: string, asError?: boolean) {
  return layout('Đổi mật khẩu', `
    <h1>Đổi mật khẩu</h1>
    ${message ? `<p class="${asError ? 'error' : 'success'}">${message}</p>` : ''}
    <form method="POST" action="/change-password">
      <label>Email <input type="email" name="email" required /></label>
      <label>Mật khẩu hiện tại <input type="password" name="current_password" required /></label>
      <label>Mật khẩu mới <input type="password" name="new_password" minlength="8" required /></label>
      <button type="submit">Cập nhật</button>
    </form>
  `);
}
export { layout };

