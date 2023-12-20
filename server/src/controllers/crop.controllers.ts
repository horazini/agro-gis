import { NextFunction, Request, Response } from "express";
import { QueryResult } from "pg";
import pool from "../database";
import { PostGISToGeoJSONFeature } from "./landplot.controllers";
import { format } from "date-fns";
import convert from "color-convert";

const formatUniqueAndPeriodicEvents = (events: any) => {
  const formattedEvents: any = {};

  for (const event of events) {
    const {
      id,
      due_date,
      done_date,
      species_growth_event_id,
      species_growth_event_time_period,
      ...eventData
    } = event;
    const eventMainData = {
      id,
      due_date,
      done_date,
    };

    if (species_growth_event_time_period) {
      if (formattedEvents[species_growth_event_id]?.periodic_events) {
        formattedEvents[species_growth_event_id].periodic_events.push(
          eventMainData
        );
      } else {
        formattedEvents[species_growth_event_id] = {
          ...eventData,
          species_growth_event_id,
          species_growth_event_time_period,
          periodic_events: [eventMainData],
        };
      }
    } else if (species_growth_event_id) {
      formattedEvents[species_growth_event_id] = event;
    } else {
      formattedEvents[`addedEvent${event.id}`] = event;
    }
  }

  return Object.values(formattedEvents);
};

export const getCrops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response: QueryResult = await pool.query("SELECT * FROM crop");
    return res.status(200).json(response.rows);
  } catch (e) {
    next(e);
  }
};

/**
 * Gets the date from a date after a certain interval.
 * @param {Date} referenceDate
 * @param {Postgres interval return object} interval
 * @returns {Date}
 */
function sumIntervalToDate(referenceDate: string, interval: any): Date {
  let finalDate = new Date(referenceDate);

  const intervalUnit = Object.keys(interval)[0] || "days";
  const intervalCuantity: number = interval[intervalUnit] || 0;

  if (intervalUnit === "days") {
    finalDate.setDate(finalDate.getDate() + intervalCuantity);
  }
  if (intervalUnit === "months") {
    finalDate.setMonth(finalDate.getMonth() + intervalCuantity);
  }
  if (intervalUnit === "years") {
    finalDate.setFullYear(finalDate.getFullYear() + intervalCuantity);
  }

  return finalDate;
}

