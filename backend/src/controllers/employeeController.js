const department = require("../models/department");
const Employee = require("../models/Employees");
const LeaveTypes = require("../models/leaveTypes");
const leaveBalance = require("../models/leaveBalance"); // your leave balance model
const generateEmpNumber = require("../utils/generateEmpNumber");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

exports.addEmployee = async (req, res) => {
    try {
        const { e_fname, e_lname, e_email, departmentId, password, companyId } = req.body;

        // Generate unique employee number
        let e_number;
        let exists = true;
        while (exists) {
            e_number = generateEmpNumber();
            const existing = await Employee.findOne({ e_number });
            exists = !!existing;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new employee
        const newEmp = new Employee({
            e_fname,
            e_lname,
            e_email,
            departmentId: new mongoose.Types.ObjectId(departmentId),
            companyId,
            e_number,
            password: hashedPassword
        });

        await newEmp.save();

        // Get all active leave types for this company
        const leaveTypes = await LeaveTypes.find({ companyId, isActive: true });

        // Create leave balance for each type
        const year = new Date().getFullYear();
        const leaveBalances = leaveTypes.map(type => ({
            employeeId: newEmp._id,
            leaveTypeId: type._id,
            companyId: companyId,
            year: year,
            allocatedDays: type.defaultDays,
            takenDays: 0,
            remainingDays: type.defaultDays
        }));

        await leaveBalance.insertMany(leaveBalances);

        res.status(201).json({ message: "Employee added successfully", newEmp });

    } catch (error) {
        console.error("Error adding employee:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.getEmployees = async (req, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            return res.status(400).json({ message: "company id is required" });
        }

        const employees = await Employee.find({ companyId: new mongoose.Types.ObjectId(companyId) }).populate("departmentId", "departmentName");
        res.status(200).json({ employees });
    } catch (err) {
        console.error("Error fetching employees.", err);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.login = async (req, res) => {
    try {
        const { e_email, password } = req.body;

        // Check if user exists
        const employee = await Employee.findOne({ e_email });
        if (!employee) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Sign JWT
        const token = jwt.sign(
            { companyId: employee.companyId,
              employeeId: employee._id, 
              e_email: employee.e_email,
              e_number: employee.e_number
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ message: "Login successful", token, employee });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
