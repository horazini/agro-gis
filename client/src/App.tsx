// Style and theme
import "./App.css";
import { styled } from "@mui/material/styles";
import { ThemeProvider } from "./components/themeContext";

// Date handling
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

// Auth state
import { useSelector } from "react-redux";
import { RootState } from "./redux/store";

// Navigation
import { Fragment } from "react";
import { Route, Routes } from "react-router";
import { BrowserRouter, Navigate } from "react-router-dom";

// Layout Wrapper
import { Container } from "@mui/system";
import { Box } from "@mui/material";
import NavbarDrawer from "./components/navbarDrawer";
import Footer from "./components/footer";

// Routes
import Login from "./layouts/app/login";
import Home from "./layouts/app/home";
import MainLayoutRoutes from "./routes/MainLayoutRoutes";

function RouteAuthLogic(): JSX.Element {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return (
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          height: "100vh",
          overflow: "auto",
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[200]
              : theme.palette.background.default,
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />;
        </Routes>
      </Box>
    );
  } else {
    const DrawerHeader = styled("div")(({ theme }) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
    }));
    return (
      <Fragment>
        <NavbarDrawer />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            paddingTop: 3,
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            height: "100vh",
            overflow: "auto",
            backgroundColor: (theme) =>
              theme.palette.mode === "light" ? theme.palette.grey[200] : null,
          }}
        >
          <DrawerHeader />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Navigate to="/" />} />;
            <Route
              path="*"
              element={
                <Container sx={{ paddingBottom: 6 }}>
                  <MainLayoutRoutes />{" "}
                </Container>
              }
            />
          </Routes>

          <Footer />
        </Box>
      </Fragment>
    );
  }
}

function App(): JSX.Element {
  dayjs.locale("es"); // idioma de la biblioteca de manipulación de fechas

  return (
    <ThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <Box sx={{ display: "flex" }}>
          <BrowserRouter>
            <Routes>
              <Route path="*" element={<RouteAuthLogic />} />
            </Routes>
          </BrowserRouter>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
