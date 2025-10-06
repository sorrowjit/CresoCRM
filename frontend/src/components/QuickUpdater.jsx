import React, { useState } from 'react';
import { Chip, Menu, MenuItem, Divider, Typography } from '@mui/material';
import API_BASE_URL from '../config/api';

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

    const handleQuickUpdate = async (newValue) => {
        handleMenuClose();
        
        try {
            const payload = { [fieldKey]: newValue };
            
            const response = await fetch(`${API_BASE_URL}/distributors/${distributorId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                let errorMessage = `Failed to update ${fieldKey}.`;
                try {
                    const jsonBody = JSON.parse(errorBody);
                    errorMessage = jsonBody.error || jsonBody.message || errorMessage;
                } catch {
                    // Non-JSON error response from server
                }
                throw new Error(errorMessage);
            }

            // Success: Trigger the parent component (DistributorList) to re-fetch all data
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
