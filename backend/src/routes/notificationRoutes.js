const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const notificationController = require("../controllers/notificationController");


// Routes
router.post("/", notificationController.createNotification);
router.get("/get-notifications", verifyToken, notificationController.getNotifications);
router.patch("/:id/read", notificationController.markAsRead);


module.exports = router;