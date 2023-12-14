import { NextFunction, Request, Response } from "express";
import { QueryResult } from "pg";
import pool from "../database";
import { PostGISToGeoJSONFeature } from "./landplot.controllers";

export const getSpeciesReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { speciesId, fromDate, toDate } = req.body;

    const speciesResponse: QueryResult = await pool.query(
      `
      SELECT id, name, description 
      FROM species
      WHERE id = $1
      `,
      [speciesId]
    );

    const species = speciesResponse.rows[0];

    const response: QueryResult = await pool.query(
      `
      SELECT
        landplot_id,
        COUNT(*) AS numberofcrops,
        CASE 
          WHEN landplot_circle_radius IS NULL THEN ROUND(st_area(landplot_area, true)::numeric)
          ELSE ROUND((pi() * landplot_circle_radius * landplot_circle_radius)::numeric)
          END AS landplot_area,
        SUM(weight_in_tons) AS totalweightintons,
        ST_AsGeoJSON(landplot_area) as landplot_geometry, 
        ST_AsGeoJSON(landplot_circle_center) as landplot_center,
        landplot_circle_radius
      FROM 
        crop
      WHERE 
        species_id = $1
        AND start_date >= $2 
        AND finish_date <= $3
        AND deleted IS false
      GROUP BY 
        landplot_id, landplot_circle_radius, landplot_area, landplot_circle_center
      `,
      [speciesId, fromDate, toDate]
    );

    const landplots: any[] = [];

    let totalNumberOfCrops = 0;
    let cultivatedAreas = 0;
    let weightInTons = 0;

    response.rows.forEach((row: any) => {
      const {
        landplot_geometry,
        landplot_center,
        landplot_circle_radius,
        ...landplotRest
      } = row;
      const { numberofcrops, landplot_area, totalweightintons } = landplotRest;

      totalNumberOfCrops += Number(numberofcrops);
      cultivatedAreas += parseFloat(landplot_area);
      weightInTons += Number(totalweightintons);

      const landplot = {
        geometry: landplot_geometry,
        center: landplot_center,
        circle_radius: landplot_circle_radius,
      };
      const Feature = PostGISToGeoJSONFeature(landplot, landplotRest);
      landplots.push({ Feature });
    });

    const totals = {
      numberOfCrops: totalNumberOfCrops,
      cultivatedAreas: Math.round(cultivatedAreas),
      weightInTons,
    };

    const JSONresponse = {
      species,
      landplots,
      totals,
    };

    return res.status(200).json(JSONresponse);
  } catch (e) {
    next(e);
  }
};

export const getLandplotReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { landplotId, fromDate, toDate } = req.body;

    const landplotQuery: QueryResult = await pool.query(
      `
        SELECT 
          id, 
          description, 
          CASE 
            WHEN circle_radius IS NULL THEN ROUND(st_area(area, true)::numeric)
            ELSE ROUND((pi() * circle_radius * circle_radius)::numeric)
            END AS area,
          ST_AsGeoJSON(area) as geometry, 
          ST_AsGeoJSON(circle_center) as center,
          circle_radius
        FROM landplot
        WHERE id = $1
        `,
      [landplotId]
    );

    const landplotResponse = landplotQuery.rows[0];

    const landplot = {
      geometry: landplotResponse.geometry,
      center: landplotResponse.center,
      circle_radius: landplotResponse.circle_radius,
    };

    const landplotProperties = {
      id: landplotResponse.id,
      description: landplotResponse.description,
      area: landplotResponse.area,
    };

    const Feature = PostGISToGeoJSONFeature(landplot, landplotProperties);

    const response: QueryResult = await pool.query(
      `
        SELECT
          COUNT(*) AS numberofcrops,
          species_id, 
          species_name,
          SUM(weight_in_tons) AS totalweightintons
        FROM 
          crop
        WHERE 
          landplot_id = $1
          AND start_date >= $2 
          AND finish_date <= $3
          AND deleted IS false
        GROUP BY 
          species_id, species_name
        `,
      [landplotId, fromDate, toDate]
    );

    const species: any[] = [];

    let totalNumberOfCrops = 0;
    let cultivatedAreas = 0;
    let weightInTons = 0;

    response.rows.forEach((row: any) => {
      const { species_id, species_name, numberofcrops, totalweightintons } =
        row;

      totalNumberOfCrops += Number(numberofcrops);
      cultivatedAreas += parseFloat(landplotProperties.area);
      weightInTons += Number(totalweightintons);

      species.push(row);
    });

    const totals = {
      numberOfCrops: totalNumberOfCrops,
      cultivatedAreas: Math.round(cultivatedAreas),
      weightInTons,
    };

    const JSONresponse = {
      Feature,
      species,
      totals,
    };

    return res.status(200).json(JSONresponse);
  } catch (e) {
    next(e);
  }
};
