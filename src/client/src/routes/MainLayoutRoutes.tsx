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

import TenantUsers from "../layouts/tenants/tenantusers";
import UserDetails from "../layouts/tenants/userdetails";

import SpeciesList from "../layouts/species/specieslist";
import SpeciesForm from "../layouts/species/speciesform";

import MapView from "../layouts/maps/map";
import MapView2 from "../layouts/maps/map2";
import LandplotManagementMap from "../layouts/maps/landplotmanagementmap";
import LandplotDetails from "../layouts/maps/landplotdetails";

import CropLandplotsMap from "../layouts/maps/croplandplotsmap";
import CropDetails from "../layouts/crops/cropdetails";
import CropsList from "../layouts/crops/cropslist";

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
    path: "/users",
    element: <TenantUsers />,
    allowed: [2, 3],
  },
  {
    path: "/users/:id",
    element: <UserDetails />,
    allowed: [2, 3],
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
    path: "/landplotdetails/:id",
    element: <LandplotDetails />,
    allowed: [2, 3, 4, 6],
  },
  {
    path: "/crops",
    element: <CropsList />,
    allowed: [2, 3, 4, 6],
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
  {
    path: "/cropdetails/:id",
    element: <CropDetails />,
    allowed: [1, 2, 3, 4, 5, 6],
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
