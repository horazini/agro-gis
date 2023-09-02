import { Router } from "express";
const router = Router();

// Tenant, user and auth logic

// Tenants

import {
  getTime,
  getTenants,
  updateTenant,
  deleteTenant,
  getTenantById,
  createTenantWithUsers,
  getTenantData,
} from "../controllers/tenant.controllers";

router.get("/", getTime);

router.get("/tenants", getTenants);
router.get("/tenant/:id", getTenantById);
router.put("/tenant/:id", updateTenant);
router.delete("/tenant/:id", deleteTenant);

router.post("/tenantdata", createTenantWithUsers);
router.get("/tenantdata/:id", getTenantData);

// Users

import {
  getUsers,
  createUser,
  getUserTypes,
  getTenantUserTypes,
  getUsersByTenant,
  usernameAlreadyExists,
} from "../controllers/user.controllers";

router.get("/users", getUsers);
router.post("/user", createUser);
router.get("/usertypes", getUserTypes);
router.get("/tenantusertypes", getTenantUserTypes);
router.get("/tenantusers/:id", getUsersByTenant);
router.post("/usernameexists", usernameAlreadyExists);

// auth

import { login, getUserData } from "../controllers/user.controllers";

router.post("/login", login);
router.get("/user", getUserData);

// Data tables

// Species

import {
  getSpecies,
  getSpeciesByTenant,
  getSpeciesDataById,
  createSpecies,
  deleteSpecies,
  updateSpecies,
  createSpeciesWithStagesAndEvents,
} from "../controllers/species.controllers";

router.get("/species", getSpecies);
router.get("/speciesdata/:id", getSpeciesDataById);
router.get("/tenantspecies/:id", getSpeciesByTenant);
router.post("/species", createSpecies);
router.post("/speciesdata", createSpeciesWithStagesAndEvents);
router.put("/species/:id", updateSpecies);
router.delete("/species/:id", deleteSpecies);

// Geo

import {
  getGeo,
  getGeoWithCrops,
  getTenantGeoWithCurrentCrops,
  getTenantGeo,
  getAvailableAndOccupiedTenantGeo,
  createFeatures,
  updateFeatures,
} from "../controllers/geo.controllers";

router.get("/geo", getGeo); // not used

router.get("/geodata/:id", getGeoWithCrops); // not used (yet)
router.get("/tenantgeo/:tenantId", getTenantGeo); // used only on development components
router.get("/tenantgeocurrentdata/:tenantId", getTenantGeoWithCurrentCrops);
router.get("/availabletenantGeo/:tenantId", getAvailableAndOccupiedTenantGeo);
router.post("/features", createFeatures);
router.put("/features", updateFeatures);

// Crops

import {
  getCrops,
  //getTenantCrops,
  createCrop,
  getCropDataById,
  setDoneCropEvent,
  setFinishedCropStage,
} from "../controllers/crop.controllers";

router.get("/crop", getCrops);
router.post("/crop", createCrop);
router.get("/cropdata/:id", getCropDataById);
router.put("/donecropevent/:id", setDoneCropEvent);
router.put("/donecropstage/:id", setFinishedCropStage);

export default router;
