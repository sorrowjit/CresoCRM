const express = require('express');
const router = express.Router();
const DistributorModel = require('../models/distributorModel');

// GET /api/distributors
router.get('/', (req, res) => {
    DistributorModel.getAllDistributors((err, distributors) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to retrieve distributors.' });
        }
        res.json(distributors);
    });
});

// GET /api/distributors/:id
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    DistributorModel.getDistributorById(id, (err, distributor) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to retrieve distributor.' });
        }
        if (!distributor) {
            return res.status(404).json({ error: 'Distributor not found.' });
        }
        res.json(distributor);
    });
});

// POST /api/distributors (Create)
router.post('/', (req, res) => {
    const distributorData = req.body;
    DistributorModel.saveDistributor(null, distributorData, (err, newId) => {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Distributor with this ARN already exists.' });
            }
            console.error(err);
            return res.status(500).json({ error: 'Failed to create distributor.' });
        }
        res.status(201).json({ id: newId, message: 'Distributor created successfully.' });
    });
});

// PUT /api/distributors/:id (Update)
router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const distributorData = req.body;
    
    DistributorModel.saveDistributor(id, distributorData, (err) => {
        if (err) {
             if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Update failed: Distributor with this ARN already exists.' });
            }
            console.error(err);
            return res.status(500).json({ error: 'Failed to update distributor.' });
        }
        res.json({ message: 'Distributor updated successfully.' });
    });
});

// DELETE /api/distributors/:id
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    DistributorModel.deleteDistributor(id, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to delete distributor.' });
        }
        res.json({ message: 'Distributor deleted successfully.' });
    });
});

module.exports = router;