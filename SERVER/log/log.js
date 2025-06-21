const fs = require('fs');
const path = require('path');
function writeLog(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
    const logDir = path.join(__dirname, './');
    const logFile = path.join(logDir, 'server.log');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFile(logFile, logMessage, (err) => {
        if (err) console.error('Failed to write log:', err);
    });

}

module.exports = { writeLog };