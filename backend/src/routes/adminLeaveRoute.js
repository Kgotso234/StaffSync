const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const leaveController = require("../controllers/leaveController");
const Leave = require("../models/leave");

//update status
router.patch("/update-status/:leaveId", verifyToken, leaveController.updateLeaveStatus);
// Fetch  leaves
router.get("/pending", verifyToken, leaveController.getPendingLeaves);
router.get("/approved", verifyToken, leaveController.getApprovedLeaves);
router.get("/rejected", verifyToken, leaveController.getRejectedLeaves);

// Get latest 5 leave applications
router.get("/latest", verifyToken, async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employeeId", "e_fname e_lname departmentId")
      .populate("leaveTypeId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ leaves });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get team availability for a given week
router.get("/availability", verifyToken, async (req, res) => {
  try {
    const { start, end } = req.query; // pass week start/end dates

    const leaves = await Leave.find({
      status: "Approved",
      $or: [
        { startDate: { $lte: new Date(end) }, endDate: { $gte: new Date(start) } }
      ]
    })
      .populate("employeeId", "e_fname e_lname")
      .populate("leaveTypeId", "name");

    res.json({ leaves });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;