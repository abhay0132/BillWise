const Bill = require("../models/Bill");
const mongoose = require("mongoose");

const monthlySpend = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const data = await Bill.aggregate([
      { $match: { userId } },

      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          totalSpend: { $sum: "$price" }
        }
      },

      { $sort: { "_id.year": 1, "_id.month": 1 } },

      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" }
                ]
              }
            ]
          },
          totalSpend: { $round: ["$totalSpend", 2] }
        }
      }
    ]);

    return res.status(200).json({ data });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to generate monthly spend analytics",
      error: err.message
    });
  }
};

const currentMonthSummary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const now = new Date();

    // ✅ UTC-safe month range
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const bills = await Bill.find({
      userId,
      date: { $gte: start, $lt: end }
    });

    const totalSpend = bills.reduce((sum, b) => sum + b.price, 0);

    return res.status(200).json({
      month: `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`,
      billsCount: bills.length,
      totalSpend: Number(totalSpend.toFixed(2))
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to generate current month summary",
      error: err.message
    });
  }
};

module.exports = { monthlySpend, currentMonthSummary };
