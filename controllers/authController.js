// This script handles the actual registration and login math.

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// User registration Logic
export const registerUser = async (req, res) => {
    try {
        // Destructring the data from frontend
        const {name, email, password, city, contact, bio} = req.body;
        //Checking if the user with this email already exists
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if(userExists.rows.length > 0) {
            return res.status(400).json({message: "User is already registered."});
        }
        // Hashing the password. '10' is 'salt rounds' (how heavy the encryption is)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Save the new user into the database
        const newUser = await pool.query(
            `INSERT INTO users (name, email, password, city, contact, bio) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role`,
            [name, email, hashedPassword, city, contact, bio]
        );
        res.status(201).json({
            message: "User registered successfully",
            user: newUser.rows[0]
        });

    } catch(error) {
        console.log(error);
        res.status(500).json({message: "Server error during registration"});
    }
};
// User login logic
export const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;
        // Find user in the database
        const user = await pool.query("SELECT * FROM users WHERE email = $1",[email]);
        if(user.rows.length === 0) {
            return res.status(400).json({message: "Invalid email or password"});
        }
        // Comparing the hashed password in database against typed password
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if(!validPassword) {
            return res.status(400).json({message: "Invalid email or password"});
        }
        // Creating JWT digital wristband
        // We pack the user's role and id inside the token so we know who they are on future requests
        const token = jwt.sign(
            {id: user.rows[0].id, role: user.rows[0].role},
            process.env.JWT_SECRET,
            {expiresIn: "7d"} // Token expires in seven days
        );
        res.status(200).json({
            message: "Logged in successfully ",
            token: token,
            user: {id: user.rows[0].id, name: user.rows[0].name, role: user.rows[0].role}
        });
    } catch(error) {
        console.log(error);
        res.status(500).json({message: "Server error during login"});
    }
};