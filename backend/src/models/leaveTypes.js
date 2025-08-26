const mongoose = require("mongoose");

const leaveTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // e.g. "Annual", "Sick", "Maternity"
    },
    description: {
        type: String,
        required: false, // optional explanation
    },
    defaultDays: {
        type: Number,
        required: true, // how many days allocated per year by default
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true, // can disable leave type without deleting it
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("LeaveTypes", leaveTypeSchema);
