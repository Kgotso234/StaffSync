const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
    departmentName: {type: String, required: true},
    companyId: {type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true}
}, {timestamps: true});

module.exports = mongoose.model("Department", departmentSchema);