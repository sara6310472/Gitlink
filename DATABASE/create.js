const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const PORT = 3001;
const app = express();
app.use(cors());
app.use(express.json());
require('dotenv').config();

async function createDatabase() {
    const rootConnection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 3306,
    });

    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    await rootConnection.end();
}

async function getDbConnection() {
    return await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
    });
}

const timestampColumns = `
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
`;

async function createUserTables(connection) {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS roles (
            role_id INT AUTO_INCREMENT PRIMARY KEY,
            role VARCHAR(255) NOT NULL,
            ${timestampColumns}
        )
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone INT NOT NULL,
            role_id INT(100) NOT NULL,
            about VARCHAR(2000),
            profile_image VARCHAR(255),
            cv_file VARCHAR(255),
            is_active BOOLEAN DEFAULT TRUE,
            status BOOLEAN DEFAULT TRUE,
            ${timestampColumns},
            FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
        )
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS passwords (
            user_id INT PRIMARY KEY,
            hashed_password VARCHAR(255) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            ${timestampColumns},
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
}

async function createRoleTables(connection) {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS developers (
            user_id INT PRIMARY KEY,
            git_name VARCHAR(100) UNIQUE NOT NULL,
            experience INT NOT NULL,
            languages VARCHAR(255),
            rating INT DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            ${timestampColumns},
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS recruiters (
            user_id INT PRIMARY KEY,
            company_name VARCHAR(100) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            ${timestampColumns},
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
}

async function createProjectTables(connection) {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS projects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL,
            git_name VARCHAR(100) NOT NULL,
            name VARCHAR(100) NOT NULL,
            url VARCHAR(255) NOT NULL,
            languages VARCHAR(1000),
            details VARCHAR(255),
            forks_count INT NOT NULL DEFAULT 0,
            rating DOUBLE DEFAULT 0,
            rating_count INT DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            ${timestampColumns},
            FOREIGN KEY (git_name) REFERENCES developers(git_name) ON DELETE CASCADE,
            FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
        )
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS project_ratings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL,
            project_id INT NOT NULL,
            rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
            is_active BOOLEAN DEFAULT TRUE,
            ${timestampColumns},
            UNIQUE (username, project_id),
            FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )
    `);
}

async function createJobTables(connection) {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS jobs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL,
            title VARCHAR(100),
            company_name VARCHAR(100) NOT NULL,
            details VARCHAR(3000),
            requirements VARCHAR(2000),
            experience INT NOT NULL,
            languages VARCHAR(255),
            views INT NOT NULL DEFAULT 0,
            is_seized BOOLEAN DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            ${timestampColumns},
            FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
        )
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS job_applications (
            user_id INT NOT NULL,
            job_id INT NOT NULL,
            remark VARCHAR(500),
            is_treated ENUM('pending', 'handled', 'rejected') DEFAULT 'pending',
            is_active BOOLEAN DEFAULT TRUE,
            ${timestampColumns},
            PRIMARY KEY (user_id, job_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
        )
    `);
}

async function createMessageTables(connection) {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            email VARCHAR(100) NOT NULL,
            title VARCHAR(100) NOT NULL,
            content VARCHAR(1000),
            is_active BOOLEAN DEFAULT TRUE,
            is_read BOOLEAN DEFAULT FALSE,
            ${timestampColumns},
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
}

async function createAllTables(connection) {
    await createUserTables(connection);
    await createRoleTables(connection);
    await createProjectTables(connection);
    await createJobTables(connection);
    await createMessageTables(connection);
}

async function main() {
    await createDatabase();
    const db = await getDbConnection();
    await createAllTables(db);
    await db.end();
}

main();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
