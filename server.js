const express = require("express");
const app = express();
const PORT = 3000;
const fs = require("fs");
const path = require("path");

app.use(express.json());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.send('Welcome to video streaming app');
})
app.get("/video", (req, res) => {
  const videoFile = req.query.file;
  // Validate that a file is provided
  if (!videoFile) {
    return res.status(400).json({ error: "Missing file query parameter" });
  }
  // Build the full path to the video file
  const videoPath = `public/videos/${videoFile}`;
  //res.send(videoPath);
  // Check if the file exists
  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: "Video file not found" });
  }
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunkSize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });

    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
