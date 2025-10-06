import React, { useState } from 'react';
import { Chip, Menu, MenuItem, Divider, Typography } from '@mui/material';

// --- LOCAL STORAGE MOCK DB FUNCTIONS ---
const DISTRIBUTOR_KEY = 'localDistributorsData';

const getLocalDistributors = () => {
    const saved = localStorage.getItem(DISTRIBUTOR_KEY);
    return saved ? JSON.parse(saved) : [];
};

const saveLocalDistributors = (distributors) => {
    localStorage.setItem(DISTRIBUTOR_KEY, JSON.stringify(distributors));
};
// -------------------------------------

const priorities = ["High", "Medium", "Low", "In Discussion"];
const stages = ["Prospect", "Qualified Lead", "Initial Contact", "Negotiation"];

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'High': return 'error';
        case 'Medium': return 'warning';
        case 'Low': return 'success';
        case 'In Discussion': return 'info';
        default: return 'default';
    }
};

const QuickStatusUpdater = ({ distributorId, fieldKey, initialValue, onUpdateSuccess }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const items = fieldKey === 'priority' ? priorities : stages;
    const color = fieldKey === 'priority' ? getPriorityColor(initialValue) : 'primary';

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleQuickUpdate = (newValue) => {
        handleMenuClose();
        
        try {
            let distributors = getLocalDistributors();
            
            // Find and update the record in the local array
            distributors = distributors.map(d => 
                d.id === distributorId ? { ...d, [fieldKey]: newValue } : d
            );

            saveLocalDistributors(distributors);
            
            // Success: Trigger the parent component (DistributorList) to refresh
            onUpdateSuccess();

        } catch (error) {
            console.error("Quick Update Error:", error);
            alert(`Error updating ${fieldKey}: ${error.message}`);
        }
    };

    return (
        <>
            <Chip
                label={initialValue || '-'}
                size="small"
                color={color}
                onClick={handleMenuOpen}
                sx={{ cursor: 'pointer', fontWeight: 600 }}
                aria-controls={open ? 'quick-update-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
            />
            <Menu
                id="quick-update-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                MenuListProps={{ 'aria-labelledby': 'basic-button' }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                <Typography variant="subtitle2" sx={{ px: 2, pt: 1, color: color }}>
                    Update {fieldKey.toUpperCase()}
                </Typography>
                <Divider sx={{ mb: 1 }} />
                {items.map((item) => (
                    <MenuItem 
                        key={item} 
                        onClick={() => handleQuickUpdate(item)} 
                        disabled={initialValue === item}
                    >
                        <Chip 
                            label={item} 
                            size="small" 
                            color={fieldKey === 'priority' ? getPriorityColor(item) : 'primary'} 
                            sx={{ width: 100 }} 
                        />
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default QuickStatusUpdater;
