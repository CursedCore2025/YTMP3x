const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/downloads", express.static(path.join(__dirname, "downloads")));

if (!fs.existsSync("downloads")) fs.mkdirSync("downloads");

app.post("/download", async (req, res) => {
  const { url, format } = req.body;

  if (!url || !["mp3", "mp4"].includes(format)) {
    return res.json({ success: false, error: "Invalid request." });
  }

  const timestamp = Date.now();
  const filename = `video_${timestamp}.${format}`;
  const filepath = `downloads/${filename}`;
  const cmd =
    format === "mp3"
      ? `yt-dlp -x --audio-format mp3 -o "${filepath}" "${url}"`
      : `yt-dlp -f best -o "${filepath}" "${url}"`;

  exec(cmd, (err) => {
    if (err) {
      return res.json({ success: false, error: "Conversion failed." });
    }
    return res.json({
      success: true,
      downloadUrl: `http://localhost:3000/downloads/${filename}`
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
