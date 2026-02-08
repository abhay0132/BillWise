const Bill = require("../models/Bill");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const mongoose = require("mongoose");

const createBill = async (req, res) => {
  try {
    const { place, mode, date, price } = req.body;

    if (!place || !mode || !date || price === undefined) {
      return res.status(400).json({ message: "Missing required bill fields" });
    }

    if (isNaN(price) || price < 0) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }

    const validModes = ["UPI", "Cash", "Card"];
    if (!validModes.includes(mode)) {
      return res.status(400).json({ message: "Invalid payment mode" });
    }

    const billDate = new Date(date);
    if (isNaN(billDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const bill = await Bill.create({
      userId: new mongoose.Types.ObjectId(req.user.userId),
      place: place.trim(),
      mode,
      date: billDate,
      price: parseFloat(price)
    });

    return res.status(201).json({ message: "Bill added", bill });
  } catch (err) {
    console.error("Create bill error:", err);
    return res.status(500).json({ message: "Failed to create bill", error: err.message });
  }
};

const getBills = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const total = await Bill.countDocuments({ userId: req.user.userId });

    const bills = await Bill.find({ userId: req.user.userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v");

    return res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      bills
    });
  } catch (err) {
    console.error("Get bills error:", err);
    return res.status(500).json({ message: "Failed to fetch bills", error: err.message });
  }
};

const uploadAndExtractBill = async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    filePath = req.file.path;

    // Validate file size
    const stats = fs.statSync(filePath);
    if (stats.size > 10 * 1024 * 1024) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "File too large. Maximum size is 10MB" });
    }

    console.log("Sending file to OCR service:", filePath);

    // Send file to OCR service
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const ocrRes = await axios.post("http://127.0.0.1:8000/ocr", form, {
      headers: form.getHeaders(),
      timeout: 30000
    });

    console.log("OCR response:", ocrRes.data);

    // Handle new response format
    const extracted = ocrRes.data.data || ocrRes.data;

    // Validate and sanitize extracted data
    const place = (extracted.place || "Unknown Place").trim().substring(0, 200);
    const mode = ["UPI", "Cash", "Card"].includes(extracted.mode) ? extracted.mode : "UPI";
    const price = !isNaN(extracted.price) && extracted.price >= 0 ? parseFloat(extracted.price) : 0;
    const date = extracted.date && !isNaN(new Date(extracted.date).getTime()) 
      ? new Date(extracted.date) 
      : new Date();

    // Save bill in MongoDB
    const bill = await Bill.create({
      userId: new mongoose.Types.ObjectId(req.user.userId),
      place,
      mode,
      date,
      price,
      rawText: (extracted.rawText || "").substring(0, 5000),
      imagePath: filePath
    });

    return res.status(201).json({
      message: "Bill extracted and saved successfully",
      extracted: { place, mode, date, price },
      bill
    });
  } catch (err) {
    console.error("OCR extraction error:", err.response?.data || err.message);
    
    // Clean up file on error
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr) {
        console.error("Error deleting file:", unlinkErr);
      }
    }

    // Better error message
    let errorMsg = "OCR extraction failed";
    if (err.code === "ECONNREFUSED") {
      errorMsg = "OCR service is not running. Please start the Python OCR service on port 8000.";
    } else if (err.response?.data?.detail) {
      errorMsg = err.response.data.detail;
    }

    return res.status(500).json({
      message: errorMsg,
      error: err.message
    });
  }
};

const updateBill = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid bill ID" });
    }

    const updateData = {};
    
    if (req.body.place) {
      updateData.place = req.body.place.trim().substring(0, 200);
    }
    
    if (req.body.mode) {
      const validModes = ["UPI", "Cash", "Card"];
      if (!validModes.includes(req.body.mode)) {
        return res.status(400).json({ message: "Invalid payment mode" });
      }
      updateData.mode = req.body.mode;
    }
    
    if (req.body.date) {
      const billDate = new Date(req.body.date);
      if (isNaN(billDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      updateData.date = billDate;
    }
    
    if (req.body.price !== undefined) {
      const price = parseFloat(req.body.price);
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ message: "Price must be a positive number" });
      }
      updateData.price = price;
    }

    const updated = await Bill.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Bill not found" });
    }

    return res.status(200).json({ message: "Bill updated successfully", bill: updated });
  } catch (err) {
    console.error("Update bill error:", err);
    return res.status(500).json({ message: "Failed to update bill", error: err.message });
  }
};

module.exports = { createBill, getBills, uploadAndExtractBill, updateBill };