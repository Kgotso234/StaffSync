const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    recipientId: { //admin
        type: mongoose.Schema.Types.ObjectId,
        ref:  "Company",
        require: true,
    },
    senderId: { //Employee
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employees",
        required: true
    },
    type: {
        type: String, 
        enum: ["LeaveApplication", "LeaveDecision"],
        required: true
    },
    message:{type: String, required: true},
    data: {type: Object }, //store leave details
    isRead: {type: Boolean, default: false}
}, {timestamps: true});

module.exports = mongoose.model("Notifications", notificationSchema);