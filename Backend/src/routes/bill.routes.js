const express = require("express");
const router = express.Router();
const { createBill, getBills, uploadAndExtractBill, updateBill } = require("../controllers/bill.controller");
const authMiddleware = require("../middleware/auth");
const upload = require("../config/multer");

router.post("/", authMiddleware, createBill);
router.get("/", authMiddleware, getBills);
router.post("/upload", authMiddleware, upload.single("file"), uploadAndExtractBill);
router.put("/:id", authMiddleware, updateBill);

module.exports = router;