
const LeaveBalance = require("../models/leaveBalance");
const LeaveTypes = require("../models/leaveTypes");
const Employee = require("../models/Employees");
const Leave = require("../models/leave");

exports.getLeaveUsage = async (req, res) => {
  try {
    const  companyId  = req.companyId; // from auth middleware
    console.log("company id: ", companyId);

    // 1. Get all leave types for this company
    const leaveTypes = await LeaveTypes.find({ companyId, isActive: true });

    // 2. For each type, calculate usage
    const usage = await Promise.all(
      leaveTypes.map(async (lt) => {
        const balances = await LeaveBalance.find({ leaveTypeId: lt._id });

        let allocated = 0;
        let taken = 0;

        balances.forEach(b => {
          allocated += b.allocatedDays;
          taken += b.takenDays;
        });

        const percentage = allocated > 0 ? (taken / allocated) * 100 : 0;

        return {
          name: lt.name,
          percentage: percentage.toFixed(1), // e.g. 65.5
          taken,
          allocated
        };
      })
    );

    res.json({ success: true, usage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.getDashboardStats = async (req, res) => {
    try {
        const companyId  = req.companyId; 

        if (!companyId) {
            return res.status(400).json({ success: false, message: "No companyId found" });
        }

        //  Employees with low balances (e.g., less than 3 days left)
        const lowBalanceEmployees = await LeaveBalance.find({
            remainingDays: { $lt: 3 }, // threshold
        })
            .populate("employeeId", "e_fname e_lname")
            .limit(5); // limit for dashboard

        //  Upcoming approved leaves (next 7 days)
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const upcomingLeaves = await Leave.find({
            companyId,
            status: "Approved",
            startDate: { $lte: nextWeek },
            endDate: { $gte: today }
        })
            .populate("employeeId", "e_fname e_lname")
            .sort({ startDate: 1 })
            .limit(5);

        res.json({
            success: true,
            lowBalanceEmployees: lowBalanceEmployees.map(b => ({
                name: `${b.employeeId.e_fname} ${b.employeeId.e_lname}`,
                remainingDays: b.remainingDays
            })),
            upcomingLeaves: upcomingLeaves.map(l => ({
                name: `${l.employeeId.e_fname} ${l.employeeId.e_lname}`,
                startDate: l.startDate,
                endDate: l.endDate
            }))
        });

    } catch (err) {
        console.error("Dashboard fetch error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};