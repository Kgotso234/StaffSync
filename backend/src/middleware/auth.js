const jwt = require("jsonwebtoken");



exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.warn("Missing Authorization header");
        return res.status(401).json({ error: "Authorization header missing." });
    }

    if (!authHeader.startsWith("Bearer ")) {
        console.warn("Authorization header is not in Bearer format:", authHeader);
        return res.status(401).json({ error: "Invalid token format. Expected 'Bearer <token>'." });
    }

    const token = authHeader.split(" ")[1];


    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
       
        // Attach directly for the controller
        req.employeeId = decoded.employeeId;
        req.companyId = decoded.companyId;
        req.e_email = decoded.e_email;
        req.e_number = decoded.e_number;


        next();
    } catch (error) {
        console.error("Token verification failed:", error.message);
        return res.status(403).json({ error: "Token is invalid or has expired." });
    }
};


