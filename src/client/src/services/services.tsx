import { API } from "../config";

export const getTenantGeo = async (tenantId: number | null) => {
  const response = await fetch(`${API}/tenantGeo/${tenantId}`);
  const data = await response.json();
  return data;
};

export const getTenantGeoData = async (tenantId: number | null) => {
  const response = await fetch(`${API}/tenantgeocurrentdata/${tenantId}`);
  const data = await response.json();
  return data;
};

export const getTenantSpecies = async (tenantId: number | null) => {
  const response = await fetch(`${API}/tenantspecies/${tenantId}`);
  const data = await response.json();
  return data;
};

export const getSpeciesById = async (id: string) => {
  const res = await fetch(`${API}/species/${id}`);
  const data = (await res.json())[0];
  return data;
};

export const getSpeciesData = async (id: string) => {
  const res = await fetch(`${API}/speciesdata/${id}`);
  const data = await res.json();
  return data;
};

export const getTenants = async () => {
  const response = await fetch(`${API}/tenants`);
  const data = await response.json();
  return data;
};

export const getTenantData = async (id: string) => {
  const res = await fetch(`${API}/tenantdata/${id}`);
  const data = await res.json();
  return data;
};

export const getTenantUsertypes = async () => {
  const response = await fetch(`${API}/tenantusertypes`);
  const data = await response.json();
  return data;
};

export type tenantDataType = {
  tenant: {
    name: string;
  };
  users: {
    usertype_id: any;
    mail_address: any;
    username: any;
    names: any;
    surname: any;
    password_hash: string;
  }[];
};

export type speciesDataType = {
  species: {
    name: string;
    description: string;
    tenant_id: number;
  };
  stages: {
    db_id: number | null;
    sequence_number: number;
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

export const postTenantData = async (tenantData: tenantDataType) => {
  const res = await fetch(`${API}/tenantdata`, {
    method: "POST",
    body: JSON.stringify(tenantData),
    headers: { "Content-type": "application/json" },
  });
  const data = await res.json();
  return data;
};

export const postSpeciesData = async (speciesData: speciesDataType) => {
  const res = await fetch(`${API}/speciesdata`, {
    method: "POST",
    body: JSON.stringify(speciesData),
    headers: { "Content-type": "application/json" },
  });
  const data = await res.json();
  return data;
};

export const putSpeciesData = async (
  speciesData: speciesDataType,
  speciesId: string | undefined
) => {
  const res = await fetch(`${API}/species/${speciesId}`, {
    method: "PUT",
    body: JSON.stringify(speciesData),
    headers: { "Content-type": "application/json" },
  });
  const data = await res.json();
  return data;
};

export const postFeature = async (feature: any) => {
  const res = await fetch(`${API}/geo`, {
    method: "POST",
    body: JSON.stringify(feature),
    headers: { "Content-type": "application/json" },
  });
  const data = await res.json();
  return data;
};

export const postCrop = async (crop: any) => {
  const res = await fetch(`${API}/crop`, {
    method: "POST",
    body: JSON.stringify(crop),
    headers: { "Content-type": "application/json" },
  });
  const data = await res.json();
  return data;
};
