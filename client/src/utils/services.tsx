import { API } from "../config";
import axios from "axios";
import bcrypt from "bcryptjs";

const api = axios.create({
  baseURL: API,
});

// Interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Project hash function

export function hashFunction(password: string) {
  return bcrypt.hashSync(password, 10);
}

// Tenants

export type tenantMainData = {
  id: number;
  name: string;
  deleted: boolean;
};

export type tenantDetailedData = {
  id?: number;
  name: string;
  representatives_names: string;
  representatives_surname: string;
  locality: string;
  email: string;
  phone: string | number;
  deleted?: boolean;
};

export type userDataType = {
  id?: number;
  usertype_id: number;
  mail_address: string;
  username: string;
  names: string;
  surname: string;
  password_hash: string;
  deleted?: boolean;
};

export type tenantDataType = {
  tenant: tenantDetailedData;
  users: userDataType[];
};

export const getTenants = async () => {
  try {
    const response = await api.get("/tenants");
    const data: tenantMainData[] = response.data;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const tenantNameAlreadyExists = async (
  tenantName: string,
  currentTenantId?: number
) => {
  if (currentTenantId) {
    const res = await api.post(
      "/renametenantnameexists",
      { tenantName, currentTenantId },
      {
        headers: { "Content-type": "application/json" },
      }
    );
    const bool = res.data;
    return bool;
  } else {
    const res = await api.post(
      "/tenantnameexists",
      { tenantName },
      {
        headers: { "Content-type": "application/json" },
      }
    );
    const bool = res.data;
    return bool;
  }
};

export const getTenantUsers = async (id: number) => {
  const res = await api.get(`/tenantusers/${id}`);
  const data = res.data;
  return data;
};

export const getTenantData = async (id: string) => {
  try {
    const res = await api.get(`/tenantdata/${id}`);
    const data = res.data;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const postTenantData = async (tenantData: tenantDataType) => {
  try {
    const res = await api.post(`/tenantdata`, tenantData, {
      headers: { "Content-type": "application/json" },
    });
    return res.status;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const putTenantData = async (tenantPutData: tenantDetailedData) => {
  const res = await api.put(`/tenantdata`, tenantPutData, {
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const disableTenant = async (tenantId: number) => {
  const res = await api.put(`/disabletenant/${tenantId}`);
  return res.status;
};

export const enableTenant = async (tenantId: number) => {
  const res = await api.put(`/enabletenant/${tenantId}`);
  return res.status;
};

// Users

export type userType = {
  id: number;
  name: string;
};

export const usernameAlreadyExists = async (
  username: string,
  currentUsernameId?: number
) => {
  if (currentUsernameId) {
    const res = await api.post(
      `/renameusernameexists`,
      { username, currentUsernameId },
      {
        headers: { "Content-type": "application/json" },
      }
    );
    const bool = res.data;
    return bool;
  } else {
    const res = await api.post(
      `/usernameexists`,
      { username },
      {
        headers: { "Content-type": "application/json" },
      }
    );
    const bool = res.data;
    return bool;
  }
};

export const verifyCredentials = async (username: string, password: string) => {
  const res = await api.post(
    `/verifycredentials`,
    { username, password },
    {
      headers: { "Content-type": "application/json" },
    }
  );
  const bool = res.data;
  return bool;
};

export const resetUserPassword = async (
  userId: number,
  username: string,
  prevPassword: string,
  newPasswordHash: string
) => {
  const res = await api.put(
    `/userpassword`,
    { userId, username, prevPassword, newPasswordHash },
    {
      headers: { "Content-type": "application/json" },
    }
  );
  return res.status;
};

export const getUserData = async (id: string) => {
  const res = await api.get(`/userdata/${id}`);
  const data = res.data;
  return data;
};

export const postUser = async (userData: userDataType) => {
  const res = await api.post(`/user`, userData, {
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const putUser = async (userData: userDataType) => {
  const res = await api.put(`/user`, userData, {
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const disableUser = async (userId: number) => {
  const res = await api.put(`/disableuser/${userId}`);
  return res.status;
};

export const enableUser = async (userId: number) => {
  const res = await api.put(`/enableuser/${userId}`);
  return res.status;
};

// Species

export type speciesMainData = {
  id: number;
  name: string;
  description: string;
  tenant_id: number;
};

export type speciesDataType = {
  species: {
    id: number | null;
    name: string;
    description: string;
    tenant_id: number;
  };
  stages: {
    id: number | null;
    name: string;
    description: string;
    estimated_time: string;
    growthEvents: {
      name: string;
      description: string;
      et_from_stage_start: string;
      time_period: string | undefined;
    }[];
  }[];
};

export const getSpeciesData = async (id: string) => {
  const res = await api.get(`/speciesdata/${id}`);
  const data = res.data;
  return data;
};

export const getDetailedSpeciesData = async (id: string) => {
  const res = await api.get(`/detailedspeciesdata/${id}`);
  const data = res.data;
  return data;
};

export const getTenantSpecies = async (tenantId: number) => {
  const res = await api.get(`/tenantspecies/${tenantId}`);
  const data = res.data;
  return data;
};

export const postSpeciesData = async (speciesData: speciesDataType) => {
  const res = await api.post("/speciesdata", speciesData, {
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const putSpeciesData = async (
  updateData: object,
  speciesId: string | undefined
) => {
  const res = await api.put(`/species/${speciesId}`, updateData, {
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const disableSpecies = async (speciesId: number) => {
  const res = await api.put(`/disablespecies/${speciesId}`);
  return res.status;
};

export const enableSpecies = async (speciesId: number) => {
  const res = await api.put(`/enablespecies/${speciesId}`);
  return res.status;
};

// Landplots

export const getTenantGeo = async (tenantId: number) => {
  const res = await api.get(`/tenantGeo/${tenantId}`);
  const data = res.data;
  return data;
};

export const getAvailableAndOccupiedTenantGeo = async (tenantId: number) => {
  const res = await api.get(`/availabletenantGeo/${tenantId}`);
  const data = res.data;
  return data;
};

export const getTenantGeoData = async (tenantId: number) => {
  const res = await api.get(`/tenantgeocurrentdata/${tenantId}`);
  const data = res.data;
  return data;
};

export const putFeatures = async (features: object) => {
  const res = await api.put(`/features`, features, {
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const getLandplotData = async (tenantId: number) => {
  const res = await api.get(`/landplotdata/${tenantId}`);
  const data = res.data;
  return data;
};

// Crops

export const postCrop = async (crop: object) => {
  const res = await api.post(`/crop`, crop, {
    headers: { "Content-type": "application/json" },
  });
  return res;
};

export const getCropById = async (id: number) => {
  const res = await api.get(`/cropdata/${id}`);
  const data = res.data;
  return data;
};

export const getTenantCrops = async (tenantId: number) => {
  const res = await api.get(`/tenantcropdata/${tenantId}`);
  const data = res.data;
  return data;
};

export const setDoneCropEvent = async (
  updateData: object,
  cropEventId: number
) => {
  const res = await api.put(`/donecropevent/${cropEventId}`, updateData, {
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const addCropEvent = async (eventData: object) => {
  const res = await api.post(`/cropevent`, eventData, {
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const setFinishedCropStage = async (
  updateData: object,
  cropStageId: number
) => {
  const res = await api.put(`/donecropstage/${cropStageId}`, updateData, {
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const setFinishedCrop = async (cropData: object, cropId: number) => {
  const res = await api.put(`/donecrop/${cropId}`, cropData, {
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const setCropStageComment = async (
  comment: object,
  cropStageId: number
) => {
  const res = await api.put(`/cropstagecomment/${cropStageId}`, comment, {
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const setCropComment = async (comment: object, cropId: number) => {
  const res = await api.put(`/cropcomment/${cropId}`, comment, {
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const getCropTasks = async (id: number) => {
  const res = await api.get(`/croptasks/${id}`);
  const data = res.data;
  return data;
};

export const getAllTenantTasks = async (tenantId: number) => {
  const res = await api.get(`/alltenanttasks/${tenantId}`);
  const data = res.data;
  return data;
};

export const getAllCalendarTenantTasks = async (tenantId: number) => {
  const res = await api.get(`/allcalendartenanttasks/${tenantId}`);
  const data = res.data;
  return data;
};

export const getOngoingCropsCalendarTenantTasks = async (tenantId: number) => {
  const res = await api.get(`/ongoingcalendartasks/${tenantId}`);
  const data = res.data;
  return data;
};

export const getFulfilledCropsCalendarTenantTasks = async (
  tenantId: number
) => {
  const res = await api.get(`/fulfilledcalendartasks/${tenantId}`);
  const data = res.data;
  return data;
};

// Snapshots

export const postLandplotSnapshot = async (snapshotData: object) => {
  const res = await api.post(`/snapshot`, snapshotData, {
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const getLandplotSnapshots = async (id: string) => {
  const res = await api.get(`/landplotsnapshots/${id}`);
  const data = res.data;
  return data;
};

export const getCropSnapshots = async (id: string) => {
  const res = await api.get(`/cropsnapshots/${id}`);
  const data = res.data;
  return data;
};

export const deleteSnapshot = async (snapshotId: number) => {
  const res = await api.delete(`/snapshot/${snapshotId}`);
  return res.status;
};

// Reports

export const getSpeciesReport = async (speciesReportData: object) => {
  const res = await api.put(`/speciesreport`, speciesReportData, {
    headers: { "Content-type": "application/json" },
  });
  return res;
};

export const getLandplotReport = async (landplotReportData: object) => {
  const res = await api.put(`/landplotreport`, landplotReportData, {
    headers: { "Content-type": "application/json" },
  });
  return res;
};

// Homepage Dashboard

export const getNextHarvest = async (tenantId: number) => {
  const res = await api.get(`/nextharvest/${tenantId}`);
  const data = res.data;
  return data;
};

export const getAvailableAndOccupiedTenantAreasSum = async (
  tenantId: number
) => {
  const res = await api.get(`/availabletenantareas/${tenantId}`);
  const data = res.data;
  return data;
};

export const getTenantSpeciesCropsAreasSum = async (tenantId: number) => {
  const res = await api.get(`/tenantspeciescropsareassum/${tenantId}`);
  const data = res.data;
  return data;
};

export const getTenantPendingTasksNumber = async (tenantId: number) => {
  const res = await api.get(`/pendingtasksnumber/${tenantId}`);
  const data = res.data;
  return data;
};

// External services

export const getWeather = async (coords: number[]) => {
  let lat = coords[0];
  let lon = coords[1];

  const weatherResponse = await axios.get(`
https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=auto&current=is_day,temperature_2m,wind_speed_10m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,precipitation_probability,precipitation,wind_speed_10m,weather_code
`);
  const weatherData = weatherResponse.data;

  const locationResponse = await axios.get(`
  https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es
  `);
  const locationData = await locationResponse.data;

  const { city, principalSubdivision, countryCode, countryName } = locationData;
  const formatedLocationName =
    city + ", " + principalSubdivision + ". " + countryName;

  weatherData.formated_location_name = formatedLocationName;
  return weatherData;
};
