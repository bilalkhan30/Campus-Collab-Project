import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";

// Load environment variables
dotenv.config();

// Initializing the express application
const app = express();

// Allow our frontend to reuqest our backend
app.use(cors());

// Telling express to automatically parse the JSON data in request body
app.use(express.json());

app.get("/api/health", async (req, res) => {
    try {
        const dbResult = await pool.query("SELECT NOW()");

        res.sendStatus(200);
        
    } catch(error) {
        console.log(error);
    }

    
});
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}.`);
});