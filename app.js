// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const rateLimit = require("express-rate-limit");
// require("dotenv").config();

// const app = express();

// app.use(cors());
// app.use(express.json());

// // 🔐 Rate limiter (anti-hacker)
// const limiter = rateLimit({
//   windowMs: 1 * 60 * 1000,
//   max: 100
// });
// app.use(limiter);

// // Routes
// const urlRoutes = require("./routes/urlRoutes");
// app.use("/", urlRoutes);

// // DB connect
// mongoose.connect(process.env.MONGO_URI)
// .then(() => console.log("✅ MongoDB Connected"))
// .catch(err => console.log(err));

// app.listen(5000, () => console.log("🚀 Server running on port 5000"));