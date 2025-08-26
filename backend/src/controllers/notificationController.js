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
        req.io.to(receiverId.toString()).emit("newNotification", notification);

        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

//fetch all for admin(companyId)
exports.getNotifications = async (req, res) =>{
    try{
        const companyId = req.companyId;
        const notifications = await Notification.find({ recipientId: companyId }).sort({ createdAt: -1});
        
        res.json(notifications);
    }catch(error){
        res.status(500).json({ error: error.message});
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

// Clear all for a company
exports.clearNotifications = async (req, res) => {
    try {
        const { companyId } = req.params;
        await Notification.deleteMany({ recipientId: companyId });
        res.json({ message: "All notifications cleared" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};