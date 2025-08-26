const mongoose = require("mongoose");
const department = require("./department");

const employeeSchema = new mongoose.Schema({
    e_fname: {
        type: String,
        required: true,
    },
    e_lname: {
        type: String,
        required: true,
    },
    e_number: {
        type: String,
        unique: true,
        required: true,
    },
    e_email: {
        type: String,
        unique: true,
        required: true,
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Employees", employeeSchema);
