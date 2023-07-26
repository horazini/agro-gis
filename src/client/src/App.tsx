import "./App.css";

// Navigation
import { Fragment } from "react";
import { Route, Routes } from "react-router";
import { BrowserRouter, Navigate } from "react-router-dom";

// Auth state
import { useSelector } from "react-redux";
import { RootState } from "./redux/store";

// Date handling
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

// Layout Wrapper
import { Container } from "@mui/system";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import NavbarDrawer from "./components/navbarDrawer";
import Footer from "./components/footer";

// Routes
import Login from "./layouts/app/login";
import Login2 from "./layouts/app/login2";
import MainLayoutRoutes from "./routes/MainLayoutRoutes";

function RouteAuthLogic(): JSX.Element {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/login2" element={<Login2 />} />; {/* Prueba */}
        <Route path="*" element={<Navigate to="/login" />} />;
      </Routes>
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
          }}
        >
          <DrawerHeader />

          <Container sx={{ paddingBottom: 6 }}>
            <MainLayoutRoutes />
          </Container>

          <Footer />
        </Box>
      </Fragment>
    );
  }
}

function App(): JSX.Element {
  dayjs.locale("es"); // idioma de la biblioteca de manipulación de fechas

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Box sx={{ display: "flex" }}>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<RouteAuthLogic />} />
          </Routes>
        </BrowserRouter>
      </Box>
    </LocalizationProvider>
  );
}

export default App;
