const express = require("express");
const { nanoid } = require("nanoid");
const Url = require("../models/Url");

const router = express.Router();

// 🔹 Shorten URL
router.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ message: "URL required" });
  }

  // Basic spam detection
  if (originalUrl.includes("free-money") || originalUrl.length > 100) {
    return res.status(400).json({ message: "⚠️ Suspicious URL detected!" });
  }

  const shortId = nanoid(6);

  const newUrl = new Url({
    originalUrl,
    shortId
  });

  await newUrl.save();

  res.json({ shortUrl: `http://localhost:5000/${shortId}` });
});

// 🔹 Redirect
router.get("/:id", async (req, res) => {
  const url = await Url.findOne({ shortId: req.params.id });

  if (!url) return res.status(404).send("Not found");

  url.clicks++;

  if (url.clicks > 50) {
    console.log("⚠️ Suspicious traffic detected!");
  }

  await url.save();

  res.redirect(url.originalUrl);
});

module.exports = router;