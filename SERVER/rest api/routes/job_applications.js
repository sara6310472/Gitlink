const express = require('express');
const router = express.Router();
const genericDataService = require('../../controllers/genericBl.js');
const dataService = require('../../controllers/bl.js');
const { writeLog } = require('../../log/log.js');
const { addUserIdCondition, handleError, validateRequiredFields } = require('../utils/routerHelpers.js');

const TABLE_NAME = 'job_applications';

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'Job ID is required' });

        const data = await dataService.getJobApplications(id);
        writeLog(`Fetched ${TABLE_NAME} for job id=${id}`, 'info');
        res.json(data);
    } catch (err) {
        handleError(res, err, TABLE_NAME, 'fetching');
    }
});

router.post('/', async (req, res) => {
    try {
        validateRequiredFields(req.body, ['job_id', 'user_id', 'email']);

        const { job_id, user_id, email } = req.body;

        if (req.user?.id && req.user.id !== user_id) return res.status(403).json({ error: 'You can only apply for yourself' });

        const applicationData = { job_id, user_id };
        const created = await dataService.createApply(applicationData, email);
        writeLog(`Created job application: ${JSON.stringify(applicationData)}`, 'info');
        res.status(201).json({ message: 'Application submitted successfully', result: created });
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
        writeLog(`Deleted job application id=${itemId}`, 'info');
        res.json({ message: 'Application deleted successfully', result });
    } catch (err) {
        handleError(res, err, TABLE_NAME, 'deleting');
    }
});

router.put('/notify', async (req, res) => {
  try {
    const result = await dataService.notifyApplicant(req.body);
    res.json({ message: 'Email sent successfully', result });
  } catch (err) {
    handleError(res, err, 'job_application', 'notifying');
  }
});

router.put('/:job_id', async (req, res) => {
    try {
        const { user_id, ...body } = req.body;
        const result = await genericDataService.updateItem(
            TABLE_NAME,
            body,
            [
                { field: 'job_id', value: Number(req.params.job_id) },
                { field: 'user_id', value: user_id }
            ]
        );
        writeLog(`Updated message for user=${req.body.email}`, 'info');
        res.json({ message: 'Message updated successfully', result });
    } catch (err) {
        handleError(res, err, TABLE_NAME, 'updating');
    }
});

router.put('/reject/:job_id', async (req, res) => {
    try {
        const { job_id } = req.params;
        const result = await dataService.rejectApplicant(req.body, Number(job_id));
        writeLog(`reject application for job id=${job_id}`, 'info');
        res.json({ message: 'Application reject successfully', result });
    }
    catch (err) {
        handleError(res, err, 'reject applicant', 'deleting');
    }
})

module.exports = router;