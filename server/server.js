
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("FinTrack API is running!");
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`FinTrack server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}

startServer();
