const express = require("express");
const router = express.Router();
const { monthlySpend, currentMonthSummary } = require("../controllers/analytics.controller");
const authMiddleware = require("../middleware/auth");

router.get("/monthly-spend", authMiddleware, monthlySpend);
router.get("/current-month", authMiddleware, currentMonthSummary);

module.exports = router;