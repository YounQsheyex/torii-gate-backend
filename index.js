require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const userRouter = require("./routes/userRouter");

// middleware
app.use(express.json());
app.use(cors());

// routes
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Torii Gate Serveer" });
});
app.use("/api/auth", userRouter);

// error route
app.use((req, res) => {
  res.status(404).json({ success: false, message: "ROUTE NOT FOUND" });
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "toriigate" });
    app.listen(PORT, () => {
      console.log(`App is running on port :${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};
startServer();
