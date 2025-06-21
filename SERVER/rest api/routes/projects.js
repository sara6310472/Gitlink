const express = require('express');
const router = express.Router();
const genericDataService = require('../../controllers/genericBl.js');
const dataService = require('../../controllers/bl.js');
const { writeLog } = require('../../log/log.js');
const {
    createConditions,
    addUserIdCondition,
    handleError,
    validateRequiredFields
} = require('../utils/routerHelpers.js');

const TABLE_NAME = 'projects';

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

router.post("/", async (req, res) => {
    try {
        let conditions = Object.entries(req.body).map(([key, value]) => ({
            field: key,
            value
        }));

        conditions = addUserIdCondition(req, conditions);
        const body = Object.fromEntries(conditions.map(({ field, value }) => [field, value]));

        const created = await genericDataService.createItem(TABLE_NAME, body);
        writeLog(`Created project with data=${JSON.stringify(body)}`, 'info');
        res.status(201).json({ message: 'Project created successfully', result: created });
    } catch (err) {
        handleError(res, err, TABLE_NAME, 'creating');
    }
});

router.post("/rate", async (req, res) => {
    try {
        validateRequiredFields(req.body, ['project_id', 'rating']);

        const { project_id, rating } = req.body;
        const username = req.user?.username;

        if (!username) return res.status(401).json({ error: 'User not authenticated' });

        await dataService.rateProject(username, project_id, rating);
        res.status(200).json({ message: 'Rating submitted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, url, details, languages } = req.body;

        if (!id) return res.status(400).json({ error: 'Project ID is required' });
        const result = await genericDataService.updateItem(
            TABLE_NAME,
            { name, url, details, languages },
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

router.delete('/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        const baseConditions = [{ field: 'id', value: itemId }];
        const conditions = addUserIdCondition(req, baseConditions);

        const result = await genericDataService.deleteItem(TABLE_NAME, conditions);
        writeLog(`Deleted project id=${itemId}`, 'info');
        res.json({ message: 'Project deleted successfully', result });
    } catch (err) {
        handleError(res, err, TABLE_NAME, 'deleting');
    }
});

module.exports = router;