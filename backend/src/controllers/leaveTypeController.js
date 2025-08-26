
const LeaveTypes = require("../models/leaveTypes");

exports.getLeaveTypes = async (req, res) => {
  try {
    const companyId = req.companyId; // get companyId from logged-in user
    //console.log("CompanyId from token:", companyId);

    const leaveTypes = await LeaveTypes.find({ companyId, isActive: true });
    res.json(leaveTypes);
  } catch (err) {
    console.error("Fetch leave types error:", err);
    res.status(500).json({ error: "Server error while fetching leave types" });
  }
};