export const createCrop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { landplot, species, tenant_id, date } = req.body;

    // Landplot

    const landplotQuery: QueryResult = await client.query(
      "SELECT ST_AsGeoJSON(area) as landplot_area, ST_AsGeoJSON(circle_center) as landplot_circle_center, circle_radius as landplot_circle_radius, description as landplot_description FROM landplot WHERE id = $1",
      [landplot]
    );

    const landplotResponse = landplotQuery.rows[0];

    const {
      landplot_area,
      landplot_circle_center,
      landplot_circle_radius,
      landplot_description,
    } = landplotResponse;

    // Species

    const speciesQuery: QueryResult = await client.query(
      "SELECT name as species_name, description as species_description FROM species WHERE id = $1",
      [species]
    );

    const speciesResponse = speciesQuery.rows[0];

    const { species_name, species_description } = speciesResponse;

    // Stages

    const stagesResponse: QueryResult = await client.query(
      `
      SELECT id, name, description, estimated_time, sequence_number
      FROM species_growth_stage
      WHERE species_id = $1
      ORDER BY sequence_number
    `,
      [species]
    );

    const stages = await Promise.all(
      stagesResponse.rows.map(async (stage: any) => {
        const eventsResponse: QueryResult = await client.query(
          `
        SELECT id, name, description, ET_from_stage_start, time_period
        FROM species_growth_event
        WHERE reference_stage = $1
      `,
          [stage.id]
        );

        const growthEvents = eventsResponse.rows;

        return {
          ...stage,
          growthEvents,
        };
      })
    );

    // Crop insert

    const cropInsertResponse: QueryResult = await client.query(
      `INSERT INTO crop 
      (tenant_id,
        landplot_id, landplot_area, landplot_circle_center, landplot_circle_radius, landplot_description, 
        species_id, species_name, species_description, 
        start_date
        ) 
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id`,
      [
        tenant_id,
        landplot,
        landplot_area,
        landplot_circle_center,
        landplot_circle_radius,
        landplot_description,
        species,
        species_name,
        species_description,
        date,
      ]
    );

    const cropId = cropInsertResponse.rows[0].id;

    // Stages and events insert

    for (const stageData of stages) {
      const {
        id,
        name,
        description,
        estimated_time,
        sequence_number,
        growthEvents,
      } = stageData;

      let start_date = null;
      if (sequence_number === 0) {
        start_date = date;
      }

      const stageInsertResponse: QueryResult = await client.query(
        `
        INSERT INTO crop_stage (crop_id, 
          species_growth_stage_id, species_growth_stage_name, species_growth_stage_description, species_growth_stage_estimated_time, species_growth_stage_sequence_number, start_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
        `,
        [
          cropId,
          id,
          name,
          description,
          estimated_time,
          sequence_number,
          start_date,
        ]
      );

      const stageId = stageInsertResponse.rows[0].id;

      for (const growthEvent of growthEvents) {
        const { id, name, description, et_from_stage_start, time_period } =
          growthEvent;

        let due_date = null;
        if (sequence_number === 0) {
          due_date = sumIntervalToDate(date, et_from_stage_start);
        }

        await client.query(
          `
          INSERT INTO crop_event (crop_id, crop_stage_id, 
            species_growth_event_id, name, description, species_growth_event_ET_from_stage_start, species_growth_event_time_period, due_date)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
          [
            cropId,
            stageId,
            id,
            name,
            description,
            et_from_stage_start,
            time_period,
            due_date,
          ]
        );
      }
    }

    await client.query("COMMIT");
    return res.status(200).json({
      message: "Crop, with its stages and events, created successfully",
      cropId,
    });
  } catch (e) {
    await client.query("ROLLBACK");
    next(e);
  } finally {
    client.release();
  }
};

export const getCropDataById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);

    const cropQuery = `
      SELECT 
      id,
      landplot_id, 
      ST_AsGeoJSON(landplot_area) as landplot_geometry, 
      CASE 
        WHEN landplot_circle_radius IS NULL THEN ROUND(st_area(landplot_area, true)::numeric)
        ELSE ROUND((pi() * landplot_circle_radius * landplot_circle_radius)::numeric)
      END AS landplot_area,
      ST_AsGeoJSON(landplot_circle_center) as landplot_center,
      landplot_circle_radius, landplot_description,
      species_id, species_name, species_description,
      description, comments, start_date, finish_date, weight_in_tons 
      FROM crop WHERE id = $1
    `;
    const cropResponse = (await pool.query(cropQuery, [id])).rows[0];

    const landplot = {
      id: cropResponse.landplot_id,
      geometry: cropResponse.landplot_geometry,
      center: cropResponse.landplot_center,
      circle_radius: cropResponse.landplot_circle_radius,
      area: cropResponse.landplot_area,
      description: cropResponse.landplot_description,
    };

    const species = {
      id: cropResponse.species_id,
      name: cropResponse.species_name,
      description: cropResponse.species_description,
    };

    const crop = {
      id: cropResponse.id,
      description: cropResponse.description,
      comments: cropResponse.comments,
      start_date: cropResponse.start_date,
      finish_date: cropResponse.finish_date,
      weight_in_tons: cropResponse.weight_in_tons,
      estimatedCropFinishDate: cropResponse.start_date,
    };

    const stagesQuery = `
      SELECT id,
      species_growth_stage_name, species_growth_stage_description, species_growth_stage_estimated_time, species_growth_stage_sequence_number,
      comments, start_date, finish_date
      FROM crop_stage WHERE crop_id  = $1
      ORDER BY species_growth_stage_sequence_number 
    `;
    const stagesResponse: QueryResult = await pool.query(stagesQuery, [id]);

    const stages = await Promise.all(
      stagesResponse.rows.map(async (stage: any) => {
        const eventsQuery = `
          SELECT 
          id,
          species_growth_event_id, 
          name, description,
          species_growth_event_et_from_stage_start, species_growth_event_time_period,
          due_date, done_date
          FROM crop_event
          WHERE crop_stage_id = $1
        `;

        const eventsResponse: QueryResult = await pool.query(eventsQuery, [
          stage.id,
        ]);
        const rows = eventsResponse.rows;

        const events = formatUniqueAndPeriodicEvents(rows);

        return {
          ...stage,
          events,
        };
      })
    );

    let estimatedCropFinishDate = crop.start_date;
    stages.forEach((stage: any) => {
      if (stage.finish_date) {
        estimatedCropFinishDate = stage.finish_date;
      } else {
        estimatedCropFinishDate = sumIntervalToDate(
          estimatedCropFinishDate,
          stage.species_growth_stage_estimated_time
        );
      }
    });

    crop.estimatedCropFinishDate = estimatedCropFinishDate;

    const properties = {
      species,
      crop,
      stages,
    };

    const Feature = PostGISToGeoJSONFeature(landplot, properties);

    return res.status(200).json(Feature);
  } catch (e) {
    next(e);
  }
};

export const setDoneCropEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const event_id = parseInt(req.params.id);
    const { doneDate } = req.body;

    await client.query(
      `
      UPDATE crop_event SET done_date = $1 WHERE id = $2
      `,
      [doneDate, event_id]
    );

    const timePeriodQuery = await client.query(
      `
      SELECT species_growth_event_time_period FROM crop_event WHERE id = $1
      `,
      [event_id]
    );

    const species_growth_event_time_period =
      timePeriodQuery.rows[0].species_growth_event_time_period;

    if (species_growth_event_time_period) {
      const taskDone = await client.query(
        `
        SELECT * FROM crop_event WHERE id = $1
        `,
        [event_id]
      );

      const {
        crop_id,
        crop_stage_id,
        species_growth_event_id,
        name,
        description,
        species_growth_event_et_from_stage_start,
      } = taskDone.rows[0];

      const due_date = sumIntervalToDate(
        doneDate,
        species_growth_event_time_period
      );

      await client.query(
        `
        INSERT INTO crop_event (crop_id, crop_stage_id, 
          species_growth_event_id, name, description, species_growth_event_ET_from_stage_start, species_growth_event_time_period, due_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [
          crop_id,
          crop_stage_id,
          species_growth_event_id,
          name,
          description,
          species_growth_event_et_from_stage_start,
          species_growth_event_time_period,
          due_date,
        ]
      );
    }

    await client.query("COMMIT");

    return res.sendStatus(200);
  } catch (e) {
    console.log(e);
    await client.query("ROLLBACK");
    next(e);
  } finally {
    client.release();
  }
};

