const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const port = 3001;

app.use(cors());

app.use(
  "/proxy",
  createProxyMiddleware({
    target: "https://firebasestorage.googleapis.com",
    changeOrigin: true,
    pathRewrite: {
      "^/proxy": "/",
    },
  })
);

// Add a route to handle POST requests to /proxy
app.post("/proxy", (req, res) => {
  // Handle the POST request here
  res.send("POST request to /proxy");
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
