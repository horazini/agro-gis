import { NextFunction, Request, Response } from "express";
import { QueryResult } from "pg";
import pool from "../database";

// const GeoJSON = require("geojson");

const parsePostGISToGeoJSON = (response: QueryResult) => {
  const features = response.rows.map((row) => {
    const properties: any = {
      id: row.id,
      description: row.description,
    };

    let geometry;
    if (row.center) {
      const [longitud, latitud] = JSON.parse(row.center).coordinates;
      geometry = {
        type: "Point",
        coordinates: [latitud, longitud],
      };
      properties["subType"] = "Circle";
      properties["radius"] = row.circle_radius;
    } else {
      geometry = JSON.parse(row.geometry);
    }

    return {
      type: "Feature",
      geometry,
      properties,
    };
  });

  const geoJSON = {
    type: "FeatureCollection",
    features: features,
  };

  return geoJSON;
};

export const getGeo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response: QueryResult = await pool.query(
      "SELECT id, ST_AsGeoJSON(area) as geometry, ST_AsGeoJSON(circle_center) as center, circle_radius, description FROM landplot"
    );

    const geoJSON = parsePostGISToGeoJSON(response);

    return res.status(200).json(geoJSON);
  } catch (e) {
    next(e);
  }
};

export const getTenantGeo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    const response: QueryResult = await pool.query(
      "SELECT id, ST_AsGeoJSON(area) as geometry, ST_AsGeoJSON(circle_center) as center, circle_radius, description FROM landplot WHERE tenant_id = $1",
      [tenantId]
    );

    const geoJSON = parsePostGISToGeoJSON(response);

    return res.status(200).json(geoJSON);
  } catch (e) {
    next(e);
  }
};

export const createGeo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const geom = req.body.geometry;
    const { tenantId, description, radius } = req.body.properties;

    if (req.body.geometry.type === "Polygon") {
      const response: QueryResult = await pool.query(
        "INSERT INTO landplot (tenant_id, area, description) VALUES ($1, $2, $3)",
        [tenantId, geom, description]
      );
      res.status(201).send("Polygon added");
    } else if (
      req.body.geometry.type === "Point" &&
      req.body.properties.subType === "Circle"
    ) {
      const WKT_point = `'POINT(${geom.coordinates[0]} ${geom.coordinates[1]})'`;
      const buffer_radius = radius / 100000;
      const circular_polygon = `ST_Buffer(ST_GeomFromText(${WKT_point}), ${buffer_radius})`;

      const queryText = `INSERT INTO landplot(tenant_id, area, circle_center, circle_radius, description) VALUES ($1, ${circular_polygon}, ${WKT_point}, ${radius}, $2)`;
      const values = [1, description];

      const response: QueryResult = await pool.query(queryText, values);
      res.status(201).send("Circle added");
    } else {
      res.status(400).send("Invalid feature type");
    }
  } catch (e) {
    next(e);
  }
};
