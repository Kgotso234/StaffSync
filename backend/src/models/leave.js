const mongoose = require("mongoose");
const leaveBalance = require("./leaveBalance");
const Notification = require("./Notifications");

const leaveSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employees",
        required: true,
    },
    leaveTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LeaveTypes",
        required: true,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    totalDays: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected", "Cancelled"],
        default: "Pending",
    },
    managerComment: {
        type: String,
        required: false,
    },
    appliedAt: {
        type: Date,
        default: Date.now,
    },
    decisionAt: {
        type: Date,
    }
}, { timestamps: true });



/** Post-save: Adjust leave balance + Notify admin */
leaveSchema.post("save", async function(doc, next) {
    try {
        const year = new Date(doc.startDate).getFullYear();
        const balance = await leaveBalance.findOne({
            employeeId: doc.employeeId,
            leaveTypeId: doc.leaveTypeId,
            year
        });

        if (balance) {
            // Approved → deduct balance
            if (doc.status === "Approved" && this._previousStatus !== "Approved") {
                balance.takenDays += doc.totalDays;
                balance.remainingDays = balance.allocatedDays - balance.takenDays;
                await balance.save();
            }

            // Approved → Rejected/Cancelled → restore balance
            if ((doc.status === "Rejected" || doc.status === "Cancelled") && this._previousStatus === "Approved") {
                balance.takenDays -= doc.totalDays;
                if (balance.takenDays < 0) balance.takenDays = 0;
                balance.remainingDays = balance.allocatedDays - balance.takenDays;
                await balance.save();
            }
        }

        //  Notification only when leave is newly applied and Pending
        if (doc.isNew && doc.status === "Pending") {
            const notification = new Notification({
                recipientId: doc.companyId, // admin
                senderId: doc.employeeId,
                type: "LeaveApplication",
                message: `New leave application from employee`,
                data: {
                    leaveId: doc._id,
                    startDate: doc.startDate,
                    endDate: doc.endDate,
                    totalDays: doc.totalDays,
                    reason: doc.reason
                }
            });
            await notification.save();

            // emit real-time event
            const io = require("../server").io;
            io.to(doc.companyId.toString()).emit("newNotification", notification);
        }

    } catch (err) {
        console.error("Error in leave post-save hook:", err);
    }
    next();
});

module.exports = mongoose.model("Leave", leaveSchema);
