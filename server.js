import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from './routes/projectRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';

// Load environment variables
dotenv.config();

// Initializing the express application
const app = express();

// Allow our frontend to reuqest our backend
app.use(cors());

// Parse incoming JSON payloads (e.g., from fetch, Axios, or Postman)
app.use(express.json());

// Parse incoming URL-encoded form data (e.g., standard HTML forms)
app.use(express.urlencoded({ extended: true }));

// Authourizing the user before they make any request
app.use("/api/auth", authRoutes);

// Route for handling projects
app.use('/api/projects', projectRoutes);

// Route for applying to projects
app.use('/api/applications', applicationRoutes);

// Route handler for admin
app.use('/api/admin', adminRoutes);

// Route for handling user profile updates
app.use('/api/users', userRoutes);

// To serve HTML, CSS and Javascript flies to the browser
app.use(express.static('public'));

// to route feedback request
app.use('/api/feedback', feedbackRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}.`);
});