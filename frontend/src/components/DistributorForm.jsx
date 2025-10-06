import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  MenuItem,
  Typography,
  useTheme,
  Grid,
  Divider,
} from "@mui/material";

// --- LOCAL STORAGE MOCK DB FUNCTIONS ---
const DISTRIBUTOR_KEY = 'localDistributorsData';
const DYNAMIC_FIELDS_KEY = 'localDynamicFields';

const getLocalDistributors = () => {
    const saved = localStorage.getItem(DISTRIBUTOR_KEY);
    return saved ? JSON.parse(saved) : [];
};

const saveLocalDistributors = (distributors) => {
    localStorage.setItem(DISTRIBUTOR_KEY, JSON.stringify(distributors));
};

const getLocalDynamicFields = () => {
    const saved = localStorage.getItem(DYNAMIC_FIELDS_KEY);
    return saved ? JSON.parse(saved) : [];
};
// -------------------------------------

const priorities = ["High", "Medium", "Low", "In Discussion"];
const stages = ["Prospect", "Qualified Lead", "Initial Contact", "Negotiation"];

const staticKeysToExclude = ["id", "date_added", "priority", "stage", "notes"]; 

const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;

const allStaticFields = [
    "arn", "arn_holder_name", "city", "owner", "aum", 
    "linkedIn_url", "notes_link", "notes", 
    "address", "pin", "email", "telephone_r", "telephone_o", 
    "arn_valid_from", "arn_valid_till", "kyd_compliant", "euin", 
    "lead_source", "platform_used", "secondary_contact", "secondary_name",
    "first_call_date", "follow_up_date"
];

const requiredStaticFields = [
  "arn", "arn_holder_name", "city", "owner", "aum", 
  "linkedIn_url", "notes_link", "notes", "email",
  "address", "pin", "telephone_r", "telephone_o",
  "arn_valid_from", "arn_valid_till", "kyd_compliant", "euin",
  "lead_source", "platform_used", "first_call_date", "follow_up_date", "notes"
];


