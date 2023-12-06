import { NextFunction, Request, Response } from "express";
import { QueryResult } from "pg";
import pool from "../database";

export const getSpecies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response: QueryResult = await pool.query("SELECT * FROM species");
    return res.status(200).json(response.rows);
  } catch (e) {
    next(e);
  }
};

export const getSpeciesByTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    const response: QueryResult = await pool.query(
      "SELECT id, name, description, tenant_id FROM species WHERE tenant_id = $1 AND deleted IS false",
      [id]
    );
    return res.status(200).json(response.rows);
  } catch (e) {
    next(e);
  }
};

async function speciesStagesAndEventsById(id: number) {
  const speciesQuery = `
      SELECT id, name, description, tenant_id, deleted
      FROM species
      WHERE id = $1
    `;

  const stagesQuery = `
      SELECT id, name, description, estimated_time, sequence_number
      FROM species_growth_stage
      WHERE species_id = $1
      ORDER BY sequence_number
    `;

  const speciesResponse: QueryResult = await pool.query(speciesQuery, [id]);
  const stagesResponse: QueryResult = await pool.query(stagesQuery, [id]);

  const species = {
    id: speciesResponse.rows[0].id,
    name: speciesResponse.rows[0].name,
    description: speciesResponse.rows[0].description,
    tenant_id: speciesResponse.rows[0].tenant_id,
    deleted: speciesResponse.rows[0].deleted,
  };

  const growth_stages = stagesResponse.rows.map((row: any) => {
    const estimatedTimeUnit = Object.keys(row.estimated_time)[0] || "days";
    const estimatedTime = row.estimated_time[estimatedTimeUnit] || 0;

    return {
      id: row.id,
      sequence_number: row.sequence_number,
      name: row.name,
      description: row.description,
      estimatedTime,
      estimatedTimeUnit,
      growthEvents: [],
    };
  });

  const stages = await Promise.all(
    growth_stages.map(async (stage: any) => {
      const eventsQuery = `
          SELECT id, name, description, ET_from_stage_start, time_period
          FROM species_growth_event
          WHERE reference_stage = $1
        `;

      const eventsResponse: QueryResult = await pool.query(eventsQuery, [
        stage.id,
      ]);

      const growthEvents = eventsResponse.rows.map((row: any) => {
        let ETFromStageStartUnit = "";
        let ETFromStageStart = "";

        let timePeriodUnit = "";
        let timePeriod = "";
        if (Object.keys(row.et_from_stage_start)[0]) {
          ETFromStageStartUnit = Object.keys(row.et_from_stage_start)[0];
          ETFromStageStart = row.et_from_stage_start[ETFromStageStartUnit];
        } else {
          ETFromStageStartUnit = "days";
          ETFromStageStart = "0";
        }

        if (row.time_period) {
          timePeriodUnit = Object.keys(row.time_period)[0];
          timePeriod = row.time_period[timePeriodUnit];
        }

        return {
          id: row.id,
          name: row.name,
          description: row.description,
          ETFromStageStart,
          ETFromStageStartUnit,
          timePeriod,
          timePeriodUnit,
        };
      });

      return {
        ...stage,
        growthEvents,
      };
    })
  );

  const result = {
    species,
    stages,
  };

  return result;
}

export const getSpeciesDataById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);

    const speciesData = await speciesStagesAndEventsById(id);

    return res.status(200).json(speciesData);
  } catch (e) {
    next(e);
  }
};

export const getDetailedSpeciesDataById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);

    const speciesData = await speciesStagesAndEventsById(id);

    const ongoingCrops: QueryResult = await pool.query(
      "SELECT COUNT(id) AS ongoing_crops FROM crop WHERE species_id = $1 AND finish_date IS NULL",
      [id]
    );
    const ongoingCropsNumber = ongoingCrops.rows[0].ongoing_crops;

    const finishedCrops: QueryResult = await pool.query(
      `SELECT 
        COUNT(id) AS finished_crops, 
        SUM(CASE 
          WHEN landplot_circle_radius IS NULL THEN ROUND(st_area(landplot_area, true)::numeric)
          ELSE ROUND((pi() * landplot_circle_radius * landplot_circle_radius)::numeric)
        END) AS areas_sum,
        SUM(weight_in_tons) AS weight_sum
      FROM crop 
      WHERE species_id = $1 AND finish_date IS NOT NULL`,
      [id]
    );
    const finishedCropRes = finishedCrops.rows[0];

    const finishedCropsAreaSum =
      finishedCropRes.areas_sum !== null ? finishedCropRes.areas_sum : 0;
    const finishedCropsWeightSum =
      finishedCropRes.weight_sum !== null ? finishedCropRes.weight_sum : 0;

    const speciesDetails = {
      ongoingCropsNumber,
      finishedCropsNumber: finishedCropRes.finished_crops,
      finishedCropsAreaSum,
      finishedCropsWeightSum,
    };

    const detailedSpeciesData = {
      ...speciesData,
      speciesDetails,
    };

    return res.status(200).json(detailedSpeciesData);
  } catch (e) {
    next(e);
  }
};

