const express = require('express'); // FIX: Use require() for express
const NotesModel = require('../models/notesModel'); // FIX: Use require() for NotesModel

const router = express.Router();

// ➕ Add a note
router.post('/', (req, res) => {
    const { distributorId, content } = req.body; // Adjusted to match standard naming convention
    
    // Check for required fields
    if (!distributorId || !content) {
        return res.status(400).json({ error: 'Distributor ID and content are required.' });
    }

    NotesModel.createNote(distributorId, content, (err, newNote) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to add note.' });
        }
        res.status(201).json({ message: 'Note added', ...newNote });
    });
});

// 📜 Get notes for a distributor
router.get('/:distributorId', (req, res) => { // Use distributorId consistently
    const distributorId = req.params.distributorId;

    NotesModel.getNotesByDistributor(distributorId, (err, notes) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to retrieve notes.' });
        }
        res.json(notes);
    });
});

module.exports = router; // FIX: Use module.exports for routes
