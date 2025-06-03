const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const propertySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    bedroom: {
      type: Number,
      required: true,
      min: 0,
    },
    livingRoom: {
      type: Number,
      required: true,
      min: 0,
    },
    kitchen: {
      type: Number,
      required: true,
      min: 0,
    },
    toilet: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentPeriod: {
      type: String,
      enum: ["yearly", "monthly", "weekly"],
    },
    images: [String],
    availability: {
      type: String,
      enum: ["rented", "available"],
      default: "available",
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

const PROPERTY = mongoose.model("property", propertySchema);
module.exports = PROPERTY;
