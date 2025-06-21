const dal = require('../services/dal.js');
const genericDal = require('../services/genericDal.js');
const bcrypt = require('bcrypt');
const { sendEmail } = require('../services/emailService');
const { sendPasswordChangeWarningEmail } = require('../services/emailService');

const getUsers = async () => {
    try {
        const users = await dal.getUsers();
        return users?.length > 0 ? users : null;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to fetch users');
    }
}

const getUser = async (username) => {
    try {
        const user = await dal.getUser(username);
        return  user
    } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Failed to fetch user');
    }
}

const updateUserStatus = async (table, body, conditions) => {
    try {
        const { email, id } = body;
        const data = { status: body.status };
        const messageData = {
            user_id: id,
            email: email,
            title: body.status === 0 ? 'Account Blocked' : 'Account Active',
            content: body.status === 0
                ? `Your account has been blocked due to a violation of our policies.  
                    Please contact support if you have questions.  
                    - The Support Team`
                : `Your account has been reactivated.  
                    Welcome back! If you have any questions, please contact support.  
                    - The Support Team`
        };
        await dal.updateAndInformUser(table, data, conditions, messageData);
    } catch (error) {
        console.error('Error updating user status:', error);
        throw new Error('Failed to update user status');
    }
}

const getDevelopers = async () => {
    try {
        const res = await dal.getUsersByRole('developer');
        return res || null;
    } catch (error) {
        console.error('Error fetching developers:', error);
        throw new Error('Failed to fetch developers');
    }
}

const getDeveloper = async (id) => {
    try {
        const res = await dal.getUserWithRoleData(id, 'developer');
        return res || null;
    } catch (error) {
        console.error('Error fetching developer:', error);
        throw new Error('Failed to fetch developer');
    }
}

const getRecruiters = async () => {
    try {
        const res = await dal.getUsersByRole('recruiter');
        return res || null;
    } catch (error) {
        console.error('Error fetching recruiters:', error);
        throw new Error('Failed to fetch recruiters');
    }
}

const getRecruiter = async (id) => {
    try {
        const res = await dal.getUserWithRoleData(id, 'recruiter');
        return res || null;
    } catch (error) {
        console.error('Error fetching recruiter:', error);
        throw new Error('Failed to fetch recruiter');
    }
}

const getJobApplications = async (job_id) => {
    try {
        const applications = await dal.getApplications(job_id);
        return applications;
    } catch (error) {
        console.error('Error fetching job applications:', error);
        throw new Error('Failed to fetch job applications');
    }
}

const rejectApplicant = async (body, job_id) => {
    try {
        const { developerId, developerEmail } = body;
        const messageData = {
            user_id: developerId,
            email: developerEmail,
            title: 'Application Rejected',
            content: `Thank you for applying for Job #${job_id}.  
                After careful review, we have decided to move forward with other candidates.  
                We appreciate your interest and wish you success in your journey.
                - The Recruitment Team`,
        };
        await dal.rejectApplicant(job_id, developerId, messageData);
    } catch (error) {
        console.error('Error rejecting applicant:', error);
        throw new Error('Failed to reject applicant');
    }
}

const notifyApplicant = async ({ email, title, content }) => {
    try {
        await sendEmail({
            to: email,
            subject: title,
            html: content
        });
    } catch (error) {
        console.error('Error sending notification email:', error);
        throw new Error('Failed to send notification email');
    }
}

const rateProject = async (username, projectId, rating) => {
    try {
        await dal.rateProjectTransactional(username, projectId, rating);

        const projectWithUser = await dal.getProjectWithCreator(projectId);
        if (!projectWithUser?.length) {
            throw new Error("Project or creator not found.");
        }

        const gitName = projectWithUser[0].git_name;
        await updateUserRating(gitName);
    } catch (error) {
        console.error('Error rating project:', error);
        throw error; 
    }
};

const updateUserRating = async (gitName) => {
    try {
        const creatorProjects = await genericDal.GET("projects", [
            { field: "git_name", value: gitName }
        ]);

        const ratedProjects = creatorProjects.filter(p => p.rating_count > 0);
        if (ratedProjects.length === 0) return;

        const totalRatings = ratedProjects.reduce((sum, p) => sum + p.rating * p.rating_count, 0);
        const totalCount = ratedProjects.reduce((sum, p) => sum + p.rating_count, 0);
        const userRating = totalCount > 0 ? Math.round((totalRatings / totalCount) * 100) / 100 : null;

        await genericDal.UPDATE("developers", {
            rating: userRating
        }, [{ field: "git_name", value: gitName }]);
    } catch (error) {
        console.error('Error updating user rating:', error);
        throw new Error('Failed to update user rating');
    }
};

const createApply = async (data, email) => {
    try {
        if (Array.isArray(data)) {
            data = Object.fromEntries(data.map(({ field, value }) => [field, value]));
        }

        const response = await genericDal.CREATE('job_applications', data);

        await genericDal.CREATE("messages", {
            user_id: data.user_id,
            email: email,
            title: 'Application Received!',
            content: `We have received your application for job number ${data.job_id}. The recruiter has been notified. We wish you the best of luck!`
        });

        return response;
    } catch (error) {
        console.error('Error creating application:', error);

        if (error.message.includes('Duplicate') || error.code === '23505') {
            throw new Error('You have already contacted the recruiter for this position. Please wait for a response before sending another message.');
        }

        throw new Error('Failed to submit application');
    }
}

const changeUserPassword = async (userId, currentPassword, newPassword, email) => {
    try {
        // בדיקות בסיסיות שלא נעשו ברמת הRoute
        if (!userId || !currentPassword || !newPassword) {
            throw new Error("All password fields are required");
        }

        const passwords = await genericDal.GET('passwords', [
            { field: 'user_id', value: userId }
        ]);

        if (!passwords?.length) {
            throw new Error('User not found');
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, passwords[0].hashed_password);
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const conditions = [{ field: 'user_id', value: userId }];

        await sendPasswordChangeWarningEmail(userId, email);

        return await genericDal.UPDATE('passwords',
            { hashed_password: hashedNewPassword },
            conditions
        );
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;   
    }
};

module.exports = {
    getUsers,
    getUser,
    updateUserStatus,
    getJobApplications,
    getDevelopers,
    getDeveloper,
    getRecruiters,
    getRecruiter,
    rateProject,
    createApply,
    changeUserPassword,
    rejectApplicant,
    notifyApplicant
};