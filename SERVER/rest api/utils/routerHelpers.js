const { writeLog } = require('../../log/log');

const createConditions = (req) => {
    const query = req.query;
    if (query.user_id === 'null') {
        query.user_id = req.user?.id;
    }
    let conditions = [];
    if (Object.keys(query).length > 0) {
        conditions = Object.entries(query).map(([key, value]) => ({
            field: key,
            value: isNaN(value) ? value : Number(value)
        }));
    }
    return conditions;
};

const addUserIdCondition = (req, conditions = []) => {
    const userId = req.user?.id;
    if (!userId) return conditions;
    return [...conditions];
};

const handleError = (res, err, table, operation = 'requesting') => {
    console.error(err);
    writeLog(`ERROR ${operation} ${table} - ${err.message}`, 'error');
    res.status(500).json({ error: `ERROR ${operation} ${table}` });
};

const validateRequiredFields = (body, requiredFields) => {
    const missing = requiredFields.filter(field => !body[field]);
    if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
};

module.exports = {
    createConditions,
    addUserIdCondition,
    handleError,
    validateRequiredFields
};