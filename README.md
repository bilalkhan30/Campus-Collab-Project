# CampusCollab — Student Project Collaboration Platform

![Node.js](https://img.shields.io/badge/Node.js-18.x+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![JavaScript](https://img.shields.io/badge/Vanilla_JS-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_Storage-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white)

**CampusCollab** is a full-stack web platform built to centralize intra-college project discovery and peer recruitment. Instead of relying on unorganized messaging groups or generic job boards, students can post technical projects, filter open opportunities by specific skills or city, preview peer resumes in one click, and form interdisciplinary teams within a moderated ecosystem.

---

## Key Features & User Roles

The platform enforces strict **Role-Based Access Control (RBAC)** using JSON Web Tokens (JWT) and custom Express middleware, tailoring the experience to two distinct user categories:

### 1. Standard Users (Students)
* **Secure Onboarding & Digital Identity:** Register with an institutional email, encrypted password (`bcrypt`), profile avatar, and PDF resume hosted on **Cloudinary**.
* **Dynamic Project Discovery Feed:** Browse active project listings (automatically excluding projects authored by the logged-in user to prevent self-application).
* **Real-Time DOM Filtering:** Instantly filter open projects by required technical skills (e.g., `React`, `PostgreSQL`, `Python`) or author city without page reloads.
* **Project Authorship:** Publish new collaboration requests specifying project titles, descriptions, required team sizes, and skill tags.
* **One-Click Vetting & Applications:** View public author profile modals containing bios, contact links, and direct in-browser PDF resume previews before applying to join a project.
* **Personal Dashboard:** Track authored projects alongside a historical log of submitted project applications.

### 2. Administrators
* **Role-Based Routing:** Automatically redirects users with `role: 'admin'` to a dedicated Admin Control Panel, replacing standard "Apply to Join" buttons on the feed with an "Admin Viewing Mode" badge.
* **Platform Analytics:** View real-time aggregate statistics across registered users, active projects, and applications.
* **User Moderation & Cascading Cleanup:** Delete malicious or inactive accounts. Leveraging PostgreSQL `ON DELETE CASCADE` constraints, removing a user automatically purges their authored projects and submitted applications to prevent orphaned records.
* **Feedback & Spam Protection:** Review user submissions collected through a public feedback endpoint protected by IP rate-limiting (`express-rate-limit`) and 24-hour email cooldown checks.

---

## Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) | Responsive Glassmorphism UI, Fetch API integration, dynamic DOM rendering |
| **Backend** | Node.js, Express.js | RESTful API routing, controller logic, custom authentication middleware |
| **Database** | PostgreSQL (`pg` driver) | Relational data persistence, parameterized SQL queries, junction table modeling |
| **Authentication** | JSON Web Tokens (JWT), `bcrypt` | Stateless session management, cryptographic password salting & hashing |
| **File Storage** | Cloudinary, `multer` | Multipart form data parsing and cloud hosting for profile pictures & PDF resumes |
| **Deployment** | Vercel, Neon.tech | Serverless backend/static frontend hosting (Vercel) & cloud PostgreSQL (Neon) |

---

## Project Directory Structure

```text
CampusCollab/
|-- backend/
|   |-- config/
|   |   `-- db.js                 # PostgreSQL connection pool configuration
|   |-- controllers/
|   |   |-- authController.js     # Registration, login, bcrypt & JWT issuance
|   |   |-- projectController.js  # Project CRUD & application logic
|   |   `-- userController.js     # Profile modals, admin stats & user deletion
|   |-- middleware/
|   |   |-- verifyToken.js        # JWT validation & isAdmin RBAC protection
|   |   `-- upload.js             # Multer + Cloudinary storage engine setup
|   |-- routes/
|   |   |-- authRoutes.js         # /api/auth endpoints
|   |   |-- projectRoutes.js      # /api/projects endpoints
|   |   `-- userRoutes.js         # /api/users & /api/admin endpoints
|   |-- server.js                 # Express app entry point & middleware setup
|   `-- package.json
|-- public/                       # Static Frontend Assets
|   |-- css/
|   |   `-- styles.css            # Responsive Glassmorphism stylesheet
|   |-- js/
|   |   |-- app.js                # Global navigation & UI state management
|   |   |-- auth.js               # Login/Register FormData & Fetch requests
|   |   `-- feed.js               # Project feed rendering & real-time filtering
|   |-- index.html                # Landing page
|   |-- login.html                # Authentication view
|   |-- register.html             # Registration & media upload view
|   |-- feed.html                 # Project discovery feed
|   |-- profile.html              # User dashboard
|   `-- admin.html                # Admin moderation control panel
|-- .env                          # Environment variables (not committed)
`-- vercel.json                   # Vercel serverless routing configuration
```

---

## Core REST API Endpoints

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Registers a new user, hashes password, uploads avatar/resume to Cloudinary. |
| `/api/auth/login` | `POST` | Public | Validates credentials and returns a signed JWT and user role. |
| `/api/projects` | `GET` | Protected | Fetches all open projects excluding those authored by the requester. |
| `/api/projects` | `POST` | Protected | Creates a new project listing tied to the authenticated `userId`. |
| `/api/projects/:id` | `DELETE` | Protected | Deletes a specific project if the requester is the verified author. |
| `/api/users/:id/public` | `GET` | Protected | Retrieves public author details, bio, and Cloudinary resume URL. |
| `/api/admin/users` | `GET` | Admin Only | Returns global platform statistics and non-admin user list. |
| `/api/admin/users/:id` | `DELETE` | Admin Only | Deletes a user account and cascades deletion across projects and applications. |
| `/api/feedback` | `POST` | Public (Rate-Limited) | Submits user feedback with IP rate limiting and 24-hour email cooldown. |

---

## Local Setup & Installation Guide

Follow these steps to configure and run **CampusCollab** on your local machine.

### 1. Prerequisites
Ensure you have the following installed and configured:
* **[Node.js](https://nodejs.org/)** (v18.x or higher) & **npm**
* **[PostgreSQL](https://www.postgresql.org/)** (Local installation or a free cloud database on **[Neon.tech](https://neon.tech/)**)
* **[Cloudinary Account](https://cloudinary.com/)** (Free tier for image and PDF hosting)
* **[Git](https://git-scm.com/)**

### 2. Clone the Repository
```bash
git clone [https://github.com/bilalkhan30/CampusCollab.git](https://github.com/bilalkhan30/CampusCollab.git)
cd CampusCollab
```

### 3. Install Dependencies
Install the required backend packages (`express`, `pg`, `bcrypt`, `jsonwebtoken`, `multer`, `cloudinary`, `dotenv`, `cors`, `express-rate-limit`):
```bash
npm install
```
*(If your `package.json` is inside the `backend/` folder, run `cd backend && npm install` instead).*

### 4. Configure Environment Variables
Create a `.env` file in the root (or `backend/`) directory and populate it with your credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# PostgreSQL Database Connection (Local or Neon.tech URI)
DATABASE_URL=postgresql://username:password@localhost:5432/campuscollab

# JWT Secret Key (Use a strong random string)
JWT_SECRET=your_super_secret_jwt_signing_key_here

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 5. Initialize the PostgreSQL Database Schema
Connect to your PostgreSQL instance using `psql`, pgAdmin, or the Neon SQL Editor, and execute the following SQL script to create the relational tables:

```sql
-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    city VARCHAR(50),
    contact VARCHAR(20),
    bio TEXT,
    profile_pic VARCHAR(255),
    resume VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects Table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    members_required INTEGER NOT NULL,
    skills TEXT[] NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Applications Junction Table (Many-to-Many Bridge)
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    applicant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Public Feedback Table
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

*(Optional) To promote a registered account to an Administrator, run:*
```sql
UPDATE users SET role = 'admin' WHERE email = 'your_admin_email@example.com';
```

### 6. Run the Application
Start the Express server:

```bash
# Run in standard mode
npm start

# Or run with nodemon for automatic hot-reloading during development
npm run dev
```

Once the console logs `Successfully connected to the DB`, open your browser and navigate to:
```text
http://localhost:5000
```

---

## Security Measures Implemented
* **SQL Injection Prevention:** All database operations use parameterized queries (`$1, $2...`) via the `pg` connection pool.
* **Cryptographic Password Storage:** Plaintext passwords are never stored; all credentials undergo 10 rounds of salting and hashing via `bcrypt`.
* **Stateless JWT Verification:** Protected routes verify Bearer tokens before executing controller actions.
* **Rate Limiting & Cooldowns:** Public endpoints restrict repetitive requests from single IP addresses to mitigate brute-force and spam attacks.

---

## Author

**Bilal Khan**  
* **GitHub:** [@bilalkhan30](https://github.com/bilalkhan30)  
* **Email:** [bilalkhan991150@gmail.com](mailto:bilalkhan991150@gmail.com)  
* **Institution:** Maharaja Surajmal Institute of Technology (GGSIPU), New Delhi