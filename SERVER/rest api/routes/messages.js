const express = require('express');
const router = express.Router();
const genericDataService = require('../../controllers/genericBl.js');
const { writeLog } = require('../../log/log.js');
const {
    createConditions,
    addUserIdCondition,
    handleError
} = require('../utils/routerHelpers.js');

const TABLE_NAME = 'messages';

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

router.put('/', async (req, res) => {
    try {
        if (!req.body?.email) return res.status(401).json({ error: 'User not authenticated' });

        const body = req.body;
        const result = await genericDataService.updateItem(
            TABLE_NAME,
            body,
            [{ field: 'email', value: req.body.email }]
        );
        writeLog(`Updated message for user=${req.body.email}`, 'info');
        res.json({ message: 'Message updated successfully', result });
    } catch (err) {
        handleError(res, err, TABLE_NAME, 'updating');
    }
});

router.put('/:id', async (req, res) => {
    try {
        if (!req.body?.email) return res.status(401).json({ error: 'User not authenticated' });

        const { id } = req.params;
        const body = req.body;

        const result = await genericDataService.updateItem(
            TABLE_NAME,
            body,
            [
                { field: 'id', value: id },
                { field: 'email', value: req.body.email }
            ]
        );

        writeLog(`Updated message id=${id} for user=${req.body.email}`, 'info');
        res.json({ message: 'Message updated successfully', result });
    } catch (err) {
        handleError(res, err, TABLE_NAME, 'updating');
    }
});

router.delete('/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        const baseConditions = [{ field: 'id', value: itemId }];
        const conditions = addUserIdCondition(req, baseConditions);

        const result = await genericDataService.deleteItem(TABLE_NAME, conditions);
        writeLog(`Deleted message id=${itemId}`, 'info');
        res.json({ message: 'Message deleted successfully', result });
    } catch (err) {
        handleError(res, err, TABLE_NAME, 'deleting');
    }
});

router.post('/', async (req, res) => {

});


module.exports = router;