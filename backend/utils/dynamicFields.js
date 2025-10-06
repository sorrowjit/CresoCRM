const db = require('../config/db');

const DynamicFieldsModel = {
    // Get all dynamic field definitions
    getAllFields: (callback) => {
        db.all("SELECT key, displayName, type, options FROM dynamic_fields", [], (err, rows) => {
            if (err) return callback(err);
            // Parse JSON options back into array/object structure
            const fields = rows.map(field => ({
                ...field,
                options: field.options ? JSON.parse(field.options) : null
            }));
            callback(null, fields);
        });
    },

    // Add a new dynamic field definition
    createField: (key, displayName, type, options, callback) => {
        const optionsJson = options ? JSON.stringify(options) : null;
        const sql = `INSERT INTO dynamic_fields (key, displayName, type, options) VALUES (?, ?, ?, ?)`;
        db.run(sql, [key, displayName, type, optionsJson], function(err) {
            callback(err, { id: this.lastID, key, displayName, type, options });
        });
    }
};

module.exports = DynamicFieldsModel;