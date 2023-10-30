import { API } from "../config";
import { format, parseISO } from "date-fns";
import convert from "color-convert";
import bcrypt from "bcryptjs";
import { sumIntervalToDate } from "./functions";

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
  tenant: {
    name: string;
  };
  users: userDataType[];
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

export const setFinishedCrop = async (cropData: any, cropId: number) => {
  console.log(cropData);
  console.log(cropId);
  const res = await fetch(`${API}/donecrop/${cropId}`, {
    method: "PUT",
    body: JSON.stringify(cropData),
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
    const formattedCropStartDate = formattedDate(crop.start_date);

    const hue = (index * 360) / inputCrops.length;
    const cropColor = `#${convert.hsv.hex([hue, 85, 75])}`;

    crop.stages.forEach((stage: any) => {
      const stageName = stage.species_growth_stage_name;
      const formattedStageStartDate = formattedDate(stage.start_date);

      let estimatedStageFinishDate = sumIntervalToDate(
        stage.start_date,
        stage.species_growth_stage_estimated_time
      );

      let minStageFinishDate = new Date(stage.start_date);

      stage.events.forEach((event: any) => {
        const eventId = event.id;
        const eventName = event.name;

        // Assigns the stage start as the minimum done date

        if (event.periodic_events && event.periodic_events.length > 0) {
          event.periodic_events
            .sort((a: any, b: any) => a.id - b.id)
            .forEach((periodicEvent: any, index: number, array: any[]) => {
              const periodicEventId = periodicEvent.id;

              const formattedDueDate = formattedDate(periodicEvent.due_date);
              const formattedDoneDate = formattedDate(periodicEvent.done_date);

              const eventDoneDate = new Date(periodicEvent.done_date);
              if (eventDoneDate > estimatedStageFinishDate) {
                estimatedStageFinishDate = eventDoneDate;
              }
              if (eventDoneDate > minStageFinishDate) {
                minStageFinishDate = eventDoneDate;
              }

              let min_date = formattedStageStartDate;

              if (index === array.length - 1 && array.length > 1) {
                // If an array of periodic tasks exist,
                // assigns the done date of the previous item as the min done date of the last one
                min_date = formattedDate(array[index - 1].done_date);
              } else {
              }

              const restructuredEvent = {
                id: periodicEventId,
                name: eventName,
                crop_id: crop.id,
                landplot: crop.landplot_id,
                species_name: crop.species_name,
                crop_start_date: formattedCropStartDate,
                stage_start_date: formattedStageStartDate,
                color: cropColor,
                stage_name: stageName,
                due_date: formattedDueDate,
                done_date: formattedDoneDate,
                min_date,
              };

              restructuredData.push(restructuredEvent);
            });
        } else {
          const formattedDueDate = formattedDate(event.due_date);
          const formattedDoneDate = formattedDate(event.done_date);

          const eventDoneDate = new Date(event.done_date);
          if (eventDoneDate > estimatedStageFinishDate) {
            estimatedStageFinishDate = eventDoneDate;
          }
          if (eventDoneDate > minStageFinishDate) {
            minStageFinishDate = eventDoneDate;
          }

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
            min_date: formattedStageStartDate,
          };

          restructuredData.push(restructuredEvent);
        }
      });

      const formattedStageDueDate = formattedDate(
        estimatedStageFinishDate.toISOString()
      );

      let formattedStageDoneDate;

      let stageFinishEventName = `Finalizar etapa "${stageName}"`;
      if (stage.finish_date) {
        formattedStageDoneDate = formattedDate(stage.finish_date);
        stageFinishEventName = `Fin de etapa "${stageName}"`;
      }

      const formattedStageMinDueDate = formattedDate(
        minStageFinishDate.toISOString()
      );

      const stageFinishEvent = {
        id: stage.id,
        class: "stage_finish",
        name: stageFinishEventName,
        crop_id: crop.id,
        landplot: crop.landplot_id,
        species_name: crop.species_name,
        crop_start_date: formattedCropStartDate,
        stage_start_date: formattedStageStartDate,
        color: cropColor,
        stage_name: stageName,
        due_date: formattedStageDueDate,
        done_date: formattedStageDoneDate,
        min_date: formattedStageMinDueDate,
      };

      restructuredData.push(stageFinishEvent);
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

export const postLandplotSnapshot = async (snapshotData: any) => {
  const res = await fetch(`${API}/snapshot`, {
    method: "POST",
    body: JSON.stringify(snapshotData),
    headers: { "Content-type": "application/json" },
  });
  return res.status;
};
