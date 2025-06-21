const mysql = require('mysql2/promise');
require('dotenv').config();

async function getDbConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });
}

async function seedRoles(db) {
  await db.query(`
    INSERT INTO roles (role)
    VALUES
    ('developer'),
    ('recruiter'),
    ('admin')
  `);
}

async function seedUsers(db) {
  await db.query(`
    INSERT INTO users (username, email, phone, role_id, about, profile_image, cv_file, status)
VALUES
  ('admin', 'gitlink10@gmail.com', 0527159812, 3, '', 'profile_images/user.png', '', TRUE),
  ('alice', 'alice@example.com', 123456789, 1, 'Full-stack developer', 'profile_images/user.png', 'cv_files/alice-cv.pdf', TRUE),
  ('bob', 'bob@example.com', 234567891, 1, 'Backend enthusiast', 'profile_images/user.png', 'cv_files/bob-cv.pdf', FALSE),
  ('charlie', 'charlie@example.com', 345678912, 2, 'Java expert', 'profile_images/user.png', NULL, TRUE);
  
  `);

}

async function seedPasswords(db) {
  await db.query(`
    INSERT INTO passwords (user_id, hashed_password)
    VALUES
      (1, '$2b$10$j1XT3HhoYkB6hsAN/hcZbeCUUF95mDqxv7NbDkeKhVIBEQUfo9wtG'),
      (2, '$2b$10$UKBrGw3lond5d.RujQuSfufY.b.UDBXw1q8kNsj0uULbjoYPcNTV2'),
      (3, '$2b$10$UKBrGw3lond5d.RujQuSfufY.b.UDBXw1q8kNsj0uULbjoYPcNTV2'),
      (4, '$2b$10$UKBrGw3lond5d.RujQuSfufY.b.UDBXw1q8kNsj0uULbjoYPcNTV2');
  `);
}

async function seedDevelopers(db) {
  await db.query(`
    INSERT INTO developers (user_id, git_name, experience, languages, rating)
    VALUES
      (2, 'aliceGH', 3, 'JavaScript, Python', 5),
      (3, 'bobGH', 2, 'C++,C#', 4);
  `);
}

async function seedRecruiters(db) {
  await db.query(`
    INSERT INTO recruiters (user_id, company_name)
    VALUES
      (4, 'Some Company');
  `);
}

async function seedProjects(db) {
  await db.query(`
    INSERT INTO projects (username, git_name, name, url, languages, details, forks_count, rating, rating_count)
    VALUES
      ('alice', 'aliceGH', 'Portfolio', 'https://github.com/alice/portfolio', 'HTML,CSS,JS', 'Personal site', 10, 0, 0),
      ('alice', 'aliceGH', 'Blog Engine', 'https://github.com/alice/blog', 'Node.js', 'Blog backend', 5, 0, 0),
      ('bob', 'bobGH', 'Calculator', 'https://github.com/bob/calc', 'C++', 'CLI calculator', 7, 0, 0);
  `);
}

async function seedProjectRatings(db) {
  await db.query(`
    INSERT INTO project_ratings (username, project_id, rating)
    VALUES
      ('bob', 1, 5),
      ('alice', 3, 4);
  `);
}

async function seedJobs(db) {
  await db.query(`
    INSERT INTO jobs (username, company_name, experience, languages, views)
    VALUES
      ('charlie', 'Tech Corp', 4, 'Java,Spring', 9),
      ('charlie', 'Future Inc', 3, 'Python,Django', 5);
  `);
}

async function seedJobApplications(db) {
  await db.query(`
    INSERT INTO job_applications (user_id, job_id, remark)
    VALUES
      (2, 1, 'Interested in backend role'),
      (3, 1, 'Skilled in Java'),
      (2, 2, 'Looking for Python work');
  `);
}

async function seedMessages(db) {
  await db.query(`
    INSERT INTO messages (user_id, email, title, content, is_read)
    VALUES
      (2, 'alice@example.com', 'Welcome!', 'Welcome to the platform!', FALSE),
      (3, 'bob@example.com', 'Tip', 'Do not forget to update your profile.', FALSE),
      (4, 'charlie@example.com', 'Alert', 'New job posted in your field.', FALSE);
  `);
}

async function runAllSeeders(db) {
  await seedRoles(db);
  await seedUsers(db);
  await seedPasswords(db);
  await seedDevelopers(db);
  await seedRecruiters(db);
  await seedProjects(db);
  await seedProjectRatings(db);
  await seedJobs(db);
  await seedJobApplications(db);
  await seedMessages(db);
}

async function seed() {
  const db = await getDbConnection();
  await runAllSeeders(db);
  console.log("✅ Database seeded successfully.");
  await db.end();
}

seed().catch(err => {
  console.error("❌ Seeding failed:", err.message);
});