import { NextFunction, Request, Response } from "express";
import { QueryResult } from "pg";
import pool from "../database";
import { PostGISToGeoJSONFeature } from "./geo.controllers";

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
    return res
      .status(200)
      .send("Crop, with its stages and events, created successfully");
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
      description: cropResponse.description,
      comments: cropResponse.comments,
      start_date: cropResponse.start_date,
      finish_date: cropResponse.finish_date,
      weight_in_tons: cropResponse.weight_in_tons,
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

        const formattedEvents: any = {};
        const individualEvents: any = [];

        for (const row of rows) {
          const {
            id,
            due_date,
            done_date,
            species_growth_event_id,
            species_growth_event_time_period,
            ...eventData
          } = row;
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
          } else {
            formattedEvents[species_growth_event_id] = row;
          }
        }

        const events = Object.values(formattedEvents).concat(individualEvents);

        return {
          ...stage,
          events,
        };
      })
    );

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
    } else {
      await client.query(
        `
        UPDATE crop SET finish_date = $1 WHERE id = $2
      `,
        [doneDate, finishedStageCropId]
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
