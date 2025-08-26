
const Employee = require("../models/Employees");
const Leave = require("../models/leave");

exports.getDashboardStats = async (req, res) => {
    try {
        const companyId = req.companyId; // comes from JWT middleware

        // Total team members
        const totalEmployees = await Employee.countDocuments({ companyId });

        // On leave today
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const employeesOnLeave = await Leave.countDocuments({
            companyId,
            status: "Approved",
            startDate: { $lte: endOfDay },
            endDate: { $gte: startOfDay }
        });
        //console.log("Employees on leave", employeesOnLeave);
        // Pending requests
        const pendingRequests = await Leave.countDocuments({
            companyId,
            status: "Pending"
        });
        //console.log("Pending Requests Docs:", pendingRequests);

        res.json({
            totalEmployees,
            employeesOnLeave,
            pendingRequests
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
