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

    const Oneresponse: QueryResult = await pool.query(
      `
      SELECT
      landplot_id,
      CASE 
        WHEN landplot_circle_radius IS NULL THEN ROUND(st_area(landplot_area, true)::numeric)
        ELSE ROUND((pi() * landplot_circle_radius * landplot_circle_radius)::numeric)
      END AS landplot_area,
      weight_in_tons

      FROM crop
      WHERE species_id = $1
      AND start_date >= $2 
      AND finish_date <= $3

      AND deleted IS false  
      `,
      [speciesId, fromDate, toDate]
    );

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

    FROM crop
    WHERE species_id = $1
    AND start_date >= $2 
    AND finish_date <= $3
    AND deleted IS false
    GROUP BY landplot_id, landplot_circle_radius, landplot_area, landplot_circle_center
  
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

    const JSONresponse = {
      landplots,
      totals: {
        numberOfCrops: totalNumberOfCrops,
        cultivatedAreas: Math.round(cultivatedAreas),
        weightInTons,
      },
    };

    return res.status(200).json(JSONresponse);
  } catch (e) {
    next(e);
  }
};
