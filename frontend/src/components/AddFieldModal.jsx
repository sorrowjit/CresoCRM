import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

const AddFieldModal = ({ open, handleClose, addField }) => {
  const [fieldName, setFieldName] = useState("");

  const handleAdd = () => {
    if (fieldName.trim()) {
      addField(fieldName.trim());
      setFieldName("");
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add New Field</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label="Field Name"
          fullWidth
          variant="outlined"
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleAdd} variant="contained" color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFieldModal;