export const addCropEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cropId, stageId, name, description, estimatedDate, finishDate } =
      req.body;

    await pool.query(
      `
      INSERT INTO crop_event (crop_id, crop_stage_id, 
        name, description, due_date, done_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [cropId, stageId, name, description, estimatedDate, finishDate]
    );

    return res.sendStatus(200);
  } catch (e) {
    console.log(e);
    next(e);
  }
};

export const setCropStageComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stage_id = parseInt(req.params.id);
    const { comments } = req.body;

    await pool.query(
      `
      UPDATE crop_stage SET comments = $1 WHERE id = $2
    `,
      [comments, stage_id]
    );

    return res.sendStatus(200);
  } catch (e) {
    console.log(e);
    next(e);
  }
};

export const setFinishedCropStage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const stage_id = parseInt(req.params.id);
    const { doneDate } = req.body;

    await client.query(
      "DELETE FROM crop_event WHERE crop_stage_id = $1 AND done_date IS NULL",
      [stage_id]
    );

    const finishedStageResponse: QueryResult = await client.query(
      `
      UPDATE crop_stage SET finish_date = $1 WHERE id = $2
      RETURNING crop_id, species_growth_stage_sequence_number
    `,
      [doneDate, stage_id]
    );
    const finishedStageCropId = finishedStageResponse.rows[0].crop_id;
    const finishedStageSequenceNumber =
      finishedStageResponse.rows[0].species_growth_stage_sequence_number;

    const nextStageResponse: QueryResult = await client.query(
      `
        SELECT id FROM crop_stage WHERE crop_id = $1 AND species_growth_stage_sequence_number = $2
      `,
      [finishedStageCropId, finishedStageSequenceNumber + 1]
    );

    if (nextStageResponse.rows[0]) {
      const nextStageId = nextStageResponse.rows[0].id;

      // Set start date of next stage as equals to finish date of previous stage
      await client.query(
        `
        UPDATE crop_stage SET start_date = $1 WHERE id = $2 
      `,
        [doneDate, nextStageId]
      );

      // Set due_date to stage events

      const eventsResponse: QueryResult = await client.query(
        `
      SELECT id, species_growth_event_et_from_stage_start
      FROM crop_event
      WHERE crop_stage_id = $1
    `,
        [nextStageId]
      );

      const growthEvents = eventsResponse.rows;

      for (const growthEvent of growthEvents) {
        const { id, species_growth_event_et_from_stage_start } = growthEvent;

        const due_date = sumIntervalToDate(
          doneDate,
          species_growth_event_et_from_stage_start
        );

        await client.query(
          `
          UPDATE crop_event SET due_date = $1 WHERE id = $2
          `,
          [due_date, id]
        );
      }
    }

    await client.query("COMMIT");

    return res.sendStatus(200);
  } catch (e) {
    console.log(e);
    await client.query("ROLLBACK");
    next(e);
  } finally {
    client.release();
  }
};

export const setCropComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const crop_id = parseInt(req.params.id);
    const { comments } = req.body;

    await pool.query(
      `
      UPDATE crop SET comments = $1 WHERE id = $2
    `,
      [comments, crop_id]
    );

    return res.sendStatus(200);
  } catch (e) {
    console.log(e);
    next(e);
  }
};

export const setFinishedCrop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const crop_id = parseInt(req.params.id);
    const { date, weight_in_tons } = req.body;

    await client.query(
      `
      UPDATE crop SET finish_date = $1, weight_in_tons = $2 WHERE id = $3
      `,
      [date, weight_in_tons, crop_id]
    );

    await client.query("COMMIT");

    return res.sendStatus(200);
  } catch (e) {
    console.log(e);
    await client.query("ROLLBACK");
    next(e);
  } finally {
    client.release();
  }
};

export const getTenantCropData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    const response: QueryResult = await pool.query(
      `
      SELECT
      id, 
      landplot_id,
      CASE 
        WHEN landplot_circle_radius IS NULL THEN ROUND(st_area(landplot_area, true)::numeric)
        ELSE ROUND((pi() * landplot_circle_radius * landplot_circle_radius)::numeric)
      END AS landplot_area,
      landplot_description,
      species_id,
      species_name,
      description,
      comments,
      start_date, 
      finish_date,
      weight_in_tons,
      deleted  
      FROM crop
      WHERE tenant_id = $1
      `,
      [tenantId]
    );

    return res.status(200).json(response.rows);
  } catch (e) {
    next(e);
  }
};

async function cropTasksById(id: number) {
  const cropQuery = `
      SELECT id,
      landplot_id, landplot_description,
      species_name, 
      start_date, finish_date  
      FROM crop WHERE id = $1
    `;
  const cropResponse = (await pool.query(cropQuery, [id])).rows[0];

  const stagesQuery = `
    SELECT id, 
     species_growth_stage_name, species_growth_stage_description, 
     species_growth_stage_estimated_time, species_growth_stage_sequence_number, 
     start_date, finish_date, comments
     FROM crop_stage 
     WHERE crop_id = $1 AND start_date IS NOT NULL
     ORDER BY species_growth_stage_sequence_number;
   `;

  const stagesResponse: QueryResult = await pool.query(stagesQuery, [id]);

  const stages = await Promise.all(
    stagesResponse.rows.map(async (stage: any) => {
      const eventsQuery = `
         SELECT 
         id,
         species_growth_event_id, 
         name, description,
         species_growth_event_et_from_stage_start, species_growth_event_time_period,
         due_date, done_date
         FROM crop_event
         WHERE crop_stage_id = $1
       `;

      const eventsResponse: QueryResult = await pool.query(eventsQuery, [
        stage.id,
      ]);
      const rows = eventsResponse.rows;

      const events = formatUniqueAndPeriodicEvents(rows);

      return {
        ...stage,
        events,
      };
    })
  );

  const crop = {
    ...cropResponse,
    stages,
  };

  return crop;
}
/* 
async function pendingCropTasksById(id: number) {
  const cropQuery = `
      SELECT id,
      landplot_id, landplot_description,
      species_name, 
      start_date  
      FROM crop WHERE id = $1 AND finish_date IS NULL
    `;
  const cropResponse = (await pool.query(cropQuery, [id])).rows[0];

  const stagesQuery = `
  SELECT id
   FROM crop_stage 
   WHERE crop_id = $1 AND start_date IS NOT NULL AND finish_date IS NULL
 `;
  const stagesResponse: QueryResult = await pool.query(stagesQuery, [id]);

  const stage = stagesResponse.rows[0];
  if (stage !== undefined) {
    const eventsQuery = `
       SELECT 
       id,
       crop_id,
       crop_stage_id,
       name, description,
       due_date
       FROM crop_event
       WHERE crop_stage_id = $1 
       AND due_date <= CURRENT_DATE
       AND done_date IS NULL
     `;

    const eventsResponse: QueryResult = await pool.query(eventsQuery, [
      stage.id,
    ]);
    const events = eventsResponse.rows;
    //if (events[0] !== undefined) {
    if (events.length > 0) {
      const crop = {
        ...cropResponse,
        events,
      };
      return crop;
    }
  }
}
 */
export const getCropTasksById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);

    const cropTasks = await cropTasksById(id);

    return res.status(200).json(cropTasks);
  } catch (e) {
    next(e);
  }
};

export const getAllTenantTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = parseInt(req.params.tenantId);

    const cropsQuery = `
    SELECT id
    FROM crop 
    WHERE tenant_id = $1 AND deleted IS false
    ;
  `;

    const cropsResponse: QueryResult = await pool.query(cropsQuery, [tenantId]);

    const cropsTasks = await Promise.all(
      cropsResponse.rows.map(async (crop: any) => {
        const cropTasks = await cropTasksById(crop.id);

        return cropTasks;
      })
    );

    return res.status(200).json(cropsTasks);
  } catch (e) {
    next(e);
  }
};

function formattedDate(dateString: string) {
  if (dateString === null) {
    return "";
  }
  const dateObject = new Date(dateString);
  const formattedDate = format(dateObject, "yyyy-MM-dd");
  return formattedDate;
}

function calendarStructuredTasks(cropsTasks: any[]): any[] {
  const restructuredData: any[] = [];

  cropsTasks.forEach((crop: any, index: number) => {
    const formattedCropStartDate = formattedDate(crop.start_date);

    const hue = (index * 360) / cropsTasks.length;
    const cropColor = `#${convert.hsv.hex([hue, 85, 75])}`;

    crop.stages.forEach((stage: any, index: number) => {
      const stageName = stage.species_growth_stage_name;
      const formattedStageStartDate = formattedDate(stage.start_date);

      // Stage finish variables init

      let shouldShowStageFinishEvent = true;

      let estimatedStageFinishDate = sumIntervalToDate(
        stage.start_date,
        stage.species_growth_stage_estimated_time
      );

      let minStageFinishDate = new Date(stage.start_date);

      stage.events.forEach((event: any) => {
        const eventId = event.id;
        const eventName = event.name;

        if (event.periodic_events && event.periodic_events.length > 0) {
          event.periodic_events
            .sort((a: any, b: any) => a.id - b.id)
            .forEach((periodicEvent: any, index: number, array: any[]) => {
              //#region stage finish

              if (periodicEvent.done_date) {
                const eventDoneDate = new Date(periodicEvent.done_date);
                if (eventDoneDate > estimatedStageFinishDate) {
                  estimatedStageFinishDate = eventDoneDate;
                }
                if (eventDoneDate > minStageFinishDate) {
                  minStageFinishDate = eventDoneDate;
                }
              }

              //#endregion

              const periodicEventId = periodicEvent.id;

              const formattedDueDate = formattedDate(periodicEvent.due_date);
              const formattedDoneDate = formattedDate(periodicEvent.done_date);

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
          //#region stage finish

          if (!event.done_date) {
            shouldShowStageFinishEvent = false;
          } else {
            const eventDoneDate = new Date(event.done_date);
            if (eventDoneDate > estimatedStageFinishDate) {
              estimatedStageFinishDate = eventDoneDate;
            }
            if (eventDoneDate > minStageFinishDate) {
              minStageFinishDate = eventDoneDate;
            }
          }

          //#endregion

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
            min_date: formattedStageStartDate,
          };

          restructuredData.push(restructuredEvent);
        }
      });

      if (shouldShowStageFinishEvent) {
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
      }

      if (index === crop.stages.length - 1 && stage.finish_date) {
        let formattedStageDoneDate = formattedDate(stage.finish_date);

        let formattedCropDoneDate;

        let cropFinishEventName = `Finalizar cultivo: Parcela N°. ${crop.landplot_id} - ${crop.species_name}`;
        if (crop.finish_date) {
          formattedCropDoneDate = formattedDate(crop.finish_date);
          cropFinishEventName = `Fin del cultivo: Parcela N°. ${crop.landplot_id} - ${crop.species_name}`;
        }
        const cropFinishEvent = {
          id: crop.id,
          class: "crop_finish",
          name: cropFinishEventName,
          crop_id: crop.id,
          landplot: crop.landplot_id,
          species_name: crop.species_name,
          crop_start_date: formattedCropStartDate,
          stage_start_date: formattedStageStartDate,
          color: cropColor,
          stage_name: stageName,
          due_date: formattedStageDoneDate,
          done_date: formattedCropDoneDate,
          min_date: formattedStageDoneDate,
        };

        restructuredData.push(cropFinishEvent);
      }
    });
  });
  return restructuredData;
}

