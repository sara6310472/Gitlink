const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authBl = require('../../controllers/authBl.js');
const bl = require('../../controllers/bl.js');
const { writeLog } = require('../../log/log.js');
const { handleError } = require('../utils/routerHelpers.js');
const fs = require('fs');
const dataService = require('../../controllers/bl.js');
const { generateUsername } = require('unique-username-generator');

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const multer = require('multer');
const path = require('path');

const uploadDirs = [
    path.join(__dirname, '../../uploads/profile_images'),
    path.join(__dirname, '../../uploads/cv_files')
];

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'profile_image') {
            cb(null, path.join(__dirname, '../../uploads/profile_images'));
        } else if (file.fieldname === 'cv_file') {
            cb(null, path.join(__dirname, '../../uploads/cv_files'));
        } else {
            cb(new Error('Unknown field name'), false);
        }
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);

        if (file.fieldname === 'profile_image') {
            cb(null, `profile-${timestamp}-${randomNum}${ext}`);
        } else if (file.fieldname === 'cv_file') {
            cb(null, `cv-${timestamp}-${randomNum}${ext}`);
        }
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        console.log(`Processing file: ${file.fieldname}, mimetype: ${file.mimetype}`);

        if (file.fieldname === 'profile_image') {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Profile image must be an image file!'), false);
            }
        } else if (file.fieldname === 'cv_file') {
            if (file.mimetype === 'application/pdf') {
                cb(null, true);
            } else {
                cb(new Error('CV must be a PDF file!'), false);
            }
        } else {
            cb(new Error('Unknown field name!'), false);
        }
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await authBl.verifyLogin(username, password);
        if (!user) {
            writeLog(`Failed login attempt for user name=${username}`, 'warn');
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const ip = req.ip;
        const accessToken = jwt.sign({ id: user.id, email: user.email, ip, username: user.username, role_id: user.role_id }, ACCESS_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ username: user.username, id: user.id }, REFRESH_SECRET, { expiresIn: '1d' });
        writeLog(`User logged in successfully: user name=${username}, ip=${ip}`, 'info');
        res
            .cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 1 * 24 * 60 * 60 * 1000
            })
            .json({ user, token: accessToken });
    } catch (err) {
        handleError(res, err, 'auth', 'login');
    }
});

// זה פונקציה מידי ארוכה
router.post('/register', upload.fields([
    { name: 'profile_image', maxCount: 1 },
    { name: 'cv_file', maxCount: 1 }
]), async (req, res) => {
    try {
        let profileImagePath = null;
        let cvFilePath = null;
        if (req.body.profile_image && req.body.profile_image.startsWith('https://github.com/')) {
            profileImagePath = req.body.profile_image;
        }
        else if (req.files && req.files['profile_image'] && req.files['profile_image'].length > 0) {
            profileImagePath = `profile_images/${req.files['profile_image'][0].filename}`;
        }
        else if (req.body.role_id === 2) {
            profileImagePath = `profile_images/user.png`;
        }
        if (req.files && req.files['cv_file'] && req.files['cv_file'].length > 0) {
            cvFilePath = `cv_files/${req.files['cv_file'][0].filename}`;
        }
        const userData = {
            ...req.body,
            profile_image: profileImagePath,
            cv_file: cvFilePath,
        };

        const user = await authBl.registerNewUser(userData);
        writeLog(`User registered successfully: email=${user.email}`, 'info');
        const ip = req.ip;
        const accessToken = jwt.sign({ id: user.id, email: user.email, ip, username: user.username, role_id: user.role_id }, ACCESS_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ username: user.username, id: user.id }, REFRESH_SECRET, { expiresIn: '1d' });
        res
            .cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 1 * 24 * 60 * 60 * 1000
            })
            .status(201)
            .json({ user, token: accessToken });
    } catch (err) {
        handleError(res, err, 'auth', 'register');
    }
});

router.post('/refresh', (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        writeLog('Refresh token missing in request', 'warn');
        return res.sendStatus(401);
    }
    jwt.verify(refreshToken, REFRESH_SECRET, async (err, decoded) => {
        if (err) {
            writeLog('Invalid refresh token', 'warn');
            return res.sendStatus(403);
        }
        const user = await bl.getUser(decoded.username);
        if (!user) {
            return res.sendStatus(403);
        }
        const ip = req.ip;
        const newAccessToken = jwt.sign(
            { id: decoded.id, username: user.username, ip, role_id: user.role_id },
            ACCESS_SECRET,
            { expiresIn: '15m' }
        );
        writeLog(`Access token refreshed for userId=${decoded.id}, ip=${ip}`, 'info');
        res.json({ token: newAccessToken });
    });
});

router.post('/logout', (req, res) => {
    writeLog('User logged out', 'info');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: "Logged out" });
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username || username.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Username is required"
            });
        }
        const result = await authBl.forgotPassword(username.trim());
        res.status(200).json(result);
    } catch (error) {
        handleError(res, error, 'auth', 'Forgot password');
    }
});

router.get('/check-username/:username', async (req, res) => {
    const { username } = req.params;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    const isAvailable = await authBl.isUsernameAvailable(username);
    if (isAvailable) {
        // האם להוציא את זה לפונקצית עזר חיצונית
        const suggestions = [];
        for (let i = 0; i < 5; i++) {
            const suggestion = generateUsername("", 0, 5);
            if (authBl.isUsernameAvailable(suggestion)) {
                suggestions.push(suggestion);
            }
        }
        res.json({
            available: false, ...suggestions
        });
    } else {
        res.json({ available: true, username });
    }

})

router.get('/cv/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await dataService.getUser(username);

        if (!user || !user.cv_file) {
            return res.status(404).json({ error: 'CV not found' });
        }
        const filePath = path.join(__dirname, '../../uploads/', user.cv_file);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'CV file not found on server' });
        }
        res.setHeader('Content-Disposition', `attachment; filename="${username}-cv.pdf"`);
        res.setHeader('Content-Type', 'application/pdf');
        res.sendFile(filePath);
    } catch (err) {
        handleError(res, err, 'CV', 'downloading CV');
    }
});

module.exports = router;