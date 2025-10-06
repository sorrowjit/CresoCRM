// src/components/AddDistributorModal.jsx
import React, { useState } from "react";
import { Modal, Box, Typography, TextField, Button, Divider, Grid } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 900,
  maxHeight: "90vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  overflowY: "auto",
};

const AddDistributorModal = ({ open, onClose, onAdd }) => {
  const initialState = {
    arn: "", arn_holder_name: "", address: "", pin: "", email: "", city: "",
    telephone_r: "", telephone_o: "", arn_valid_from: "", arn_valid_till: "", kyd_compliant: "",
    euin: "", date_added: "", owner: "", lead_source: "", first_call_date: "", stage: "",
    platform_used: "", aum: "", priority: "", notes: "", follow_up_date: "", notes_link: "",
    secondary_contact: "", secondary_name: "", linkedIn_url: ""
  };
  const [data, setData] = useState(initialState);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    onAdd(data);
    setData(initialState);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h5" gutterBottom>Add Distributor</Typography>
        <Grid container spacing={2}>
          {Object.keys(initialState).map(field => (
            <Grid item xs={12} sm={6} key={field}>
              <TextField
                fullWidth
                label={field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                name={field}
                value={data[field]}
                onChange={handleChange}
                size="small"
                type={field.toLowerCase().includes("date") ? "date" : "text"}
                InputLabelProps={field.toLowerCase().includes("date") ? { shrink: true } : {}}
              />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
          <Button variant="outlined" onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddDistributorModal;