const DistributorForm = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { id } = useParams();
  const isEditing = !!id;

  const [dynamicFields, setDynamicFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false); 

  const initialBaseState = {
    arn: "", arn_holder_name: "", city: "", owner: "", aum: "", 
    linkedIn_url: "", notes_link: "", notes: "",
    stage: stages[0], priority: "Medium", date_added: new Date().toISOString().slice(0, 10),
    
    address: "", pin: "", email: "", telephone_r: "", telephone_o: "", 
    arn_valid_from: "", arn_valid_till: "", kyd_compliant: "", euin: "", 
    lead_source: "", platform_used: "", secondary_contact: "", secondary_name: "",
    first_call_date: "", follow_up_date: ""
  };

  const [distributor, setDistributor] = useState({
      id: isEditing ? Number(id) : null,
      ...initialBaseState,
  });


  // --- INITIAL DATA LOAD (FROM LOCAL STORAGE) ---
  useEffect(() => {
    const fetchData = () => {
      let fields = getLocalDynamicFields();
      setDynamicFields(fields);
      
      let initialData = { ...initialBaseState };

      if (isEditing) {
        const distributors = getLocalDistributors();
        // Find existing distributor
        const existingData = distributors.find(d => d.id === Number(id));
        if (existingData) {
            initialData = existingData;
        }
      }
      
      const mergedData = { ...initialBaseState, ...initialData };
      const initializedDistributor = {};
      
      const allKeys = [...Object.keys(initialBaseState), ...fields.map(f => f.key)];
      allKeys.forEach(key => {
          initializedDistributor[key] = mergedData[key] != null ? mergedData[key].toString() : '';
      });
      
      setDistributor(prev => ({
          ...prev,
          ...initializedDistributor,
          id: isEditing ? Number(id) : Date.now(), // Use unique timestamp ID for new records
      }));
      setLoading(false);
    };
    
    fetchData();
  }, [id, isEditing]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setDistributor({ ...distributor, [name]: value });
  };

  // --- VALIDATION LOGIC (UNCHANGED) ---
  const isFormValid = () => {
    const allStaticFilled = requiredStaticFields.every((key) => distributor[key] && distributor[key].toString().trim() !== "");
    const aumIsNumeric = distributor.aum === "" || !isNaN(Number(distributor.aum));
    const linkedInValid = distributor.linkedIn_url === "" || urlRegex.test(distributor.linkedIn_url);
    const notesLinkValid = distributor.notes_link === "" || urlRegex.test(distributor.notes_link);
    
    const allDynamicValid = dynamicFields.every(field => {
        const value = distributor[field.key];
        if (field.type === 'numeric' && value && value.toString().trim() !== "") {
            return !isNaN(Number(value));
        }
        return true; 
    });

    return (
      allStaticFilled && aumIsNumeric && linkedInValid && notesLinkValid && allDynamicValid
    );
  };

  const getFieldError = (key) => {
    const isRequiredAndEmpty = requiredStaticFields.includes(key) && distributor[key]?.toString().trim() === "";

    if (isSubmitted && isRequiredAndEmpty) {
        return 'Required';
    }
    
    if (key === "aum" && distributor.aum && distributor.aum.toString().trim() !== "" && isNaN(Number(distributor.aum))) {
      return "AUM must be a number.";
    }
    if ((key === "linkedIn_url" || key === "notes_link") && distributor[key] && distributor[key].toString().trim() !== "" && !urlRegex.test(distributor[key])) {
      return "Must be a valid URL (e.g., http://example.com).";
    }
    
    const dynamicField = dynamicFields.find(f => f.key === key);
    if (dynamicField?.type === 'numeric' && distributor[key] && distributor[key].toString().trim() !== "" && isNaN(Number(distributor[key]))) {
        return `${dynamicField.displayName} must be a number.`;
    }
    
    return null;
  };

  // --- LOCAL SUBMISSION HANDLER ---
  const handleSubmit = () => {
    setIsSubmitted(true); 

    if (!isFormValid()) {
      alert("Please fill in all required fields and correct validation errors.");
      return;
    }
    
    // Construct final data object for saving
    const finalRecord = { id: distributor.id };
    
    // Map all fields, converting numbers/dates/nulls correctly
    const allKeysInForm = [...Object.keys(initialBaseState), ...dynamicFields.map(f => f.key)];
    
    allKeysInForm.forEach(key => {
        const value = distributor[key];
        
        if (key === 'aum') {
            finalRecord[key] = Number(value) || 0;
        } else if (dynamicFields.some(f => f.key === key)) {
            const fieldDef = dynamicFields.find(f => f.key === key);
            if (fieldDef.type === 'numeric') {
                finalRecord[key] = Number(value) || null;
            } else {
                finalRecord[key] = value || null;
            }
        } else if (key.includes('_date') || key.includes('valid_')) {
             finalRecord[key] = value && value.trim() !== '' ? value : null;
        } else {
             finalRecord[key] = value || null;
        }
    });

    // Save to Local Storage
    let distributors = getLocalDistributors();
    
    if (isEditing) {
        // Update existing record
        distributors = distributors.map(d => d.id === finalRecord.id ? finalRecord : d);
        alert(`Distributor ${finalRecord.arn_holder_name} updated successfully!`);
    } else {
        // Create new record
        distributors.push(finalRecord);
        alert(`Distributor ${finalRecord.arn_holder_name} created successfully!`);
    }

    saveLocalDistributors(distributors);
    navigate("/"); 
  };

  if (loading) {
      return (
          <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6">Loading {isEditing ? 'distributor data' : 'form'}...</Typography>
          </Box>
      );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: theme.palette.grey[50], minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom component="h1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
        {isEditing ? `Edit Distributor: ${distributor.arn_holder_name}` : 'Add New Distributor'}
      </Typography>

      <Card elevation={4} sx={{ p: 4, borderRadius: 2 }}>
        {/* TOP BUTTONS - MOVED ACTIONS HERE */}
        <Box sx={{ display: "flex", justifyContent: 'flex-end', gap: 2, mb: 3, pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!isFormValid()}
          >
            Save Changes
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
          {/* RENDER STATIC FIELDS (Excluding notes, stage, priority) */}
          {Object.keys(initialBaseState)
            .filter(key => 
                !staticKeysToExclude.includes(key) && 
                !dynamicFields.some(f => f.key === key) &&
                key !== 'notes' 
            )
            .sort((a, b) => requiredStaticFields.includes(b) - requiredStaticFields.includes(a)) 
            .map((key) => {
              const isRequired = requiredStaticFields.includes(key);
              const errorText = getFieldError(key);
              const isDate = key.toLowerCase().includes('date') || key.includes('valid_');
              
              const formatLabel = (k) => {
                  let label = k.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                  
                  if (k === 'telephone_r') return 'Telephone (Residence)';
                  if (k === 'telephone_o') return 'Telephone (Office)';
                  if (k === 'kyd_compliant') return 'KYD Compliant';
                  
                  return label;
              };

              const hasError = !!errorText || (isSubmitted && isRequired && distributor[key]?.toString().trim() === "");

              return (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <TextField
                    label={formatLabel(key)}
                    name={key}
                    value={distributor[key] || ""}
                    onChange={handleChange}
                    size="medium"
                    fullWidth
                    required={isRequired}
                    error={hasError}
                    helperText={hasError ? (errorText || 'Required') : ''}
                    type={isDate ? 'date' : 'text'}
                    InputLabelProps={isDate ? { shrink: true } : {}}
                  />
                </Grid>
              );
            })}

          {/* RENDER STATIC DROPDOWNS (Stage and Priority) */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              label="STAGE"
              name="stage"
              value={distributor.stage}
              onChange={handleChange}
              size="medium"
              fullWidth
              required
              error={isSubmitted && distributor.stage.trim() === ""}
              helperText={isSubmitted && distributor.stage.trim() === "" ? 'Required' : ''}
            >
              {stages.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              label="Priority"
              name="priority"
              value={distributor.priority}
              onChange={handleChange}
              size="medium"
              fullWidth
              required
              error={isSubmitted && distributor.priority.trim() === ""}
              helperText={isSubmitted && distributor.priority.trim() === "" ? 'Required' : ''}
            >
              {priorities.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* RENDER DYNAMIC FIELDS */}
          {dynamicFields.map((field) => {
            const errorText = getFieldError(field.key);
            const isDate = field.key.toLowerCase().includes('date');
            
            return (
              <Grid item xs={12} sm={6} md={4} key={field.key}>
                <TextField
                  label={field.displayName.toUpperCase()}
                  name={field.key}
                  value={distributor[field.key] || ""}
                  onChange={handleChange}
                  size="medium"
                  fullWidth
                  error={!!errorText}
                  helperText={errorText}
                  type={isDate ? 'date' : (field.type === 'numeric' ? 'text' : 'text')}
                  select={field.type === 'dropdown'}
                  InputLabelProps={isDate ? { shrink: true } : {}}
                >
                  {field.type === 'dropdown' && field.options.map(option => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            );
          })}
          
          {/* RENDER NOTES AS THE LAST FIELD, FULL WIDTH */}
          <Grid item xs={12}>
            <TextField
              label="NOTES"
              name="notes"
              value={distributor.notes || ""}
              onChange={handleChange}
              size="medium"
              fullWidth
              multiline
              rows={3}
              required={requiredStaticFields.includes("notes")}
              error={getFieldError('notes') === 'Required'}
              helperText={getFieldError('notes') === 'Required' ? 'Required' : ''}
              sx={{ mt: 2 }} 
            />
          </Grid>

        </Grid>
      </Card>
    </Box>
  );
};

export default DistributorForm;
