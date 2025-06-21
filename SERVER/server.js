const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: "./.env" });
const verifyToken = require("./rest api/middleware/verifyToken.js");
const authRoutes = require("./rest api/routes/auth.js");
const path = require('path');

const PORT = process.env.PORT || 3001;

const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("", authRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const messagesRoutes = require("./rest api/routes/messages.js");
const projectsRoutes = require("./rest api/routes/projects.js");
const developersRoutes = require("./rest api/routes/developers.js");
const recruitersRoutes = require("./rest api/routes/recruiters.js");
const jobsRoutes = require("./rest api/routes/jobs.js");
const job_applicationsRoutes = require("./rest api/routes/job_applications.js");
const usersRoutes = require("./rest api/routes/users.js");
app.use("/:role/messages", verifyToken, messagesRoutes);
app.use("/:role/jobs", verifyToken, jobsRoutes);
app.use("/:role/job_applications", verifyToken, job_applicationsRoutes);
app.use("/:role/projects", verifyToken, projectsRoutes);
app.use("/:role/developers", verifyToken, developersRoutes);
app.use("/:role/recruiters", verifyToken, recruitersRoutes);
app.use("/:role/users", verifyToken, usersRoutes);

app.listen(PORT, () => {
    console.log(`The server runs on port: ${PORT}`);
});
