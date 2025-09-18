require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();  
app.use(cors());
app.use(express.json());
// Make io accessible in all requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

const companyRoutes = require("./src/routes/companyRoutes");
const departmentRoutes = require("./src/routes/departmentRoutes");
const employeeRoutes = require("./src/routes/employeeRoutes");
const leaveRoutes = require("./src/routes/leaveRoutes");
const leaveTypeRoute = require("./src/routes/leaveTypeRoute");
const adminLeaveRoute = require("./src/routes/adminLeaveRoute");
const notificationRoutes = require("./src/routes/notificationRoutes");
const adminDashboard = require("./src/routes/dashboardRoutes");
const AdminReport = require("./src/routes/reportRoutes");
const leaveBalanceRoute = require("./src/routes/leaveBalanceRoute");

// Serve static files from /frontend
app.use(express.static(path.join(__dirname, "../frontend")));

//  Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((e) => console.error("MongoDB connection error:", e));

// Auth pages
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/auth/login.html"));
});
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/auth/register.html"));
});

// Admin pages
app.get("/admin/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/admin/Dashboard.html"));
});
app.get("/admin/departments", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/admin/manage_department.html"));
});
app.get("/admin/employees", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/admin/manage_employee.html"));
});
app.get("/admin/leaves", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/admin/manage_leaves.html"));
});
app.get("/admin/settings", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/admin/setting.html"));
});

//employee pages
app.get("/employee/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/employee/Dashboard.html"));
});
app.get("/employee/apply", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/employee/leave_application.html"));
});
app.get("/employee/leave-history", (req, res) =>{
    res.sendFile(path.join(__dirname,"../frontend/employee/leave_history.html"));
});

// API routes for 
app.use("/", companyRoutes);
app.use("/register", employeeRoutes);
app.use("/companies", companyRoutes);
app.use("/departments", departmentRoutes);
app.use("/employees", employeeRoutes);
app.use("/leave", leaveRoutes);
app.use("/", leaveTypeRoute);
app.use("/admin/leaves", adminLeaveRoute);
app.use("/notifications", notificationRoutes);
app.use("/dashboard", adminDashboard);
app.use("/report", AdminReport);
app.use("/leave-balance", leaveBalanceRoute);

//dump
// const leaveTypesRoutes = require("./src/routes/leaveTypeRoute"); // adjust path

// app.use("/leave-types", leaveTypesRoutes);

//create HTTP server and attach socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", //allow frontend to connect
        methods: ["GET","POST"]
    }
});

// Socket.io connection handling
io.on("connection", (socket) => {
    console.log("New client connected: ", socket.id);

    //join room by company id (so notifications can be targeted)
    socket.on("JoinCompanyRoom", (companyId) =>{
        socket.join(companyId);
        console.log(`Socket ${socket.id} joined room ${companyId}`);
    });

    socket.on("disconnect", ()=> {
        console.log("client disconned:", socket.id);
    });
});

//export io so models/controller can emit events
module.exports.io = io;
// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
