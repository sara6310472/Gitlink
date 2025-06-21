const express = require('express');
const router = express.Router();
const dataService = require('../../controllers/bl.js');
const { writeLog } = require('../../log/log.js');
const { handleError } = require('../utils/routerHelpers.js');

router.get('/', async (req, res) => {
    try {
        const data = await dataService.getRecruiters();
        writeLog('Fetched recruiters data', 'info');
        res.json(data);
    } catch (err) {
        handleError(res, err, 'recruiters', 'fetching');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'Recruiter ID is required' });

        const data = await dataService.getRecruiter(id);
        writeLog(`Fetched recruiter data for id=${id}`, 'info');
        res.json(data);
    } catch (err) {
        handleError(res, err, 'recruiter', 'fetching');
    }
});

router.put('/', async (req, res) => {

});

router.delete('/', async (req, res) => {

});

module.exports = router;