const mongoose = require("mongoose");

const leaveBalanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employees",
        required: true,
    },
    leaveTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "leaveTypes",
        required: true,
    }, allocatedDays: {
        type: Number,
        required: true,
        default: 0, //total allocated per year
    }, takenDays: {
        type: Number,
        required: true,
        default: 0, //how many days used
    },remainingDays: {
        type: Number,
        required: true,
        default: 0,  // auto = allocated - taken
    }, year: {
        type: Number,
        required: true,
        default: new Date().getFullYear()
    }
}, { timestamps: true});

module.exports = mongoose.model("leaveBalance", leaveBalanceSchema);