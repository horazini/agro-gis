import "./App.css";

import { Route, Routes } from "react-router";
import { BrowserRouter, Navigate } from "react-router-dom";

import { Container } from "@mui/system";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

import { useSelector } from "react-redux";
import { RootState } from "./redux/store";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import NavbarDrawer from "./components/navbarDrawer";
import Footer from "./components/footer";

import Login from "./layouts/app/login";
import Home from "./layouts/app/home";
import NoMatch from "./layouts/app/nomatch";

import Login2 from "./layouts/app/login2";

import TenantList from "./layouts/tenants/tenantslist";
import TenantForm from "./layouts/tenants/tenantform";
import TenantDetails from "./layouts/tenants/tenantdetails";

import SpeciesList from "./layouts/species/specieslist";
import SpeciesForm from "./layouts/species/speciesform";

import MapView from "./layouts/maps/map";
import MapView2 from "./layouts/maps/map2";
import MapView3 from "./layouts/maps/map3";
import MapView4 from "./layouts/maps/map4";
import MapView5 from "./layouts/maps/map5";

function MainLayoutRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Navigate to="/" />} />;
      <Route path="*" element={<NoMatch />} />
      <Route path="/tenants/list" element={<TenantList />} />
      <Route path="/tenants/new" element={<TenantForm />} />
      <Route path="/tenants/:id" element={<TenantDetails />} />
      <Route path="/species/list" element={<SpeciesList />} />
      <Route path="/species/new" element={<SpeciesForm />} />
      <Route path="/species/:id/edit" element={<SpeciesForm />} />
      <Route path="/map" element={<MapView />} />
      <Route path="/map2" element={<MapView2 />} />
      <Route path="/map3" element={<MapView3 />} />
      <Route path="/map4" element={<MapView4 />} />
      <Route path="/map5" element={<MapView5 />} />
    </Routes>
  );
}

function RouteAuthLogic(): JSX.Element {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  //  if (isAuthenticated && userTypeId === 1) { // Para implementar logica de tipos de usuario

  if (!isAuthenticated) {
    // Si no está autenticado, se redirige al usuario al inicio de sesión
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
      <>
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
      </>
    );
  }
}

function App(): JSX.Element {
  dayjs.locale("es"); // idioma de la biblioteca de manipulación de fechas

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
