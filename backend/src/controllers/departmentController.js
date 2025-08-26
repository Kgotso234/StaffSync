const Department = require("../models/department");
const mongoose = require("mongoose");


// POST: Create a department (protected)
exports.createDepartment = async (req, res) => {
    const { departmentName } = req.body;
    const  companyId  = req.companyId;

    if (!departmentName) {
        return res.status(400).json({ error: "Department name is required" });
    }

    try {
        const newDepartment = new Department({
            departmentName,
            companyId,
        });

        await newDepartment.save();
        res.status(201).json({
            message: "Department created successfully",
            department: newDepartment,
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// GET: Fetch all departments for logged-in company (protected)
exports.getDepartmentsForCompany = async (req, res) => {
    try {
        const companyId  = req.companyId; 

        if(!companyId) {
            return res.status(400).json({message: "company id is required"});
        }

        const departments = await Department.find({companyId});
        res.status(200).json({ departments });
    } catch (err) {
        console.error("Error fetching department.", err);
        res.status(500).json({message: "Server Error"});
    }
};

// GET: Fetch departments by companyId (public)

exports.getDepartmentsByCompanyId = async (req, res) => {
    try {
        const { companyId } = req.params;
        
        const departments = await Department.find({ companyId });
        
        res.status(200).json(departments);
    } catch (error) {
        console.error("Error fetching departments:", error);
        res.status(500).json({ error: "Failed to fetch departments" });
    }
};
