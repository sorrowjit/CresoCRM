import React from "react";
import { Box, TextField, MenuItem, Button } from "@mui/material";

const FilterBar = ({ filters, setFilters, fixedFilters }) => {
  const priorities = ["All", "High", "Medium", "Low", "In Discussion"];

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleClear = () => {
    const cleared = {};
    Object.keys(filters).forEach((k) => (cleared[k] = ""));
    setFilters(cleared);
  };

  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      {fixedFilters.map((field) => {
        if (field === "priority") {
          return (
            <TextField
              key={field}
              select
              label="Priority"
              name="priority"
              value={filters.priority || "All"}
              onChange={handleChange}
              size="small"
            >
              {priorities.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
          );
        }
        if (field === "aum") {
          return (
            <TextField
              key={field}
              label="AUM >= "
              name="aum"
              type="number"
              value={filters.aum || ""}
              onChange={handleChange}
              size="small"
            />
          );
        }
        return (
          <TextField
            key={field}
            label={field.replace("_", " ").toUpperCase()}
            name={field}
            value={filters[field] || ""}
            onChange={handleChange}
            size="small"
          />
        );
      })}
      <Button variant="outlined" onClick={handleClear}>
        Clear Filters
      </Button>
    </Box>
  );
};

export default FilterBar;
