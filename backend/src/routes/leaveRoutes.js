const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Leave = require("../models/leave");
const { verifyToken } = require("../middleware/auth");
const leaveController = require("../controllers/leaveController");

// Apply for leave
router.post("/apply", verifyToken, leaveController.applyLeave);
//view all leaves
router.get("/get-leaves", verifyToken, leaveController.getAllLeaves);



router.get("/employee/:employeeId", verifyToken, async (req, res) => {
  try {
    const employeeId = new mongoose.Types.ObjectId(req.params.employeeId);
    const leaves = await Leave.find({ employeeId })
      .select("startDate endDate status");
    res.json(leaves);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;