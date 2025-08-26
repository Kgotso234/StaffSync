const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const { verifyToken } = require("../middleware/auth");


// NEW — public (no verifyToken)
router.post("/", employeeController.addEmployee);

//get employees
router.get("/", verifyToken, employeeController.getEmployees);
//login
router.post("/login", employeeController.login);
module.exports = router;