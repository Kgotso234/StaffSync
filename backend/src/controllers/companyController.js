const Company = require("../models/Company");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.createCompany = async (req, res) => {
    try {
        const {c_name, c_email, password} = req.body;
        
        //check if email exist
        const existEmail = await Company.findOne({ c_email});
        if (existEmail){
            return res.status(400).json({ error: "email already exists" });
        } 
        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const company = new Company({
            c_name,
            c_email,
            password: hashedPassword
        });

        await company.save();
        res.status(201).json({message: "Company Added Successful" ,company});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};
 
exports.login = async (req, res) => {
    try {
        const {c_email, password} = req.body;

        //check if company already exist
        const company = await Company.findOne({ c_email});
        if (!company) {
           return res.status(400).json({ error: "Invalid email or password"});
        }

        //compare passwords
        const isMatch = await bcrypt.compare(password, company.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password"})
        }

        const token = jwt.sign( {companyId: company._id, c_email: company.c_email },
            process.env.JWT_SECRET, {expiresIn: "1h"}
        );
        res.json({message: "Login successful", token, company});
    } catch (e) {
        res.status(500).json({ error: e.message});
    }

    
};

//GET companies
exports.getCompanies = async (req, res) =>{
    try {
        const companies = await Company.find({}, "_id c_name");
        res.status(200).json(companies);
    } catch (e) {
        console.error("error fetching companies" , e);
        res.status(500).json({error: "failed to fetch companies"});
    }
};