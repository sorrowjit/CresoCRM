import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#2563EB" },
    secondary: { main: "#4CAF50" },
    background: { default: "#F9FAFB", paper: "#FFFFFF" },
    text: { primary: "#1F2937" },
  },
  typography: { fontFamily: "Roboto, Arial, sans-serif" },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, textTransform: "none" },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, backgroundColor: "#E3F2FD" },
      },
    },
  },
});

export default theme;
