const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
    c_name: {type: String, required: true, unique: true},
    c_email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
}, {timestamps: true});

module.exports = mongoose.model("Company", companySchema);