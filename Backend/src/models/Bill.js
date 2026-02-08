const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true
    },
    place: {
      type: String,
      required: [true, "Place is required"],
      trim: true,
      maxlength: [200, "Place name cannot exceed 200 characters"]
    },
    mode: {
      type: String,
      required: [true, "Payment mode is required"],
      enum: ["UPI", "Cash", "Card"],
      default: "UPI"
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"]
    },
    rawText: {
      type: String,
      maxlength: [5000, "Raw text cannot exceed 5000 characters"]
    },
    imagePath: {
      type: String,
      maxlength: [500, "Image path cannot exceed 500 characters"]
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient queries
billSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("Bill", billSchema);