export const getAllCalendarTenantTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = parseInt(req.params.tenantId);

    const cropsQuery = `
    SELECT id
    FROM crop 
    WHERE tenant_id = $1 AND deleted IS false
    ;
  `;

    const cropsResponse: QueryResult = await pool.query(cropsQuery, [tenantId]);

    const cropsTasks = await Promise.all(
      cropsResponse.rows.map(async (crop: any) => {
        const cropTasks = await cropTasksById(crop.id);

        return cropTasks;
      })
    );

    const restructuredData = calendarStructuredTasks(cropsTasks);

    return res.status(200).json(restructuredData);
  } catch (e) {
    next(e);
  }
};

export const getFulfilledCropsCalendarTenantTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = parseInt(req.params.tenantId);

    const cropsQuery = `
    SELECT id
    FROM crop 
    WHERE tenant_id = $1 AND deleted IS false
    AND finish_date IS NOT NULL`;
    const cropsResponse: QueryResult = await pool.query(cropsQuery, [tenantId]);

    const cropsTasks = await Promise.all(
      cropsResponse.rows.map(async (crop: any) => {
        const cropTasks = await cropTasksById(crop.id);

        return cropTasks;
      })
    );

    const restructuredData = calendarStructuredTasks(cropsTasks);

    return res.status(200).json(restructuredData);
  } catch (e) {
    next(e);
  }
};

export const getOngoingCropsCalendarTenantTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = parseInt(req.params.tenantId);

    const cropsQuery = `
    SELECT id
    FROM crop 
    WHERE tenant_id = $1 AND deleted IS false
    AND finish_date IS NULL`;
    const cropsResponse: QueryResult = await pool.query(cropsQuery, [tenantId]);

    const cropsTasks = await Promise.all(
      cropsResponse.rows.map(async (crop: any) => {
        const cropTasks = await cropTasksById(crop.id);

        return cropTasks;
      })
    );

    const restructuredData = calendarStructuredTasks(cropsTasks);

    return res.status(200).json(restructuredData);
  } catch (e) {
    next(e);
  }
};
/* 
export const getTenantPendingTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = parseInt(req.params.tenantId);

    const cropsQuery = `
      SELECT id
      FROM crop 
      WHERE tenant_id = $1 AND deleted IS false
      AND finish_date IS NULL`;
    const cropsResponse: QueryResult = await pool.query(cropsQuery, [tenantId]);

    const cropsTasks = await Promise.all(
      cropsResponse.rows.map(async (crop: any) => {
        const cropTasks = await pendingCropTasksById(crop.id);
        return cropTasks;
      })
    );

    const filteredCropsTasks = cropsTasks.filter(
      (cropTasks) => cropTasks !== undefined
    );

    return res.status(200).json(filteredCropsTasks);
  } catch (e) {
    next(e);
  }
};
 */
