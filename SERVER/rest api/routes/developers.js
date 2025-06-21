const express = require('express');
const router = express.Router();
const dataService = require('../../controllers/bl.js');
const { writeLog } = require('../../log/log.js');
const { handleError } = require('../utils/routerHelpers.js');

const TABLE_NAME = 'developers';

router.get('/', async (req, res) => {
    try {
        const data = await dataService.getDevelopers();
        writeLog(`Fetched data from table = ${TABLE_NAME} `, 'info');
        res.json(data);
    } catch (err) {
        handleError(res, err, TABLE_NAME, 'fetching');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'Developer ID is required' });

        const data = await dataService.getDeveloper(id);
        writeLog(`Fetched developer data for id=${id}`, 'info');
        res.json(data);
    } catch (err) {
        handleError(res, err, 'developer', 'fetching');
    }
});

router.put('/', async (req, res) => {

});

router.delete('/', async (req, res) => {

});

module.exports = router;