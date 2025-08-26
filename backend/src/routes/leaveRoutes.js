const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const leaveController = require("../controllers/leaveController");

// Apply for leave
router.post("/apply", verifyToken, leaveController.applyLeave);
//view all leaves
router.get("/get-leaves", verifyToken, leaveController.getAllLeaves);

module.exports = router;