export const getTenantPendingTasksNumber = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = parseInt(req.params.tenantId);

    const cropsQuery = `
      SELECT id
      FROM crop 
      WHERE tenant_id = $1 AND deleted IS false
      AND finish_date IS NULL`;
    const cropsResponse: QueryResult = await pool.query(cropsQuery, [tenantId]);

    const cropsPendingTasksNumbers = await Promise.all(
      cropsResponse.rows.map(async (crop: any) => {
        const stagesQuery = `
      SELECT id
       FROM crop_stage 
       WHERE crop_id = $1 AND start_date IS NOT NULL AND finish_date IS NULL
     `;
        const stagesResponse: QueryResult = await pool.query(stagesQuery, [
          crop.id,
        ]);

        const stage = stagesResponse.rows[0];
        if (stage !== undefined) {
          const tasksQuery: QueryResult = await pool.query(
            `SELECT 
          COUNT(id) AS pendingtasksnumber FROM crop_event
          WHERE crop_stage_id = $1 AND due_date <= CURRENT_DATE AND done_date IS NULL`,
            [stagesResponse.rows[0].id]
          );
          const cropPendingTasksNumber = tasksQuery.rows[0].pendingtasksnumber;
          return Number(cropPendingTasksNumber);
        } else {
          return 0;
        }
      })
    );

    let totalPendingTasks: number = cropsPendingTasksNumbers.reduce(
      (total, numero) => total + numero,
      0
    );

    return res.status(200).json(totalPendingTasks);
  } catch (e) {
    next(e);
  }
};

