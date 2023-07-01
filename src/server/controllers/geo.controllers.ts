import { NextFunction, Request, Response } from "express";
import { QueryResult } from "pg";
import pool from "../database";

// const GeoJSON = require("geojson");

const parsePostGISToGeoJSON = (response: QueryResult) => {
  const features = response.rows.map((row) => {
    let properties: any = {
      id: row.id,
      description: row.description,
    };

    if (row.crop_id) {
      const crop = response.rows.map((row) => ({
        id: row.crop_id,
        species_id: row.species_id,
        description: row.description,
        start_date: row.start_date,
        finish_date: row.finish_date,
      }));

      properties = {
        id: row.id,
        description: row.description,
        crop,
      };
    }

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

export const getAvailableTenantGeo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    const response: QueryResult = await pool.query(
      `SELECT id, ST_AsGeoJSON(area) as geometry, ST_AsGeoJSON(circle_center) as center, circle_radius, description 
        FROM landplot 
        WHERE tenant_id = $1 
        AND id NOT IN (
        SELECT landplot_id 
        FROM crop 
        WHERE finish_date IS NULL)`,
      [tenantId]
    );

    const geoJSON = parsePostGISToGeoJSON(response);

    return res.status(200).json(geoJSON);
  } catch (e) {
    next(e);
  }
};

export const getGeoWithCrops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    const response: QueryResult = await pool.query(
      `
      SELECT l.id AS landplot_id, ST_AsGeoJSON(l.area) as geometry, ST_AsGeoJSON(l.circle_center) as center, l.circle_radius, l.description, 
      c.id, c.species_id, c.description, c.start_date, c.finish_date
      FROM landplot l
      LEFT JOIN crop c ON l.id = c.landplot_id
      WHERE l.id = $1 
      `,
      [id]
    );

    const landplot = {
      id: response.rows[0].landplot_id,
      description: response.rows[0].description,
      geometry: response.rows[0].geometry,
      center: response.rows[0].center,
      circle_radius: response.rows[0].circle_radius,
    };

    let crops: any[] = [];

    if (response.rows[0].id) {
      crops = response.rows.map((row) => ({
        id: row.id,
        species_id: row.species_id,
        description: row.description,
        start_date: row.start_date,
        finish_date: row.finish_date,
      }));
    }

    const result = { landplot, crops };

    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

export const getTenantGeoWithCurrentCrops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    const response: QueryResult = await pool.query(
      `
      SELECT l.id AS id, ST_AsGeoJSON(l.area) as geometry, ST_AsGeoJSON(l.circle_center) as center, l.circle_radius, l.description, 
      c.id AS crop_id, c.species_id, c.description AS crop_description, c.start_date, c.finish_date
      FROM landplot l
      LEFT JOIN crop c ON l.id = c.landplot_id
      WHERE l.tenant_id = $1 AND (
        c.finish_date IS NULL OR
        c.finish_date = (
          SELECT CASE WHEN EXISTS (
            SELECT 1
            FROM crop
            WHERE landplot_id = l.id AND finish_date IS NULL
          ) THEN NULL ELSE MAX(finish_date) END
          FROM crop 
          WHERE landplot_id = l.id
        )
      )
      `,
      [tenantId]
    );

    const features = response.rows.map((row) => {
      let crop = null;

      if (row.crop_id) {
        crop = {
          id: row.crop_id,
          species_id: row.species_id,
          description: row.crop_description,
          start_date: row.start_date,
          finish_date: row.finish_date,
        };
      }

      const properties: any = {
        id: row.id,
        description: row.description,
        crop,
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
    const feature = req.body;
    const geometry = feature.geometry;
    const { tenantId, description, radius } = feature.properties;

    if (feature.geometry.type === "Polygon") {
      const response: QueryResult = await pool.query(
        "INSERT INTO landplot (tenant_id, area, description) VALUES ($1, $2, $3)",
        [tenantId, geometry, description]
      );
      res.status(201).send("Polygon added");
    } else if (
      feature.geometry.type === "Point" &&
      feature.properties.subType === "Circle"
    ) {
      const WKT_point = `'POINT(${geometry.coordinates[0]} ${geometry.coordinates[1]})'`;
      const buffer_radius = radius / 100000;
      const circular_polygon = `ST_Buffer(ST_GeomFromText(${WKT_point}), ${buffer_radius})`;

      const queryText = `INSERT INTO landplot(tenant_id, area, circle_center, circle_radius, description) VALUES ($1, ${circular_polygon}, ${WKT_point}, ${radius}, $2)`;
      const values = [tenantId, description];

      const response: QueryResult = await pool.query(queryText, values);
      res.status(201).send("Circle added");
    } else {
      res.status(400).send("Invalid feature type");
    }
  } catch (e) {
    next(e);
  }
};

export const createFeatures = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const features = req.body;

    features.forEach(async (feature: any) => {
      const geometry = feature.geometry;
      const { tenantId, description, radius } = feature.properties;

      if (feature.geometry.type === "Polygon") {
        const response: QueryResult = await pool.query(
          "INSERT INTO landplot (tenant_id, area, description) VALUES ($1, $2, $3)",
          [tenantId, geometry, description]
        );
      } else if (
        feature.geometry.type === "Point" &&
        feature.properties.subType === "Circle"
      ) {
        const WKT_point = `'POINT(${geometry.coordinates[0]} ${geometry.coordinates[1]})'`;
        const buffer_radius = radius / 100000;
        const circular_polygon = `ST_Buffer(ST_GeomFromText(${WKT_point}), ${buffer_radius})`;

        const queryText = `INSERT INTO landplot(tenant_id, area, circle_center, circle_radius, description) VALUES ($1, ${circular_polygon}, ${WKT_point}, ${radius}, $2)`;
        const values = [tenantId, description];

        const response: QueryResult = await pool.query(queryText, values);
      }
    });

    await client.query("COMMIT");
    return res.status(201).send("Features added");
  } catch (e) {
    await client.query("ROLLBACK");
    next(e);
  } finally {
    client.release();
  }
};
