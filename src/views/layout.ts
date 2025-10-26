export function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${title}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      max-width: 480px;
      margin: 48px auto;
      padding: 0 16px;
      color: #111;
      background: #fafafa;
    }
    h1 {
      font-size: 24px;
      text-align: center;
      margin-bottom: 24px;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    input, button {
      font-size: 16px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 8px;
    }
    button {
      cursor: pointer;
      background: #111;
      color: #fff;
      transition: all 0.2s ease;
    }
    button:hover {
      background: #333;
    }
    .muted {
      color: #666;
      font-size: 14px;
      text-align: center;
    }
    .error {
      color: #b00020;
      text-align: center;
    }
    .success {
      color: #0a7d2a;
      text-align: center;
    }
    a {
      color: #0a58ca;
      text-decoration: none;
    }
  </style>
</head>
<body>
  ${body}
</body>
</html>`;
}
