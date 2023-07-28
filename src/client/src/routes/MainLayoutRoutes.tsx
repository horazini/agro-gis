// Navigation
import { Route, Routes } from "react-router";
import { Navigate } from "react-router-dom";

// Auth state
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

import Home from "../layouts/app/home";
import NoMatch from "../layouts/app/nomatch";

import TenantList from "../layouts/tenants/tenantslist";
import TenantForm from "../layouts/tenants/tenantform";
import TenantDetails from "../layouts/tenants/tenantdetails";

import SpeciesList from "../layouts/species/specieslist";
import SpeciesForm from "../layouts/species/speciesform";

import CropLandplotsMap from "../layouts/maps/croplandplotsmap";
import CropRegisterMap from "../layouts/maps/cropregistermap";
import MapView from "../layouts/maps/map";
import MapView2 from "../layouts/maps/map2";
import LandplotManagementMap from "../layouts/maps/landplotmanagementmap";

import Calendar from "../layouts/tasks/taskcalendar";

const routeList = [
  {
    path: "/tenants/list",
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
    path: "/species/list",
    element: <SpeciesList />,
    allowed: [2, 3, 5, 6],
  },
  {
    path: "/species/new",
    element: <SpeciesForm />,
    allowed: [3, 5],
  },
  {
    path: "/species/:id/edit",
    element: <SpeciesForm />,
    allowed: [3, 5],
  },
  {
    path: "/landplotmanagement",
    element: <LandplotManagementMap />,
    allowed: [3, 4],
  },
  {
    path: "/croplandplots",
    element: <CropLandplotsMap />,
    allowed: [2, 3, 4, 6],
  },
  {
    path: "/cropregister",
    element: <CropRegisterMap />,
    allowed: [3, 6],
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

export default function MainLayoutRoutes(): JSX.Element {
  const { userTypeId } = useSelector((state: RootState) => state.auth);
  const allowedRoutes = routeList.filter((route) =>
    route.allowed.includes(userTypeId || 0)
  );

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Navigate to="/" />} />;
      {allowedRoutes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
      <Route path="*" element={<NoMatch />} />
    </Routes>
  );
}
