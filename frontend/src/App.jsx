import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box } from "@mui/material"; // Removed unused Button import
import DistributorList from "./components/DistributorList";
import DistributorDetail from "./components/DistributorDetail";
import DistributorForm from "./components/DistributorForm";
import theme from "./theme";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ p: 2 }}>
          <Routes>
            <Route path="/" element={<DistributorList />} />
            {/* View route remains DistributorDetail (view-only) */}
            <Route path="/view/:id" element={<DistributorDetail />} />
            {/* FIX: Edit route now points to DistributorForm (full CRUD logic) */}
            <Route path="/edit/:id" element={<DistributorForm />} /> 
            <Route path="/add" element={<DistributorForm />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}
