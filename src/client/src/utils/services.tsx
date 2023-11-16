import { API } from "../config";
import bcrypt from "bcryptjs";

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
  const response = await fetch(`${API}/tenants`);
  const data: tenantMainData[] = await response.json();
  return data;
};

export const tenantNameAlreadyExists = async (
  tenantName: string,
  currentTenantId?: number
) => {
  if (currentTenantId) {
    const res = await fetch(`${API}/renametenantnameexists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tenantName, currentTenantId }),
    });
    const bool = await res.json();
    return bool;
  } else {
    const res = await fetch(`${API}/tenantnameexists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tenantName }),
    });
    const bool = await res.json();
    return bool;
  }
};

export const getTenantUsers = async (id: number) => {
  const res = await fetch(`${API}/tenantusers/${id}`);
  const data = await res.json();
  return data;
};

export const getTenantData = async (id: string) => {
  const res = await fetch(`${API}/tenantdata/${id}`);
  const data = await res.json();
  return data;
};

export const postTenantData = async (tenantData: tenantDataType) => {
  const res = await fetch(`${API}/tenantdata`, {
    method: "POST",
    body: JSON.stringify(tenantData),
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const putTenantData = async (tenantPutData: tenantDetailedData) => {
  const res = await fetch(`${API}/tenantdata`, {
    method: "PUT",
    body: JSON.stringify(tenantPutData),
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const disableTenant = async (tenantId: number) => {
  const res = await fetch(`${API}/disabletenant/${tenantId}`, {
    method: "PUT",
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const enableTenant = async (tenantId: number) => {
  const res = await fetch(`${API}/enabletenant/${tenantId}`, {
    method: "PUT",
    headers: { "Content-type": "application/json" },
  });
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
    const res = await fetch(`${API}/renameusernameexists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, currentUsernameId }),
    });
    const bool = await res.json();
    return bool;
  } else {
    const res = await fetch(`${API}/usernameexists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });
    const bool = await res.json();
    return bool;
  }
};

export const verifyCredentials = async (username: string, password: string) => {
  const res = await fetch(`${API}/verifycredentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  const bool = await res.json();
  return bool;
};

export const resetUserPassword = async (
  userId: number,
  username: string,
  prevPassword: string,
  newPasswordHash: string
) => {
  const res = await fetch(`${API}/userpassword`, {
    method: "PUT",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ userId, username, prevPassword, newPasswordHash }),
  });
  return res.status;
};

export const getUserData = async (id: string) => {
  const res = await fetch(`${API}/userdata/${id}`);
  const data = await res.json();
  return data;
};

export const postUser = async (userData: userDataType) => {
  const res = await fetch(`${API}/user`, {
    method: "POST",
    body: JSON.stringify(userData),
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const putUser = async (userData: userDataType) => {
  const res = await fetch(`${API}/user`, {
    method: "PUT",
    body: JSON.stringify(userData),
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const disableUser = async (userId: number) => {
  const res = await fetch(`${API}/disableuser/${userId}`, {
    method: "PUT",
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const enableUser = async (userId: number) => {
  const res = await fetch(`${API}/enableuser/${userId}`, {
    method: "PUT",
    headers: { "Content-type": "application/json" },
  });
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
  const res = await fetch(`${API}/speciesdata/${id}`);
  const data = await res.json();
  return data;
};

export const getDetailedSpeciesData = async (id: string) => {
  const res = await fetch(`${API}/detailedspeciesdata/${id}`);
  const data = await res.json();
  return data;
};

export const getTenantSpecies = async (tenantId: number) => {
  const response = await fetch(`${API}/tenantspecies/${tenantId}`);
  const data = await response.json();
  return data;
};

export const postSpeciesData = async (speciesData: speciesDataType) => {
  const res = await fetch(`${API}/speciesdata`, {
    method: "POST",
    body: JSON.stringify(speciesData),
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const putSpeciesData = async (
  updateData: any,
  speciesId: string | undefined
) => {
  const res = await fetch(`${API}/species/${speciesId}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const disableSpecies = async (speciesId: number) => {
  const res = await fetch(`${API}/disablespecies/${speciesId}`, {
    method: "PUT",
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const enableSpecies = async (speciesId: number) => {
  const res = await fetch(`${API}/enablespecies/${speciesId}`, {
    method: "PUT",
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

// Landplots

export const getTenantGeo = async (tenantId: number) => {
  const response = await fetch(`${API}/tenantGeo/${tenantId}`);
  const data = await response.json();
  return data;
};

export const getAvailableAndOccupiedTenantGeo = async (tenantId: number) => {
  const response = await fetch(`${API}/availabletenantGeo/${tenantId}`);
  const data = await response.json();
  return data;
};

export const getTenantGeoData = async (tenantId: number) => {
  const response = await fetch(`${API}/tenantgeocurrentdata/${tenantId}`);
  const data = await response.json();
  return data;
};

export const putFeatures = async (features: any) => {
  const res = await fetch(`${API}/features`, {
    method: "PUT",
    body: JSON.stringify(features),
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const getLandplotData = async (tenantId: number) => {
  const response = await fetch(`${API}/landplotdata/${tenantId}`);
  const data = await response.json();
  return data;
};

// Crops

export const postCrop = async (crop: any) => {
  const res = await fetch(`${API}/crop`, {
    method: "POST",
    body: JSON.stringify(crop),
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const getCropById = async (id: string) => {
  const res = await fetch(`${API}/cropdata/${id}`);
  const data = await res.json();
  return data;
};

export const getTenantCrops = async (tenantId: number) => {
  const response = await fetch(`${API}/tenantcropdata/${tenantId}`);
  const data = await response.json();
  return data;
};

export const setDoneCropEvent = async (
  updateData: any,
  cropEventId: number
) => {
  const res = await fetch(`${API}/donecropevent/${cropEventId}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const setFinishedCropStage = async (
  updateData: any,
  cropStageId: number
) => {
  const res = await fetch(`${API}/donecropstage/${cropStageId}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const setFinishedCrop = async (cropData: any, cropId: number) => {
  const res = await fetch(`${API}/donecrop/${cropId}`, {
    method: "PUT",
    body: JSON.stringify(cropData),
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const setCropStageComment = async (
  comment: any,
  cropStageId: number
) => {
  const res = await fetch(`${API}/cropstagecomment/${cropStageId}`, {
    method: "PUT",
    body: JSON.stringify(comment),
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const setCropComment = async (comment: any, cropId: number) => {
  const res = await fetch(`${API}/cropcomment/${cropId}`, {
    method: "PUT",
    body: JSON.stringify(comment),
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const getCropTasks = async (id: number) => {
  const response = await fetch(`${API}/croptasks/${id}`);
  const data = await response.json();
  return data;
};

export const getAllTenantTasks = async (tenantId: number) => {
  const response = await fetch(`${API}/alltenanttasks/${tenantId}`);
  const data = await response.json();
  return data;
};

export const getAllCalendarTenantTasks = async (tenantId: number) => {
  const response = await fetch(`${API}/allcalendartenanttasks/${tenantId}`);
  const data = await response.json();
  return data;
};

export const getOngoingCropsCalendarTenantTasks = async (tenantId: number) => {
  const response = await fetch(`${API}/ongoingcalendartasks/${tenantId}`);
  const data = await response.json();
  return data;
};
export const getFulfilledCropsCalendarTenantTasks = async (
  tenantId: number
) => {
  const response = await fetch(`${API}/fulfilledcalendartasks/${tenantId}`);
  const data = await response.json();
  return data;
};

export const postLandplotSnapshot = async (snapshotData: any) => {
  const res = await fetch(`${API}/snapshot`, {
    method: "POST",
    body: JSON.stringify(snapshotData),
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const getLandplotSnapshots = async (id: string) => {
  const res = await fetch(`${API}/landplotsnapshots/${id}`);
  const data = await res.json();
  return data;
};

export const getCropSnapshots = async (id: string) => {
  const res = await fetch(`${API}/cropsnapshots/${id}`);
  const data = await res.json();
  return data;
};

export const deleteSnapshot = async (snapshotId: number) => {
  const res = await fetch(`${API}/snapshot/${snapshotId}`, {
    method: "DELETE",
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};

export const getNextHarvest = async (tenantId: number) => {
  const res = await fetch(`${API}/nextharvest/${tenantId}`);
  const data = await res.json();
  return data;
};

export const getAvailableAndOccupiedTenantAreasSum = async (
  tenantId: number
) => {
  const res = await fetch(`${API}/availabletenantareas/${tenantId}`);
  const data = await res.json();
  return data;
};

export const getTenantSpeciesCropsAreasSum = async (tenantId: number) => {
  const res = await fetch(`${API}/tenantspeciescropsareassum/${tenantId}`);
  const data = await res.json();
  return data;
};

export const getTenantPendingTasksNumber = async (tenantId: number) => {
  const res = await fetch(`${API}/pendingtasksnumber/${tenantId}`);
  const data = await res.json();
  return data;
};

export const getWeather = async (coords: number[]) => {
  let lat = coords[0];
  let lon = coords[1];

  const weatherResponse = await fetch(`
  https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=auto&current=is_day,temperature_2m,wind_speed_10m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,precipitation_probability,precipitation,wind_speed_10m,weather_code
`);
  const weatherData = await weatherResponse.json();

  const locationResponse = await fetch(`
  https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es
  `);
  const locationData = await locationResponse.json();

  const { city, principalSubdivision, countryCode, countryName } = locationData;
  const formatedLocationName =
    city + ", " + principalSubdivision + ". " + countryName;

  weatherData.formated_location_name = formatedLocationName;
  return weatherData;
};
