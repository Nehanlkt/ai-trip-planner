const { createServer } = require("http");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "../public");

const server = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    fs.createReadStream(path.join(PUBLIC_DIR, "index.html")).pipe(res);
  } else if (req.method === "POST" && req.url === "/plan") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const python = spawn("python", ["../backend/app.py"]);
      python.stdin.write(body);
      python.stdin.end();

      let output = "";
      python.stdout.on("data", (data) => (output += data.toString()));
      python.on("close", () => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(output);
      });
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
