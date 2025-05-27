require("dotenv").config();
const mongoose = require("mongoose");
const PROPERTY = require("./models/property");
const properties = require("./data.json");

const populate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "toriigate" });
    await PROPERTY.deleteMany();
    await PROPERTY.create(properties);
    console.log("properties added");
  } catch (error) {
    console.log(error);
  }
};

populate();
