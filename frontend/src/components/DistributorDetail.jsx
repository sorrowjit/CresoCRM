import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  useTheme,
} from "@mui/material";

import API_BASE_URL from "../config/api";

const baseFieldLabels = {
  arn: "ARN",
  arn_holder_name: "ARN Holder Name",
  city: "City",
  owner: "Owner",
  stage: "Stage",
  aum: "AUM",
  date_added: "Date Added",
  priority: "Priority",
  linkedIn_url: "LinkedIn URL",
  notes_link: "Notes Link",
  notes: "Notes", // <-- Will be handled separately at the end
  
  address: "Address",
  pin: "PIN",
  email: "Email",
  telephone_r: "Telephone (Residence)",
  telephone_o: "Telephone (Office)",
  arn_valid_from: "ARN Valid From",
  arn_valid_till: "ARN Valid Till",
  kyd_compliant: "KYD Compliant",
  euin: "EUIN",
  lead_source: "Lead Source",
  platform_used: "Platform Used",
  follow_up_date: "Follow Up Date",
  secondary_contact: "Secondary Contact",
  secondary_name: "Secondary Name",
  first_call_date: "First Call Date",
};

// Helper function to safely get and format field value
const getFormattedValue = (distributor, key) => {
    const value = distributor[key];
    
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0)) {
        return "-";
    }

    if (key === 'aum' && typeof value === 'number') {
        return `₹${value.toLocaleString('en-IN')}`;
    }

    return value.toString();
};

const DistributorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [distributor, setDistributor] = useState(null);
  const [dynamicFields, setDynamicFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Dynamic Field Definitions
        const fieldsResponse = await fetch(`${API_BASE_URL}/fields`);
        if (!fieldsResponse.ok) throw new Error("Failed to fetch field definitions.");
        const fields = await fieldsResponse.json();
        setDynamicFields(fields);

        // 2. Fetch specific Distributor data (which includes dynamic values)
        const distResponse = await fetch(`${API_BASE_URL}/distributors/${id}`);
        if (!distResponse.ok) throw new Error(`Failed to fetch distributor ID: ${id}`);
        const distData = await distResponse.json();
        
        setDistributor(distData);

      } catch (error) {
        console.error("Error loading distributor detail:", error);
        alert(`Error loading data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Combine base labels with dynamic labels for the full rendering list
  const allFieldLabels = {
    ...baseFieldLabels,
    ...dynamicFields.reduce((acc, field) => {
        acc[field.key] = field.displayName;
        return acc;
    }, {}),
  };
  
  // Determine which keys to display (excluding 'id', 'date_added' and handling 'notes' last)
  const allDisplayKeys = distributor 
    ? Object.keys(allFieldLabels).filter(key => key !== 'id' && key !== 'date_added' && key !== 'notes')
    : [];

  if (loading) {
    return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6">Loading Distributor Details...</Typography>
        </Box>
    );
  }

  if (!distributor) return <Typography>No distributor found</Typography>;

  return (
    <Box sx={{ p: 3, backgroundColor: theme.palette.grey[50], minHeight: '100vh' }}>
        <Typography variant="h4" gutterBottom component="h1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            Distributor Details: {distributor.arn_holder_name}
        </Typography>

        <Card elevation={4} sx={{ p: 4, borderRadius: 2 }}>
            {/* TOP BUTTONS */}
            <Box sx={{ display: "flex", justifyContent: 'flex-end', gap: 2, mb: 3, pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Button variant="contained" color="primary" onClick={() => navigate(`/edit/${distributor.id}`)}>
                    Edit Record
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate("/")}
                >
                    Back to List
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* RENDER ALL FIELDS EXCEPT NOTES */}
                {allDisplayKeys.map((key) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                        <TextField
                            label={allFieldLabels[key]}
                            name={key}
                            value={getFormattedValue(distributor, key)} 
                            variant="outlined"
                            size="medium"
                            fullWidth
                            InputProps={{ readOnly: true }}
                            multiline={(key.includes('url') || key.includes('link'))}
                        />
                    </Grid>
                ))}
                
                {/* RENDER NOTES AS THE LAST FIELD, FULL WIDTH */}
                {distributor.notes && (
                    <Grid item xs={12}>
                        <TextField
                            label={allFieldLabels.notes}
                            name="notes"
                            value={getFormattedValue(distributor, 'notes')}
                            variant="outlined"
                            size="medium"
                            fullWidth
                            InputProps={{ readOnly: true }}
                            multiline
                            rows={3}
                            sx={{ mt: 1 }}
                        />
                    </Grid>
                )}

            </Grid>
        </Card>
    </Box>
  );
};

export default DistributorDetail;