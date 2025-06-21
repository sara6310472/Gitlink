const genericDal = require('../services/genericDal.js');
const pool = require("./mysqlPool");

const ALLOWED_TABLES = [
    'users', 'developers', 'recruiters', 'passwords', 'roles',
    'projects', 'job_applications', 'project_ratings', 'messages', 'jobs'
];

const USER_ROLES = {
    DEVELOPER: 'developer',
    RECRUITER: 'recruiter',
    ADMIN: 'admin'
};

const getUsers = async () => {
    try {
        const users = await genericDal.GET_WITH_JOINS(
            ["users", "passwords", "roles"],
            [
                'users.id = passwords.user_id',
                `users.role_id = roles.role_id and roles.role != 'admin'`,
            ],
        );
        if (users.length === 0) return null;
        return users;
    } catch (error) {
        console.error('Error in getUser:', error.message);
        throw new Error(`Failed to get user: ${error.message}`);
    }
};

const getUser = async (username) => {
    try {
        if (!username) throw new Error('Username is required');

        const users = await genericDal.GET_WITH_JOINS(
            ["users", "passwords", "roles"],
            [
                'users.id = passwords.user_id',
                'users.role_id = roles.role_id'
            ],
            [{ field: "username", value: username }]
        );

        if (users.length === 0) return null;

        const user = users[0];

        switch (user.role) {
            case 'developer':
                return await getUserWithRoleData(user.id, 'developers');
            case 'recruiter':
                return await getUserWithRoleData(user.id, 'recruiters');
            case 'admin':
                return user;
            default:
                throw new Error(`Invalid user role: ${user.role}`);
        }
    } catch (error) {
        console.error('Error in getUser:', error.message);
        throw new Error(`Failed to get user: ${error.message}`);
    }
};

const getUserWithRoleData = async (userId, roleTable) => {
    try {
        if (!userId) throw new Error('User ID is required');

        const users = await genericDal.GET_WITH_JOINS(
            ["users", roleTable, "passwords", "roles"],
            [
                `users.id = ${roleTable}.user_id`,
                'users.id = passwords.user_id',
                'users.role_id = roles.role_id'
            ],
            [{ field: 'id', value: userId }]
        );

        if (users.length === 0) throw new Error('User not found');

        return users[0];
    } catch (error) {
        console.error('Error in getUserWithRoleData:', error.message);
        throw new Error(`Failed to get user with role data: ${error.message}`);
    }
};

const getUsersByRole = async (role) => {
    try {
        if (!Object.values(USER_ROLES).includes(role)) throw new Error(`Invalid role: ${role}`);

        const roleTable = role === USER_ROLES.DEVELOPER ? 'developers' : 'recruiters';

        const users = await genericDal.GET_WITH_JOINS(
            ["users", roleTable, "roles"],
            [
                `users.id = ${roleTable}.user_id`,
                'users.role_id = roles.role_id',
            ]
        );

        if (users.length === 0) throw new Error(`No ${role}s found`);
        return users;
    } catch (error) {
        console.error('Error in getUsersByRole:', error.message);
        throw new Error(`Failed to get users by role: ${error.message}`);
    }
};

const getProjectWithCreator = async (projectId) => {
    try {
        if (!projectId) throw new Error('Project ID is required');

        return await genericDal.GET_WITH_JOINS(
            ["projects", "developers"],
            ["projects.git_name = developers.git_name"],
            [{ field: "id", value: projectId }]
        );
    } catch (error) {
        console.error('Error in getProjectWithCreator:', error.message);
        throw new Error(`Failed to get project with creator: ${error.message}`);
    }
};

const rateProjectTransactional = async (username, projectId, rating) => {
    const conn = await pool.getConnection();

    try {
        if (!username || !projectId || rating === undefined)
            throw new Error('Username, project ID, and rating are required');
        if (rating < 1 || rating > 5)
            throw new Error('Rating must be between 1 and 5');

        await conn.beginTransaction();

        await conn.query(`
            INSERT INTO project_ratings (username, project_id, rating)
            VALUES (?, ?, ?)
        `, [username, projectId, rating]);

        await conn.query(`
            UPDATE projects
            SET rating = (
                SELECT ROUND(AVG(rating), 2)
                FROM project_ratings
                WHERE project_id = ?
            ),
            rating_count = (
                SELECT COUNT(*)
                FROM project_ratings
                WHERE project_id = ?
            )
            WHERE id = ?;
        `, [projectId, projectId, projectId]);

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        console.error('Error in rateProjectTransactional:', error.message);

        if (error.message.includes("Duplicate") || error.code === 'ER_DUP_ENTRY') {
            throw new Error("User has already rated this project");
        }

        throw new Error(`Transaction failed: ${error.message}`);
    } finally {
        conn.release();
    }
};

const getApplications = async (job_id) => {
    try {
        if (!job_id) throw new Error('Job ID is required');

        const application = await genericDal.GET_WITH_JOINS(["users", "developers", "job_applications", "roles"],
            [
                'users.id = developers.user_id',
                'users.id = job_applications.user_id',
                'users.role_id = roles.role_id',
            ],
            [{ field: 'job_id', value: job_id, }]);
        return application;
    } catch (error) {
        console.error('Error in getApplications:', error.message);
        throw new Error(`Failed to get applications: ${error.message}`);
    }
}

const rejectApplicant = async (job_id, developerId, messageData) => {
    try {
        const result = await this.updateAndInformUser(
            'job_applications',
            { is_treated: 'rejected' },
            [{ field: 'job_id', value: job_id },
            { field: 'user_id', value: developerId }
            ],
            messageData);
        return result;
    } catch (error) {
        console.error('Error in rejectApplicant:', error.message);
        throw new Error(`Failed to reject applicant: ${error.message}`);
    }
}

const updateAndInformUser = async (table, data, conditions = [], messageData) => {
    const connection = await pool.getConnection();
    try {
        validateTable(table);
        validateConditions(conditions);

        if (!data || Object.keys(data).length === 0) {
            throw new Error('Data is required for update operation');
        }

        if (conditions.length === 0) {
            throw new Error('Conditions are required for update operation');
        }

        if (!messageData || !messageData.user_id || !messageData.email || !messageData.title || !messageData.content) {
            throw new Error('Complete message data is required (user_id, email, title, content)');
        }

        await connection.beginTransaction();

        const updateSql = `UPDATE \`${table}\` SET ${Object.keys(data).map(f => `\`${f}\` = ?`).join(", ")} WHERE ${conditions.map(c => `\`${c.field}\` = ?`).join(" AND ")}`;
        const updateParams = [...Object.values(data), ...conditions.map(c => c.value)];

        const insertSql = `INSERT INTO messages (user_id, email, title, content) VALUES (?, ?, ?, ?)`;
        const insertParams = [messageData.user_id, messageData.email, messageData.title, messageData.content];

        await connection.query(updateSql, updateParams);
        await connection.query(insertSql, insertParams);

        await connection.commit();
        console.log('Transaction completed successfully: update and message sent');
    } catch (error) {
        await connection.rollback();
        console.error('Error in updateAndInformUser:', error.message);
        throw new Error(`Transaction failed: ${error.message}`);
    } finally {
        connection.release();
    }
  };

module.exports = {
    getUserWithRoleData,
    getUsersByRole,
    getUsers,
    getUser,
    getProjectWithCreator,
    rateProjectTransactional,
    getApplications,
    rejectApplicant,
    updateAndInformUser
};