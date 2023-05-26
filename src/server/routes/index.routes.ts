import { Router } from "express";
const router = Router();

router.get("/test", (req, res) => res.send("hello world"));

// Tenant, user and auth logic

// Tenants

import {
  getTime,
  getTenants,
  updateTenant,
  deleteTenant,
  getTenantById,
  createTenantWithUsers,
  getTenantWithUsers,
} from "../controllers/tenant.controllers";

router.get("/time", getTime);

router.get("/tenants", getTenants);
router.get("/tenant/:id", getTenantById);
router.put("/tenant/:id", updateTenant);
router.delete("/tenant/:id", deleteTenant);

router.post("/tenantdata", createTenantWithUsers);
router.get("/tenantdata/:id", getTenantWithUsers);

// Users

import {
  getUsers,
  createUser,
  getUserTypes,
  getTenantUserTypes,
  getUsersByTenant,
} from "../controllers/user.controllers";

router.get("/users", getUsers);
router.post("/user", createUser);
router.get("/usertypes", getUserTypes);
router.get("/tenantusertypes", getTenantUserTypes);
router.get("/tenantusers/:id", getUsersByTenant);

// auth

import { login, getUserData } from "../controllers/user.controllers";

router.post("/login", login);
router.get("/user", getUserData);

// Data tables

// Species

import {
  getSpecies,
  getSpeciesByTenant,
  getSpeciesById,
  createSpecies,
  deleteSpecies,
  updateSpecies,
  createSpeciesWithStagesAndEvents,
} from "../controllers/species.controllers";

router.get("/species", getSpecies);
router.get("/species/:id", getSpeciesById);
router.get("/tenantspecies/:id", getSpeciesByTenant);
router.post("/species", createSpecies);
router.post("/speciesdata", createSpeciesWithStagesAndEvents);
router.put("/species/:id", updateSpecies);
router.delete("/species/:id", deleteSpecies);

// Geo

import {
  getGeo,
  getTenantGeo,
  createGeo,
} from "../controllers/geo.controllers";

router.get("/geo", getGeo);
router.get("/tenantGeo/:tenantId", getTenantGeo);
router.post("/geo", createGeo);

export default router;
