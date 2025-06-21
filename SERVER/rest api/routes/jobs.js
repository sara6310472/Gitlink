const express = require('express');
const router = express.Router();
const genericDataService = require('../../controllers/genericBl.js');
const DataService = require('../../controllers/bl.js');
const { writeLog } = require('../../log/log.js');
const {
    createConditions,
    addUserIdCondition,
    handleError
} = require('../utils/routerHelpers.js');

const TABLE_NAME = 'jobs';

router.get('/', async (req, res) => {
    try {
        const conditions = createConditions(req);
        const data = await genericDataService.getItemByConditions(
            TABLE_NAME,
            conditions.length ? conditions : undefined
        );

        writeLog(`Fetched ${TABLE_NAME} with conditions=${JSON.stringify(conditions)}`, 'info');
        res.json(data);
    } catch (err) {
        handleError(res, err, TABLE_NAME, 'fetching');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'job ID is required' });
        const data = await genericDataService.getItemByConditions('jobs', [{field:'id', value: Number(id)}]);
        writeLog(`Fetched job data for id=${id}`, 'info');
        res.json(data[0]);
    } catch (err) {
        handleError(res, err, 'job', 'fetching');
    }
});

router.post('/', async (req, res) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: 'User not authenticated' });

        const body = { ...req.body };
        const created = await genericDataService.createItem(TABLE_NAME, body);
        writeLog(`Created job with data=${JSON.stringify(body)}`, 'info');
        res.status(201).json({ message: 'Job created successfully', result: created });
    } catch (err) {
        handleError(res, err, TABLE_NAME, 'creating');
    }
});

router.delete('/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        const baseConditions = [{ field: 'id', value: itemId }];
        const conditions = addUserIdCondition(req, baseConditions);

        const result = await genericDataService.deleteItem(TABLE_NAME, conditions);
        writeLog(`Deleted job id=${itemId}`, 'info');
        res.json({ message: 'Job deleted successfully', result });
    } catch (err) {
        handleError(res, err, TABLE_NAME, 'deleting');
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'Project ID is required' });
        const result = await genericDataService.updateItem(
            TABLE_NAME,
            req.body,
            [{ field: 'id', value: id }]
        );

        writeLog(`Updated project id=${id} by user=${req.user.username}`, 'info');
        res.json({
            message: 'Project updated successfully',
            result,
            project_id: id
        });

    } catch (err) {
        handleError(res, err, TABLE_NAME, 'updating project');
    }
});

module.exports = router;