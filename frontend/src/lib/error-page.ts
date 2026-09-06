export function renderErrorPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>500 - Server Error | Cell Care</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; text-align: center; }
    h1 { font-size: 3rem; margin-bottom: 0.5rem; color: #6366f1; }
    p { color: #94a3b8; margin-bottom: 1.5rem; }
    a { color: #6366f1; text-decoration: underline; }
  </style>
</head>
<body>
  <div>
    <h1>500</h1>
    <p>Something went wrong. Please try refreshing or return to the homepage.</p>
    <a href="/">Go to Homepage</a>
  </div>
</body>
</html>`;
}
