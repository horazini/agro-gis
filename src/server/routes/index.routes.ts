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
  getTenantUsers,
  createTenantWithUsers,
  getTenantWithUsers,
} from "../controllers/tenant.controllers";

router.get("/time", getTime);

router.get("/tenants", getTenants);
router.get("/tenant/:id", getTenantById);
router.put("/tenant/:id", updateTenant);
router.delete("/tenant/:id", deleteTenant);

router.get("/tenantusers/:id", getTenantUsers);

router.post("/tenantdata", createTenantWithUsers);
router.get("/tenantdata/:id", getTenantWithUsers);

// Users

import {
  getUsers,
  createUser,
  getUserTypes,
} from "../controllers/user.controllers";

router.get("/users", getUsers);
router.post("/user", createUser);
router.get("/usertypes", getUserTypes);

// auth

import { login, getUserData } from "../controllers/user.controllers";

router.post("/login", login);
router.get("/user", getUserData);

// Data tables

// Species

import {
  getSpecies,
  getSpeciesById,
  createSpecies,
  deleteSpecies,
  updateSpecies,
} from "../controllers/species.controllers";

router.get("/species", getSpecies);
router.get("/species/:id", getSpeciesById);
router.post("/species", createSpecies);
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
