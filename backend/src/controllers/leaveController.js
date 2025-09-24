const Leave = require("../models/leave");
const leaveBalance = require("../models/leaveBalance");
const mongoose = require("mongoose");
const Notification = require("../models/Notifications");
const Employees = require("../models/Employees");
const { countWorkingDays } = require("../utils/workingDays");

exports.applyLeave = async (req, res) => {
    try {
        const employeeId = req.employeeId;
        const companyId = req.companyId;

        // console.log("empid: ", employeeId);
        // console.log("campanyId: ", companyId);

        if (!companyId || !employeeId) {
            return res.status(400).json({ message: "company or employee id is required" });
        }
        const {  leaveTypeId,  startDate, endDate, reason} = req.body;
        // console.log("Receiving data", req.body);
        if (!leaveTypeId) return res.status(400).json({ message: "Leave type is required" });
        if (!startDate) return res.status(400).json({ message: "Start date is required" });
        if (!endDate) return res.status(400).json({ message: "End date is required" });
        
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        //calculate total days
        const oneDay = 1000 * 60 * 60 * 24;
        const totalDays = await countWorkingDays(startDateObj, endDateObj, "ZA" );

        // Check leave balance
        const year = startDateObj.getFullYear();
        const balance = await leaveBalance.findOne({
            employeeId,
            leaveTypeId,
            year
        });

        if (!balance) {
            return res.status(400).json({ message: "Leave balance not found for this employee and leave type." });
        }

        if (totalDays > balance.remainingDays) {
            return res.status(400).json({ message: `You cannot apply for more than ${balance.remainingDays} day(s) of leave.` });
        }
        const newLeave = new Leave({
            employeeId,
            leaveTypeId,
            companyId,
            startDate: startDateObj,
            endDate: endDateObj,
            totalDays,
            reason,
            status: "Pending" //default
        });
        
        await newLeave.save(); 

        //create notification for admin (company)
        const notification = new Notification({
            recipientId: companyId,       // admin/company who will receive it
            senderId: employeeId,         // employee who applied for leave
            type: "LeaveApplication",     // must match enum in schema
            message: `New leave request from employee ${Employees.e_fname} for ${totalDays} day(s).`,
            data: {
                leaveId: newLeave._id,
                employeeId,
                startDate: startDateObj,
                endDate: endDateObj
            }
        });

        await notification.save();
        
        // Emit real-time event to admin via Socket.IO
        if (req.io) {
            req.io.to(companyId.toString()).emit("newNotification", notification);
        }
        res.status(201).json({message: "Leave applied successfully", leave: newLeave});
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message});
    }
};

exports.getAllLeaves =  async (req, res) => {
    try{
       const {employeeId, companyId} = req;
       

        if (!companyId || !employeeId) {
            return res.status(400).json({ message: "company or employee id is required" });
        }

        const leaves = await Leave.find({
            employeeId: new mongoose.Types.ObjectId(employeeId),
            companyId: new mongoose.Types.ObjectId(companyId)
        }).populate("leaveTypeId", "name"); 

        
        
        res.status(200).json({ leaves });
    } catch (err) {
        console.error("Error fetching leaves.", err);
        res.status(500).json({message: "Server Error"});
    }
};

//update leave only by admin
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { leaveId } = req.params;
        const { status } = req.body;

        //validate status
        const validateStatus = ["Approved", "Rejected"];
        if (!validateStatus.includes(status)){
            return res.status(400).json({ message: "Invalid status. Must be 'Approved' or 'Rejected'" });
        }

        //ensure we have companyId from logged-in admin
        const companyId = req.companyId;
        if (!companyId) {
            return res.status(403).json({ message: "Company ID missing from token" });
        }

        //find leave
        const leave = await Leave.findById(leaveId);
        if (!leave) {
            return res.status(404).json({ message: "Leave not found" });
        }

        //check if leave belong to this company
        if (leave.status !== "Pending") {
            return res.status(400).json({ message: "Only pending leaves can be updated" });
        }
        // Update status and optional manager comment
        leave.status = status;
        //if (managerComment) leave.managerComment = managerComment;
        leave.updatedAt = new Date();

        await leave.save();
        //create notification 
        const notification = new Notification({
            recipientId: leave.employeeId,       // employee who will receive it
            senderId: companyId,                 
            type: "LeaveDecision",  
            message: `Your leave request from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been ${status}.`,
            data: {
                leaveId: leave._id,
                status,
            }         
        });
        await notification.save();
        // Emit real-time event to employee via Socket.IO
        if (req.io) {
            req.io.to(leave.employeeId.toString()).emit("newNotification", notification);
        }
        res.status(200).json({ message: `Leave status updated to ${status}`, leave });
    } catch (error) {
        console.error("Error updating leave status:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get all pending leaves for admin's company
exports.getPendingLeaves = async (req, res) => {
    try {
        const companyId = req.companyId; // assuming admin info is stored in req.admin from auth middleware
        if (!companyId) {
            return res.status(403).json({ message: "Company ID missing from token" });
        }

        const leaves = await Leave.find({ companyId, status: "Pending" })
            .populate("employeeId", "e_fname e_lname e_number")  // get employee name and employee number
            .populate("leaveTypeId", "name")    // get leave type name
            .sort({ appliedAt: -1 });           // newest first
        //console.log(JSON.stringify(leaves, null, 2));

        res.status(200).json({ leaves });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getApprovedLeaves = async (req, res) => {
    try {
        const companyId = req.companyId; // assuming admin info is stored in req.admin from auth middleware
        if (!companyId) {
            return res.status(403).json({ message: "Company ID missing from token" });
        }

        const leaves = await Leave.find({ companyId, status: "Approved" })
            .populate("employeeId", "e_fname e_lname e_number")  // get employee name and employee number
            .populate("leaveTypeId", "name")    // get leave type name
            .sort({ appliedAt: -1 });           // newest first
        //console.log(JSON.stringify(leaves, null, 2));

        res.status(200).json({ leaves });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getRejectedLeaves = async (req, res) => {
    try {
        const companyId = req.companyId; // assuming admin info is stored in req.admin from auth middleware
        if (!companyId) {
            return res.status(403).json({ message: "Company ID missing from token" });
        }

        const leaves = await Leave.find({ companyId, status: "Rejected" })
            .populate("employeeId", "e_fname e_lname e_number")  // get employee name and employee number
            .populate("leaveTypeId", "name")    // get leave type name
            .sort({ appliedAt: -1 });           // newest first
        //console.log(JSON.stringify(leaves, null, 2));

        res.status(200).json({ leaves });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