async function getCurrentCropsWithFinishDate(tenantId: number): Promise<any> {
  const cropsResponse: QueryResult = await pool.query(
    `
  SELECT
  id,
  landplot_id, 
  species_id, species_name, 
  description, comments, start_date
  FROM crop 
  WHERE tenant_id = $1 AND deleted IS false
  AND finish_date IS NULL`,
    [tenantId]
  );

  const finalObject = await Promise.all(
    cropsResponse.rows.map(async (crop: any) => {
      const stagesQuery = `
      SELECT id,
      species_growth_stage_estimated_time, species_growth_stage_sequence_number,
      start_date, finish_date
      FROM crop_stage WHERE crop_id = $1
      ORDER BY species_growth_stage_sequence_number `;

      const stagesResponse: QueryResult = await pool.query(stagesQuery, [
        crop.id,
      ]);

      const stages = stagesResponse.rows;

      let estimatedCropFinishDate = crop.start_date;
      stages.forEach((stage: any) => {
        if (stage.finish_date) {
          estimatedCropFinishDate = stage.finish_date;
        } else {
          estimatedCropFinishDate = sumIntervalToDate(
            estimatedCropFinishDate,
            stage.species_growth_stage_estimated_time
          );
        }
      });

      crop.estimatedCropFinishDate = estimatedCropFinishDate;

      return {
        ...crop,
        estimatedCropFinishDate,
      };
    })
  );

  return finalObject;
}

export const getNextHarvest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = parseInt(req.params.tenantId);

    const crops = await getCurrentCropsWithFinishDate(tenantId);

    let nextHatvestCrop = crops[0];

    // Utiliza el método reduce para encontrar la fecha más baja.
    nextHatvestCrop = crops.reduce((prevCrop: any, currentCrop: any) => {
      const fechaAnterior = new Date(prevCrop.estimatedCropFinishDate);
      const fechaActual = new Date(currentCrop.estimatedCropFinishDate);

      // Compara las fechas y actualiza el objeto si la fecha actual es más baja.
      if (fechaActual < fechaAnterior) {
        return currentCrop;
      } else {
        return prevCrop;
      }
    }, nextHatvestCrop);

    return res.status(200).json(nextHatvestCrop);
  } catch (e) {
    next(e);
  }
};
