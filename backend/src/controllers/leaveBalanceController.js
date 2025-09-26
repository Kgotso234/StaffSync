const leaveBalance = require('../models/leaveBalance');
const Employee = require('../models/Employees');
const LeaveType = require('../models/leaveTypes');

// Get leave balances for a specific employee
exports.getLeaveBalance = async (req, res) => {
    try {
       const employeeId = req.params.employeeId;  // <-- use params, not req.employeeId
        //console.log("Fetching leave balance for employee ID:", employeeId);
        if (!employeeId) {
            return res.status(400).json({ message: "Employee ID required" });
            }

        const balance = await leaveBalance.find({ employeeId })
                    .populate('leaveTypeId', 'name')
                    .exec();

        if (!balance || balance.length === 0) {
            return res.status(404).json({ message: 'No leave balance found for this employee' });
        }

        res.status(200).json({ balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
