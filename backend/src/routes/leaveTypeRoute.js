const express = require("express");
const router = express.Router();
const leaveTypeController = require("../controllers/leaveTypeController"); // adjust path if needed
const { verifyToken } = require("../middleware/auth");

router.get("/leave-type", verifyToken, leaveTypeController.getLeaveTypes );

module.exports = router;
