const Notification = require("../models/Notifications");

//save and emit notification
exports.createNotification = async (req, res) => {
    try {
        const { recipientId, senderId, type, message, data } = req.body;
        
        const notification = new Notification({
            recipientId,
            senderId,
            type,
            message,
            data
        });

        await notification.save();

        //emit via socket.io
        req.io.to(recipientId.toString()).emit("newNotification", notification);

        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};


// Fetch notifications for logged-in user
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.employeeId || req.companyId; // employee or admin
        if (!userId) return res.status(400).json({ error: "User ID missing" });

        const notifications = await Notification.find({ recipientId: userId })
            .sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Mark as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            id, 
            { isRead: true }, 
            { new: true }
        );
        res.json(notification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Clear all notifications for logged-in user
exports.clearNotifications = async (req, res) => {
    try {
        const userId = req.employeeId || req.companyId;
        if (!userId) return res.status(400).json({ error: "User ID missing" });
        console.log("Clearing notifications for userId:", userId); 

        await Notification.deleteMany({ recipientId: userId });
        res.json({ message: "All notifications cleared" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Delete a single notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params; // notification ID

    const deleted = await Notification.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
