// We will use this script later to protect routes (like creating a project). 
// It checks if a valid token was sent in the request headers.

import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    // Grab the token from request header
    const authHeader = req.header("Authorization");
    // Tokens are usually sent as "Bearer <token_strings>"
    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({message: "Access Denied. No token provided."});
    }
    const token = authHeader.split(" ")[1] // Extract just the token part
    try {
        // Verify the token using our secret key
        const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
        // Attach the user's info (id, role) to the request object
        req.user = verifiedUser;
        // Move on to the next function e.g let them create a project
        next();
    } catch(error) {
        console.log(error);
        res.status(400).json({message: "Invalid token."});
    }
};