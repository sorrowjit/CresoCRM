import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  IconButton,
  Link,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography,
  useTheme,
  Chip,
  Divider,
  FormControlLabel, 
  Checkbox, 
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Visibility, Edit, Add, Warning, ViewColumn } from "@mui/icons-material"; 
import FilterBar from "./FilterBar";
import QuickStatusUpdater from "./QuickUpdater"; 

// --- LOCAL STORAGE KEYS ---
const DISTRIBUTOR_KEY = 'localDistributorsData';
const DYNAMIC_FIELDS_KEY = 'localDynamicFields';
const VISIBLE_KEYS_KEY = 'localVisibleColumns';
// ---

const fieldTypes = ["text", "numeric", "dropdown"];

const baseFieldDisplayNames = {
  arn_holder_name: "ARN Holder Name",
  arn: "ARN",
  city: "City",
  owner: "Owner",
  stage: "Stage",
  aum: "AUM",
  date_added: "Date Added",
  priority: "Priority",
  platform_used: "Platform Used",
  first_call_date: "First Call Date",
  follow_up_date: "Follow-Up Date",
  linkedIn_url: "LinkedIn",
  notes_link: "Notes",
};

const fixedFilters = ["owner", "stage", "city", "priority", "aum"];

// Helper to check if follow-up date is overdue
const isOverdue = (followUpDate) => {
    if (!followUpDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followDate = new Date(followUpDate);
    return followDate.getTime() < today.getTime(); 
};

// --- MOCK DATABASE FUNCTIONS (using localStorage) ---
const getInitialDistributors = () => {
    const saved = localStorage.getItem(DISTRIBUTOR_KEY);
    // Initialize with a mock entry if empty
    return saved ? JSON.parse(saved) : [
        { id: 1, arn: "ARN001", arn_holder_name: "Mock Sales Rep", city: "Delhi", owner: "Admin", stage: "Prospect", aum: 1500000, date_added: "2024-05-01", priority: "High", platform_used: "CRM", first_call_date: "2024-05-02", follow_up_date: "2025-01-01", linkedIn_url: "https://linkedin.com", notes_link: "https://notes.com", notes: "Initial mock record.", secondary_contact: "", secondary_name: "", arn_valid_from: "", arn_valid_till: "", kyd_compliant: "", euin: "", lead_source: "", telephone_r: "", telephone_o: "", pin: "", address: "", email: "mock@example.com" }
    ];
};

const saveDistributors = (distributors) => {
    localStorage.setItem(DISTRIBUTOR_KEY, JSON.stringify(distributors));
};

const getInitialDynamicFields = () => {
    const saved = localStorage.getItem(DYNAMIC_FIELDS_KEY);
    return saved ? JSON.parse(saved) : [];
};

const saveDynamicFields = (fields) => {
    localStorage.setItem(DYNAMIC_FIELDS_KEY, JSON.stringify(fields));
};

const getInitialVisibleKeys = (allKeys) => {
    const saved = localStorage.getItem(VISIBLE_KEYS_KEY);
    if (saved) return JSON.parse(saved);

    // Default keys to show on first load
    return allKeys.filter(key => 
        !['date_added', 'platform_used', 'notes_link'].includes(key)
    );
};
// --- END MOCK DATABASE FUNCTIONS ---


const DistributorList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [dynamicFields, setDynamicFields] = useState(getInitialDynamicFields());

  const initialAllStaticKeys = Object.keys(baseFieldDisplayNames);
  const [visibleKeys, setVisibleKeys] = useState(getInitialVisibleKeys(initialAllStaticKeys));
  
  const [distributors, setDistributors] = useState(getInitialDistributors());
  const [filters, setFilters] = useState({});
  const [orderBy, setOrderBy] = useState("arn_holder_name");
  const [order, setOrder] = useState("asc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newField, setNewField] = useState({
    displayName: "",
    type: "text",
    options: "",
  });

  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [tempVisibleKeys, setTempVisibleKeys] = useState(visibleKeys);

  // --- DELETE STATE REMOVED ---


  // Function to simulate fetching/refreshing the distributor list (now local)
  const fetchData = () => {
    setDistributors(getInitialDistributors());
    setDynamicFields(getInitialDynamicFields());
  };
  
  // --- SYNC EFFECTS ---
  useEffect(() => {
    // CRITICAL STEP: Clear all local storage keys on initial mount
    // This ensures a hard reset every time the parent URL is reloaded.
    localStorage.removeItem(DISTRIBUTOR_KEY);
    localStorage.removeItem(DYNAMIC_FIELDS_KEY);
    localStorage.removeItem(VISIBLE_KEYS_KEY);
    
    // Now fetch the initial data (which reads the mock default values)
    fetchData();
  }, []); 

  useEffect(() => {
    localStorage.setItem(VISIBLE_KEYS_KEY, JSON.stringify(visibleKeys));
  }, [visibleKeys]);

  useEffect(() => {
    const allKeys = Object.keys(baseFieldDisplayNames).concat(dynamicFields.map(f => f.key));
    
    setVisibleKeys(prev => {
        const newDynamicKeys = dynamicFields.map(f => f.key).filter(key => !prev.includes(key));
        return [...prev, ...newDynamicKeys].filter(key => allKeys.includes(key));
    });
  }, [dynamicFields]);
  // --- END SYNC EFFECTS ---


  // --- COLUMN VISIBILITY HANDLERS (UNCHANGED) ---
  const handleToggleColumn = (key) => {
    setTempVisibleKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSaveColumns = () => {
    setVisibleKeys(tempVisibleKeys);
    setIsColumnModalOpen(false);
  };


  // --- DYNAMIC FIELD HANDLERS ---
  const handleAddNewField = () => {
    if (!newField.displayName) {
      alert("Please enter a field display name.");
      return;
    }
    
    const allFieldDefinitions = {
        ...baseFieldDisplayNames,
        ...dynamicFields.reduce((acc, field) => { acc[field.key] = field.displayName; return acc; }, {}),
    };
    
    const fieldKey = newField.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    if (allFieldDefinitions[fieldKey]) {
        alert(`Field with key "${fieldKey}" already exists.`);
        return;
    }
    
    const newFieldDef = {
      key: fieldKey,
      displayName: newField.displayName,
      type: newField.type,
      options: newField.type === 'dropdown' 
        ? newField.options.split(',').map(o => o.trim()).filter(o => o) 
        : null,
    };
    
    // Save locally
    const updatedFields = [...dynamicFields, newFieldDef];
    saveDynamicFields(updatedFields);
    setDynamicFields(updatedFields);
    
    // Add new field to visible keys immediately
    setVisibleKeys(prev => [...prev, fieldKey]);
    setTempVisibleKeys(prev => [...prev, fieldKey]);
    
    setIsModalOpen(false);
    setNewField({ displayName: "", type: "text", options: "" });
  };


  // Combine base fields with dynamic fields for the table header
  const allFieldDefinitions = {
    ...baseFieldDisplayNames,
    ...dynamicFields.reduce((acc, field) => {
      acc[field.key] = field.displayName;
      return acc;
    }, {}),
  };

  // Filter definitions based on visibleKeys for rendering the table
  const fieldDisplayNames = Object.keys(allFieldDefinitions)
    .filter(key => visibleKeys.includes(key))
    .reduce((obj, key) => {
        obj[key] = allFieldDefinitions[key];
        return obj;
    }, {});
  // --- END COLUMN VISIBILITY LOGIC ---

  // --- SORTING AND FILTERING LOGIC (UNCHANGED) ---
  const handleSort = (field) => {
    const isAsc = orderBy === field && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(field);
  };

  const filtered = distributors.filter((d) => {
    return Object.keys(filters).every((key) => {
      if (!filters[key]) return true;
      const val = d[key] ? d[key].toString().toLowerCase() : "";
      if (key === "aum") return d[key] >= Number(filters[key]);
      if (key === "priority") return filters[key] === "All" || d[key] === filters[key];
      return val.includes(filters[key].toLowerCase());
    });
  });

  const sortedDistributors = [...filtered].sort((a, b) => {
    if (orderBy === "aum" || (dynamicFields.find(f => f.key === orderBy)?.type === 'numeric')) {
      const aNum = Number(a[orderBy] || 0);
      const bNum = Number(b[orderBy] || 0);
      if (order === "asc") {
        return aNum - bNum;
      } else {
        return bNum - aNum;
      }
    }
    const aVal = a[orderBy] ? a[orderBy].toString() : "";
    const bVal = b[orderBy] ? b[orderBy].toString() : "";
    return order === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });
  // ---------------------

  return (
    <Box sx={{ p: 3, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom component="h1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
        Distributor Relationship Management
      </Typography>

      <Paper elevation={4} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, flexWrap: 'wrap' }}>
          
          <Box sx={{ mr: { sm: 2, xs: 0 }, mb: { xs: 2, sm: 0 } }}>
            <FilterBar filters={filters} setFilters={setFilters} fixedFilters={fixedFilters} />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                  variant="outlined" 
                  color="info"
                  startIcon={<ViewColumn />}
                  onClick={() => {
                      setTempVisibleKeys(visibleKeys);
                      setIsColumnModalOpen(true);
                  }}
                  sx={{ whiteSpace: 'nowrap' }}
              >
                  Show/Hide Columns
              </Button>

              <Button 
                  variant="outlined" 
                  color="secondary"
                  startIcon={<Add />}
                  onClick={() => setIsModalOpen(true)}
              >
                  Add New Field
              </Button>
              <Button variant="contained" color="primary" onClick={() => navigate("/add")}>
                  Add Distributor
              </Button>
          </Box>
        </Box>
      </Paper>

      {/* --- ADD NEW FIELD MODAL (UNCHANGED) --- */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogTitle>Add New Field</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            autoFocus margin="dense" label="Field Display Name (e.g., 'Target AUM')" fullWidth
            value={newField.displayName} onChange={(e) => setNewField({ ...newField, displayName: e.target.value })}
          />
          <TextField
            select margin="dense" label="Field Type" fullWidth value={newField.type}
            onChange={(e) => setNewField({ ...newField, type: e.target.value })} sx={{ mt: 2 }}
          >
            {fieldTypes.map((type) => (
              <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>
            ))}
          </TextField>
          {newField.type === "dropdown" && (
            <TextField
              margin="dense" label="Dropdown Options (Comma separated, e.g., 'Option 1, Option 2')" fullWidth
              value={newField.options} onChange={(e) => setNewField({ ...newField, options: e.target.value })}
              multiline rows={2} helperText="Enter options separated by commas."
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button onClick={handleAddNewField} variant="contained">Add Field</Button>
        </DialogActions>
      </Dialog>
      
      {/* --- COLUMN CHOOSER MODAL (UNCHANGED) --- */}
      <Dialog open={isColumnModalOpen} onClose={() => setIsColumnModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Customize Visible Columns</DialogTitle>
        <DialogContent dividers>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Select the columns you want to display in the table.
            </Typography>
            <Grid container spacing={1}>
                {Object.keys(allFieldDefinitions).map((key) => (
                    <Grid item xs={6} sm={4} key={key}>
                        <FormControlLabel
                            control={
                                <Checkbox 
                                    checked={tempVisibleKeys.includes(key)}
                                    onChange={() => handleToggleColumn(key)}
                                />
                            }
                            label={allFieldDefinitions[key]}
                        />
                    </Grid>
                ))}
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setIsColumnModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveColumns} variant="contained" color="primary">Save Layout</Button>
        </DialogActions>
      </Dialog>
      
      {/* --- MAIN TABLE --- */}
      <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 2, overflowX: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
              {/* RENDER HEADERS BASED ONLY ON visibleKeys */}
              {Object.keys(fieldDisplayNames).map((key) => (
                <TableCell 
                  key={key} 
                  sx={{ 
                    fontWeight: 700, 
                    whiteSpace: 'nowrap', 
                    color: theme.palette.primary.dark,
                  }}
                >
                  <TableSortLabel active={orderBy === key} direction={orderBy === key ? order : "asc"} onClick={() => handleSort(key)}>
                    {fieldDisplayNames[key]}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.dark }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedDistributors.length === 0 ? (
                <TableRow><TableCell colSpan={Object.keys(fieldDisplayNames).length + 1} align="center">No distributors found matching the criteria.</TableCell></TableRow>
            ) : (
                sortedDistributors.map((d) => (
                    <TableRow key={d.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover }, '&:hover': { backgroundColor: theme.palette.action.selected } }}>
                        {/* RENDER CELLS BASED ONLY ON visibleKeys */}
                        {Object.keys(fieldDisplayNames).map((key) => {
                            const value = d[key];
                            const dynamicField = dynamicFields.find(f => f.key === key);
                            const isDateOverdue = key === 'follow_up_date' && isOverdue(value);

                            if (key === 'stage' || key === 'priority') {
                                return (
                                    <TableCell key={key}>
                                        <QuickStatusUpdater 
                                            distributorId={d.id} 
                                            fieldKey={key} 
                                            initialValue={value} 
                                            onUpdateSuccess={fetchData} 
                                        />
                                    </TableCell>
                                );
                            }

                            if (key === "aum" || dynamicField?.type === 'numeric') {
                                return <TableCell key={key}>₹{Number(value || 0).toLocaleString('en-IN')}</TableCell>;
                            }
                            
                            if (key === "follow_up_date" && isDateOverdue) {
                                return (
                                    <TableCell key={key}>
                                        <Chip 
                                            label={value || '-'} 
                                            size="small" 
                                            color="error" 
                                            icon={<Warning sx={{ fontSize: 16 }} />} 
                                        />
                                    </TableCell>
                                );
                            }

                            if (key === "linkedIn_url" && value)
                                return (<TableCell key={key}><Link href={value} target="_blank" rel="noopener">LinkedIn</Link></TableCell>);
                            if (key === "notes_link" && value)
                                return (<TableCell key={key}><Link href={value} target="_blank" rel="noopener">Notes Link</Link></TableCell>);
                            
                            return <TableCell key={key}>{value || "-"}</TableCell>;
                        })}
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <IconButton color="primary" onClick={() => navigate(`/view/${d.id}`)}><Visibility /></IconButton>
                            <IconButton color="secondary" onClick={() => navigate(`/edit/${d.id}`)}><Edit /></IconButton>
                        </TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DistributorList;
