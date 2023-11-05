import { Router } from "express";
const router = Router();

// Tenant, user and auth logic

// Tenants

import {
  getTime,
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

router.get("/", getTime);

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

// auth

import { login } from "../controllers/user.controllers";

router.post("/login", login);

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
  getGeo,
  getGeoWithCrops,
  getTenantGeoWithCurrentCrops,
  getTenantGeo,
  getAvailableAndOccupiedTenantGeo,
  updateFeatures,
  createSnapshot,
  getSnapshot,
} from "../controllers/landplot.controllers";

router.get("/geo", getGeo); // not used

router.get("/geodata/:id", getGeoWithCrops); // not used (yet)
router.get("/tenantgeo/:tenantId", getTenantGeo); // used only on development components
router.get("/tenantgeocurrentdata/:tenantId", getTenantGeoWithCurrentCrops);
router.get("/availabletenantGeo/:tenantId", getAvailableAndOccupiedTenantGeo);
router.put("/features", updateFeatures);

router.post("/snapshot", createSnapshot);
router.get("/snapshot", getSnapshot);

// Crops

import {
  getCrops,
  //getTenantCrops,
  createCrop,
  getCropDataById,
  setDoneCropEvent,
  setFinishedCropStage,
  setFinishedCrop,
  getTenantCropData,
  getCropTasksById,
  getAllTenantTasks,
  getAllCalendarTenantTasks,
} from "../controllers/crop.controllers";

router.get("/crop", getCrops);
router.post("/crop", createCrop);
router.get("/cropdata/:id", getCropDataById);
router.put("/donecropevent/:id", setDoneCropEvent);
router.put("/donecropstage/:id", setFinishedCropStage);
router.put("/donecrop/:id", setFinishedCrop);
router.get("/tenantcropdata/:tenantId", getTenantCropData);
router.get("/croptasks/:id", getCropTasksById);
router.get("/alltenanttasks/:tenantId", getAllTenantTasks);
router.get("/allcalendartenanttasks/:tenantId", getAllCalendarTenantTasks);

export default router;
