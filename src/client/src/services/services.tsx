import { API } from "../config";
import { format, parseISO } from "date-fns";
import convert from "color-convert";

// Tenants

export type tenantMainData = {
  id: number;
  name: string;
  deleted: boolean;
};

export type tenantDataType = {
  tenant: {
    name: string;
  };
  users: {
    usertype_id: number;
    mail_address: string;
    username: string;
    names: string;
    surname: string;
    password_hash: string;
  }[];
};

export const getTenants = async () => {
  const response = await fetch(`${API}/tenants`);
  const data: tenantMainData[] = await response.json();
  return data;
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

export const getTenantUsertypes = async () => {
  const response = await fetch(`${API}/tenantusertypes`);
  const data: userType[] = await response.json();
  return data;
};

export const usernameAlreadyExists = async (username: string) => {
  const res = await fetch(`${API}/usernameexists`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });
  const bool = await res.json();
  return bool;
};

export const getUserData = async (id: string) => {
  const res = await fetch(`${API}/userdata/${id}`);
  const data = await res.json();
  return data;
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

export const getGeoData = async (tenantId: number) => {
  const response = await fetch(`${API}/geodata/${tenantId}`);
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

function restructureTasks(inputCrops: any): any[] {
  function formattedDate(dateString: string) {
    if (dateString === null) {
      return "";
    }
    const dateObject = parseISO(dateString);
    const formattedDate = format(dateObject, "yyyy-MM-dd");
    return formattedDate;
  }

  const restructuredData: any[] = [];
  inputCrops.forEach((crop: any, index: number) => {
    const hue = (index * 360) / inputCrops.length;
    const cropColor = `#${convert.hsv.hex([hue, 85, 75])}`;

    crop.stages.forEach((stage: any) => {
      const stageId = stage.id;
      const stageName = stage.species_growth_stage_name;

      stage.events.forEach((event: any) => {
        const eventId = event.id;
        const eventName = event.name;

        const formattedCropStartDate = formattedDate(crop.start_date);

        if (event.periodic_events && event.periodic_events.length > 0) {
          event.periodic_events.forEach((periodicEvent: any) => {
            const periodicEventId = periodicEvent.id;

            const formattedDueDate = formattedDate(periodicEvent.due_date);
            const formattedDoneDate = formattedDate(periodicEvent.done_date);

            const restructuredEvent = {
              id: periodicEventId,
              name: eventName,
              crop_id: crop.id,
              landplot: crop.landplot_id,
              species_name: crop.species_name,
              crop_start_date: formattedCropStartDate,
              color: cropColor,
              stage_name: stageName,
              due_date: formattedDueDate,
              done_date: formattedDoneDate,
            };

            restructuredData.push(restructuredEvent);
          });
        } else {
          const formattedDueDate = formattedDate(event.due_date);
          const formattedDoneDate = formattedDate(event.done_date);

          const restructuredEvent = {
            id: eventId,
            name: eventName,
            crop_id: crop.id,
            landplot: crop.landplot_id,
            species_name: crop.species_name,
            crop_start_date: formattedCropStartDate,
            color: cropColor,
            stage_name: stageName,
            due_date: formattedDueDate,
            done_date: formattedDoneDate,
          };

          restructuredData.push(restructuredEvent);
        }
      });
    });
  });

  return restructuredData;
}

export const getAllTenantTasksStructuredForCalendar = async (
  tenantId: number
) => {
  const data = await getAllTenantTasks(tenantId);
  const tasks = restructureTasks(data);
  return tasks;
};
