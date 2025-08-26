
const express = require("express");
const router = express.Router();
const { getLeaveUsage } = require("../controllers/leaveReportController");
const {getDashboardStats} = require("../controllers/leaveReportController");
const { verifyToken } = require("../middleware/auth");

router.get("/leave-usage",verifyToken, getLeaveUsage);

router.get("/dashboard-stats",verifyToken, getDashboardStats);

module.exports = router;
