const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split("?")[0];
  if (urlPath === "/") urlPath = "/index.html";

  // Handle extensionless URLs — try appending .html
  if (!path.extname(urlPath)) {
    const htmlPath = path.join(__dirname, urlPath + ".html");
    if (fs.existsSync(htmlPath)) urlPath = urlPath + ".html";
  }

  const filePath = path.join(__dirname, urlPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  console.log(`  ${req.method} ${urlPath} → ${filePath}`);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
      } else {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("500 Internal Server Error");
      }
      return;
    }

    const headers = {
      "Content-Type": contentType,
      "Supports-Loading-Mode": "credentialed-prerender",
      "Cache-Control": "no-store",
      "Cross-Origin-Opener-Policy": "same-origin",
    };

    res.writeHead(200, headers);
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  DevPulse demo running at http://localhost:${PORT}\n`);
  console.log(
    `  WITH speculation rules:    http://localhost:${PORT}/with-speculation.html`,
  );
  console.log(
    `  WITHOUT speculation rules: http://localhost:${PORT}/without-speculation.html\n`,
  );
  console.log("  Open in Chrome for Speculation Rules API support.\n");
});
