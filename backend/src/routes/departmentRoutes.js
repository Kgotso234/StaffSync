const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const { verifyToken } = require("../middleware/auth");

// POST: Create a department (protected)
router.post("/", verifyToken, departmentController.createDepartment);

// GET: Get departments for authenticated company (protected)
router.get("/", verifyToken, departmentController.getDepartmentsForCompany);

// GET: Get departments by companyId (public, e.g. for registration dropdown)
router.get("/company/:companyId", departmentController.getDepartmentsByCompanyId);

module.exports = router;
