import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    type: "light",
    primary: {
      main: "#e5598f",
      light: "#ffabcb",
      dark: "#bd4475",
    },
    secondary: {
      main: "#ff6a3f",
      dark: "#f55224",
      light: "#ff9b7d",
    },
    peach: {
      main: "#ffdfc8",
    },
  },
  typography: {
    fontFamily: "Roboto, Helvetica, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          letterSpacing: "0.15px",
        },
      },
    },
  },
});

export default theme;