export const createSpecies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, tenant_id } = req.body;
    await pool.query(
      "INSERT INTO species (name, description, tenant_id) VALUES ($1, $2, $3)",
      [name, description, tenant_id]
    );
    return res.json({
      message: "Species created succesfully",
      body: {
        user: {
          name,
          description,
          tenant_id,
        },
      },
    });
  } catch (e) {
    next(e);
  }
};

export const createSpeciesWithStagesAndEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // Comienza la transacción
    const speciesData = req.body.species;
    const stagesData = req.body.stages || [];

    // Insertar nueva especie y obtener el ID
    const speciesInsertResponse: QueryResult = await client.query(
      `
      INSERT INTO species (name, description, tenant_id)
      VALUES ($1, $2, $3)
      RETURNING id
    `,
      [speciesData.name, speciesData.description, speciesData.tenant_id]
    );
    const speciesId = speciesInsertResponse.rows[0].id;

    for (const [index, stageData] of stagesData.entries()) {
      const { name, description, estimated_time, growthEvents } = stageData;

      const stageInsertResponse: QueryResult = await client.query(
        `
        INSERT INTO species_growth_stage (species_id, name, description, estimated_time, sequence_number)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
        `,
        [speciesId, name, description, estimated_time, index]
      );
      const stageId = stageInsertResponse.rows[0].id;

      for (const growthEvent of growthEvents) {
        const { name, description, et_from_stage_start, time_period } =
          growthEvent;

        await client.query(
          `
          INSERT INTO species_growth_event (species_id, name, description, reference_stage, et_from_stage_start, time_period)
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            speciesId,
            name,
            description,
            stageId,
            et_from_stage_start,
            time_period,
          ]
        );
      }
    }

    await client.query("COMMIT");

    return res.status(200).send("Species with stages and events added");
  } catch (e) {
    await client.query("ROLLBACK");
    next(e);
  } finally {
    client.release();
  }
};

export const updateSpecies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const species_id = parseInt(req.params.id);
    const { deletedEvents, deletedStages, speciesData } = req.body;
    const { species, stages } = speciesData;

    // Events and stages DELETE
    for (const eventId of deletedEvents) {
      await client.query("DELETE FROM species_growth_event WHERE id = $1", [
        eventId,
      ]);
    }

    for (const stageId of deletedStages) {
      await client.query(
        "DELETE FROM species_growth_event WHERE reference_stage = $1",
        [stageId]
      );
      await client.query("DELETE FROM species_growth_stage WHERE id = $1", [
        stageId,
      ]);
    }

    // Species main data update
    await client.query(
      "UPDATE species SET name = $1, description = $2 WHERE id = $3",
      [species.name, species.description, species_id]
    );

    // Stages INSERT and UPDATE
    for (const [index, stageData] of stages.entries()) {
      const { name, description, estimated_time, growthEvents } = stageData;

      let stage_db_id = stageData.id;

      if (stage_db_id) {
        await client.query(
          `
          UPDATE species_growth_stage SET name = $1, description = $2, estimated_time = $3, sequence_number = $4  WHERE id = $5
          `,
          [name, description, estimated_time, index, stage_db_id]
        );
      } else {
        const stageInsertResponse: QueryResult = await client.query(
          `
          INSERT INTO species_growth_stage (species_id, name, description, estimated_time, sequence_number)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
          `,
          [species_id, name, description, estimated_time, index]
        );
        stage_db_id = stageInsertResponse.rows[0].id;
      }

      // Events INSERT and UPDATE
      for (const growthEvent of growthEvents) {
        const { name, description, et_from_stage_start, time_period } =
          growthEvent;

        let event_db_id = growthEvent.id;

        if (event_db_id) {
          await client.query(
            `
              UPDATE species_growth_event SET name = $1, description = $2, reference_stage = $3, et_from_stage_start = $4, time_period = $5 WHERE id = $6
              `,
            [
              name,
              description,
              stage_db_id,
              et_from_stage_start,
              time_period,
              event_db_id,
            ]
          );
        } else {
          await client.query(
            `
            INSERT INTO species_growth_event (species_id, name, description, reference_stage, et_from_stage_start, time_period)
            VALUES ($1, $2, $3, $4, $5, $6)
            `,
            [
              species_id,
              name,
              description,
              stage_db_id,
              et_from_stage_start,
              time_period,
            ]
          );
        }
      }
    }

    await client.query("COMMIT");

    return res.status(200).json("Species ${id} updated succesfully");
  } catch (e) {
    console.log(e);
    await client.query("ROLLBACK");
    next(e);
  } finally {
    client.release();
  }
};

/* export const deleteSpecies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    await pool.query("DELETE FROM species WHERE id = $1", [id]);
    return res.json("Species ${id} deleted succesfully");
  } catch (e) {
    next(e);
  }
};
 */

export const disableSpecies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    await pool.query("UPDATE species SET deleted = true WHERE id = $1", [id]);
    return res.status(200).send(`Species ${id} disabled succesfully`);
  } catch (e) {
    next(e);
  }
};

export const enableSpecies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    await pool.query("UPDATE species SET deleted = false WHERE id = $1", [id]);
    return res.status(200).send(`Species ${id} enabled succesfully`);
  } catch (e) {
    next(e);
  }
};
