import { Router } from "express";
const router = Router();

// Test endpoint

import { getTime } from "../controllers/user.controllers";

router.get("/", getTime);

// Tenant, user and auth logic

// auth

import { verifyCredentials, login } from "../controllers/user.controllers";

router.post("/verifycredentials", verifyCredentials);
router.post("/login", login);

// Users

import {
  getUsers,
  createUser,
  updateUser,
  getUserTypes,
  getUsersByTenant,
  usernameAlreadyExists,
  renameUsernameAlreadyExists,
  getUserData,
  disableUser,
  enableUser,
  resetUserPassword,
} from "../controllers/user.controllers";

router.get("/users", getUsers);
router.post("/user", createUser);
router.put("/user", updateUser);
router.get("/usertypes", getUserTypes);
router.get("/tenantusers/:id", getUsersByTenant);
router.post("/usernameexists", usernameAlreadyExists);
router.post("/renameusernameexists", renameUsernameAlreadyExists);
router.get("/userdata/:id", getUserData);
router.put("/disableuser/:id", disableUser);
router.put("/enableuser/:id", enableUser);
router.put("/userpassword", resetUserPassword);

// Tenants

import {
  getTenants,
  updateTenant,
  getTenantById,
  createTenantWithUsers,
  getEnabledTenantUsers,
  getTenantData,
  tenantNameAlreadyExists,
  renameTenantNameAlreadyExists,
  disableTenant,
  enableTenant,
} from "../controllers/tenant.controllers";

router.get("/tenants", getTenants);
router.get("/tenant/:id", getTenantById);
router.post("/tenantdata", createTenantWithUsers);
router.put("/tenantdata", updateTenant);
router.get("/tenantusers/:id", getEnabledTenantUsers);
router.get("/tenantdata/:id", getTenantData);
router.post("/tenantnameexists", tenantNameAlreadyExists);
router.post("/renametenantnameexists", renameTenantNameAlreadyExists);
router.put("/disabletenant/:id", disableTenant);
router.put("/enabletenant/:id", enableTenant);

// Data tables

// Species

import {
  getSpecies,
  getSpeciesByTenant,
  getSpeciesDataById,
  getDetailedSpeciesDataById,
  createSpecies,
  //deleteSpecies,
  updateSpecies,
  createSpeciesWithStagesAndEvents,
  disableSpecies,
  enableSpecies,
} from "../controllers/species.controllers";

router.get("/species", getSpecies);
router.get("/speciesdata/:id", getSpeciesDataById);
router.get("/detailedspeciesdata/:id", getDetailedSpeciesDataById);
router.get("/tenantspecies/:id", getSpeciesByTenant);
router.post("/species", createSpecies);
router.post("/speciesdata", createSpeciesWithStagesAndEvents);
router.put("/species/:id", updateSpecies);
//router.delete("/species/:id", deleteSpecies);
router.put("/disablespecies/:id", disableSpecies);
router.put("/enablespecies/:id", enableSpecies);

// Geo

import {
  getLandplotWithCrops,
  getTenantGeoWithCurrentCrops,
  getTenantLandplots,
  getAvailableAndOccupiedTenantGeo,
  updateFeatures,
  createSnapshot,
  getLandplotSnapshots,
  getCropSnapshots,
  deleteSnapshot,
  getAvailableAndOccupiedTenantAreasSum,
  getTenantSpeciesCropsAreasSum,
} from "../controllers/landplot.controllers";

router.get("/landplotdata/:id", getLandplotWithCrops);
router.get("/tenantgeo/:tenantId", getTenantLandplots); // used only on development components
router.get("/tenantgeocurrentdata/:tenantId", getTenantGeoWithCurrentCrops);
router.get("/availabletenantGeo/:tenantId", getAvailableAndOccupiedTenantGeo);
router.put("/features", updateFeatures);
router.get(
  "/availabletenantareas/:tenantId",
  getAvailableAndOccupiedTenantAreasSum
);
router.get(
  "/tenantspeciescropsareassum/:tenantId",
  getTenantSpeciesCropsAreasSum
);

router.post("/snapshot", createSnapshot);
router.get("/landplotsnapshots/:id", getLandplotSnapshots);
router.get("/cropsnapshots/:id", getCropSnapshots);
router.delete("/snapshot/:id", deleteSnapshot);

// Crops

import {
  getCrops,
  createCrop,
  getCropDataById,
  setDoneCropEvent,
  addCropEvent,
  setCropStageComment,
  setFinishedCropStage,
  setCropComment,
  setFinishedCrop,
  getTenantCropData,
  getCropTasksById,
  getAllTenantTasks,
  getAllCalendarTenantTasks,
  getOngoingCropsCalendarTenantTasks,
  getFulfilledCropsCalendarTenantTasks,
  getNextHarvest,
  //getTenantPendingTasks,
  getTenantPendingTasksNumber,
} from "../controllers/crop.controllers";

router.get("/crop", getCrops);
router.post("/crop", createCrop);
router.get("/cropdata/:id", getCropDataById);
router.put("/donecropevent/:id", setDoneCropEvent);
router.post("/cropevent", addCropEvent);
router.put("/cropstagecomment/:id", setCropStageComment);
router.put("/donecropstage/:id", setFinishedCropStage);
router.put("/cropcomment/:id", setCropComment);
router.put("/donecrop/:id", setFinishedCrop);
router.get("/tenantcropdata/:tenantId", getTenantCropData);
router.get("/croptasks/:id", getCropTasksById);
router.get("/alltenanttasks/:tenantId", getAllTenantTasks);
router.get("/allcalendartenanttasks/:tenantId", getAllCalendarTenantTasks);
router.get(
  "/ongoingcalendartasks/:tenantId",
  getOngoingCropsCalendarTenantTasks
);
router.get(
  "/fulfilledcalendartasks/:tenantId",
  getFulfilledCropsCalendarTenantTasks
);
router.get("/nextharvest/:tenantId", getNextHarvest);
//router.get("/pendingtasks/:tenantId", getTenantPendingTasks);
router.get("/pendingtasksnumber/:tenantId", getTenantPendingTasksNumber);

// Reports

import {
  getSpeciesReport,
  getLandplotReport,
} from "../controllers/report.controllers";

router.put("/speciesreport", getSpeciesReport);
router.put("/landplotreport", getLandplotReport);

export default router;
