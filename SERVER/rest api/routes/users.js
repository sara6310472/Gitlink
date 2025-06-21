const express = require('express');
const router = express.Router();
const genericDataService = require('../../controllers/genericBl.js');
const dataService = require('../../controllers/bl.js');
const { writeLog } = require('../../log/log.js');
const path = require('path');
const bcrypt = require('bcrypt');
const multer = require('multer');
const verifyToken = require('../middleware/verifyToken');
const { handleError, validateRequiredFields } = require('../utils/routerHelpers.js');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'cv_file') {
            cb(null, 'uploads/cv_files/');
        } else if (file.fieldname === 'profile_image') {
            cb(null, 'uploads/profile_images/');
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.fieldname === 'cv_file') {
            if (file.mimetype === 'application/pdf') {
                cb(null, true);
            } else {
                cb(new Error('Only PDF files are allowed for CV'), false);
            }
        } else if (file.fieldname === 'profile_image') {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed'), false);
            }
        }
    }
});

router.get('/:username', async (req, res) => {
    try {
        const { username } = req.params;
        if (!username) return res.status(400).json({ error: 'Username is required' });
        const data = await dataService.getUser(username);
        writeLog(`Fetched user data for username=${username}`, 'info');
        res.json(data);
    } catch (err) {
        handleError(res, err, 'users', 'fetching');
    }
});

router.get('/', async (req, res) => {
    try {
        // if (!req.user?.id) return res.status(401).json({ error: 'User not authenticated' });
        const data = await dataService.getUsers();
        writeLog(`Fetched users data`, 'info');
        res.json(data);
    } catch (err) {
        handleError(res, err, 'users', 'fetching');
    }
});

router.put('/update-cv', upload.single('cv_file'), async (req, res) => {
    try {
        const { user_id } = req.body;

        if (req.user?.id && req.user.id !== parseInt(user_id)) return res.status(403).json({ error: 'You can only update your own CV' })

        let cvFilePath = null;
        if (req.file) cvFilePath = `cv_files/${req.file.filename}`;

        await genericDataService.updateItem('users',
            { cv_file: cvFilePath },
            [{ field: 'id', value: user_id }]
        );
        res.status(200).json({ message: 'CV updated successfully' });
    } catch (err) {
        handleError(res, err, 'users', 'updating CV for');
    }
});

router.put('/update-image', upload.single('profile_image'), async (req, res) => {
    try {
        const { user_id, use_git_avatar } = req.body;

        if (req.user?.id && req.user.id !== parseInt(user_id)) return res.status(403).json({ error: 'You can only update your own profile image' });

        let profileImagePath = null;
        if (use_git_avatar === 'true') {
            profileImagePath = req.body.profile_image; // GitHub URL
        } else if (req.file) {
            profileImagePath = `profile_images/${req.file.filename}`;
        }

        await genericDataService.updateItem('users',
            { profile_image: profileImagePath },
            [{ field: 'id', value: user_id }]
        );
        res.status(200).json({ message: 'Profile image updated successfully' });
    } catch (err) {
        handleError(res, err, 'users', 'updating profile image for');
    }
});

router.put('/change-password', async (req, res) => {
    try {
        validateRequiredFields(req.body, ['user_id', 'currentPassword', 'newPassword']);

        const { user_id, currentPassword, newPassword, email } = req.body;

        if (req.user?.user_id && req.user.user_id !== user_id) return res.status(403).json({ error: 'You can only change your own password' });

        const user = await dataService.changeUserPassword(user_id, currentPassword, newPassword, email);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        handleError(res, err, 'users', 'changing password for');
    }
});

router.put('/status/:username', async (req, res) => {
    try {
        const { username } = req.params;
        if (!username) return res.status(400).json({ error: 'username is required' });
        const result = await dataService.updateUserStatus(
            'users',
            req.body,
            [{ field: 'username', value: username }]
        );
        writeLog(`Updated username=${username} by user=${req.user.username}`, 'info');
        res.json({
            message: 'user updated successfully',
            result
        });
    } catch (err) {
        handleError(res, err, 'users', 'updating user');
    }
});

router.put('/:username', async (req, res) => {
    try {
        const { username } = req.params;
        if (!username) return res.status(400).json({ error: 'username is required' });
        const result = await genericDataService.updateItem(
            'users',
            req.body,
            [{ field: 'username', value: username }]
        );
        writeLog(`Updated username=${username} by user=${req.user.username}`, 'info');
        res.json({
            message: 'user updated successfully',
            result
        });
    } catch (err) {
        handleError(res, err, 'users', 'updating user');
    }
});




module.exports = router;