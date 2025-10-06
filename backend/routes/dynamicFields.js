const express = require('express');
const router = express.Router();
const DynamicFieldsModel = require('../utils/dynamicFields');

// GET /api/dynamic-fields - Get all dynamic field definitions
router.get('/', (req, res) => {
    DynamicFieldsModel.getAllFields((err, fields) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to retrieve dynamic fields.' });
        }
        res.json(fields);
    });
});

// POST /api/dynamic-fields - Add a new dynamic field
router.post('/', (req, res) => {
    const { displayName, type, options } = req.body;
    
    if (!displayName || !type) {
        return res.status(400).json({ error: 'Display name and type are required.' });
    }
    
    // Create a key based on the display name for the database
    const key = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '_');

    DynamicFieldsModel.createField(key, displayName, type, options, (err, newField) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to create new dynamic field.' });
        }
        res.status(201).json(newField);
    });
});

module.exports = router;
