// Navigation
import { Route, Routes } from "react-router";

// Auth state
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

// Error boundary
import { Component, ReactNode } from "react";
import { Typography } from "@mui/material";
import { Link } from "react-router-dom";

import NoMatch from "../layouts/app/nomatch";

import Profile from "../layouts/user/profile";

import TenantList from "../layouts/tenants/tenantslist";
import TenantForm from "../layouts/tenants/newtenantform/tenantform";
import TenantDetails from "../layouts/tenants/tenantdetails";

import TenantUsers from "../layouts/tenants/userlist";
import UserDetails from "../layouts/tenants/userdetails";
import UserForm from "../layouts/tenants/userform";

import SpeciesList from "../layouts/species/specieslist";
import SpeciesDetails from "../layouts/species/speciesdetails";
import SpeciesForm from "../layouts/species/speciesform";

import MapView from "../layouts/maps/map";
import MapView2 from "../layouts/maps/map2";
import LandplotManagementMap from "../layouts/maps/landplotmanagementmap";
import LandplotDetails from "../layouts/maps/landplotdetails";

import CropLandplotsMap from "../layouts/maps/croplandplotsmap";
import CropDetails from "../layouts/crops/cropdetails";
import CropsList from "../layouts/crops/cropslist";

import { CropLoader, LandplotLoader } from "../layouts/maps/snapshotsgallery";

import Calendar from "../layouts/tasks/taskcalendar";

const routeList = [
  {
    path: "/profile",
    element: <Profile />,
    allowed: [1, 2, 3, 4, 5, 6],
  },
  {
    path: "/tenants",
    element: <TenantList />,
    allowed: [1],
  },
  {
    path: "/tenants/new",
    element: <TenantForm />,
    allowed: [1],
  },
  {
    path: "/tenants/:id",
    element: <TenantDetails />,
    allowed: [1],
  },
  {
    path: "/tenants/:id/edit",
    element: <TenantForm />,
    allowed: [1],
  },
  {
    path: "/users",
    element: <TenantUsers />,
    allowed: [2, 3],
  },
  {
    path: "/users/new",
    element: <UserForm />,
    allowed: [1, 2, 3],
  },
  {
    path: "/users/:id",
    element: <UserDetails />,
    allowed: [1, 2, 3],
  },
  {
    path: "/users/:id/edit",
    element: <UserForm />,
    allowed: [1, 2, 3],
  },
  {
    path: "/species",
    element: <SpeciesList />,
    allowed: [2, 3, 5, 6],
  },
  {
    path: "/species/new",
    element: <SpeciesForm />,
    allowed: [3, 5],
  },
  {
    path: "/species/:id",
    element: <SpeciesDetails />,
    allowed: [2, 3],
  },
  {
    path: "/species/:id/edit",
    element: <SpeciesForm />,
    allowed: [3, 5],
  },
  {
    path: "/landplots",
    element: <CropLandplotsMap />,
    allowed: [2, 3, 4, 6],
  },
  {
    path: "/landplots/management",
    element: <LandplotManagementMap />,
    allowed: [3, 4],
  },
  {
    path: "/landplots/:id",
    element: <LandplotDetails />,
    allowed: [2, 3, 4, 6],
  },
  {
    path: "/landplots/:id/snapshots",
    element: <LandplotLoader />,
    allowed: [2, 3, 4, 5, 6],
  },
  {
    path: "/crops",
    element: <CropsList />,
    allowed: [2, 3, 4, 6],
  },
  {
    path: "/crops/:id",
    element: <CropDetails />,
    allowed: [2, 3, 4, 5, 6],
  },
  {
    path: "/crops/:id/snapshots",
    element: <CropLoader />,
    allowed: [2, 3, 4, 5, 6],
  },
  {
    path: "/map",
    element: <MapView />,
    allowed: [2, 3, 4, 6],
  },
  {
    path: "/map2",
    element: <MapView2 />,
    allowed: [3, 4],
  },
  {
    path: "/calendar",
    element: <Calendar />,
    allowed: [2, 3, 6],
  },
];

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Puedes agregar lógica de registro de errores aquí
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Puedes renderizar un componente de error personalizado aquí
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "15vh",
          }}
        >
          <Typography
            component={"span"}
            style={{
              textAlign: "center",
            }}
          >
            <h1>
              ¡Vaya! 😧 Algo ha salido mal.
              <br />
            </h1>
            <h1>
              Intente nuevamente.
              <br />
              Si el problema persiste contacte a su proveedor de servicio.
              <br />
              <br />
            </h1>
            <h1>
              <Link
                to="/"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                Ir a inicio
              </Link>
            </h1>
          </Typography>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function MainLayoutRoutes(): JSX.Element {
  const { userTypeId } = useSelector((state: RootState) => state.auth);
  const allowedRoutes = routeList.filter((route) =>
    route.allowed.includes(userTypeId || 0)
  );

  return (
    <ErrorBoundary>
      <Routes>
        {allowedRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </ErrorBoundary>
  );
}
