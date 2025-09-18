const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const leaveBalanceController = require("../controllers/leaveBalanceController");

// Route to get leave balances for a specific employee
router.get("/:employeeId", verifyToken, leaveBalanceController.getLeaveBalance);

module.exports = router;