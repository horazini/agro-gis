import { NextFunction, Request, Response } from "express";
import { QueryResult } from "pg";
import pool from "../database";
import { Feature, FeatureCollection } from "geojson";

/**
 *
 * @param {center?: any; geometry?: any; circle_radius?: number; [key: string]: any;} landplot
 * @param {[key: string]: any;} properties (optional)
 * @returns {Feature} GeoJSON Feature
 */
export function PostGISToGeoJSONFeature(
  landplot: {
    center?: any;
    geometry?: any;
    circle_radius?: number;
    [key: string]: any;
  },
  properties?: {
    [key: string]: any;
  }
): Feature {
  const { center, geometry, circle_radius, ...landplotRest } = landplot;
  if (properties === undefined) {
    properties = {};
  }
  properties.landplot = landplotRest;

  let geoJSONGeometry;
  if (center) {
    const [long, lat] = JSON.parse(center).coordinates;
    geoJSONGeometry = {
      type: "Point",
      coordinates: [lat, long],
    };
    properties.landplot.subType = "Circle";
    properties.landplot.radius = circle_radius;
  } else {
    geoJSONGeometry = JSON.parse(geometry);
  }

  const Feature: Feature = {
    type: "Feature",
    geometry: geoJSONGeometry,
    properties,
  };
  return Feature;
}

export function PostGISToGeoJSONFeatureCollection(
  rows: any
): FeatureCollection {
  const features = rows.map((row: any) => {
    const { landplot, properties } = row;
    return PostGISToGeoJSONFeature(landplot, properties);
  });

  const FeatureCollection: FeatureCollection = {
    type: "FeatureCollection",
    features: features,
  };

  return FeatureCollection;
}

export const getGeo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response: QueryResult = await pool.query(
      "SELECT id, ST_AsGeoJSON(area) as geometry, ST_AsGeoJSON(circle_center) as center, circle_radius, description FROM landplot"
    );

    const features = response.rows.map((row: any) => {
      const landplot = {
        id: row.id,
        geometry: row.geometry,
        center: row.center,
        circle_radius: row.circle_radius,
        description: row.description,
      };

      return { landplot };
    });

    const FeatureCollection = PostGISToGeoJSONFeatureCollection(features);

    return res.status(200).json(FeatureCollection);
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
      "SELECT id, ST_AsGeoJSON(area) as geometry, ROUND(st_area(area, true)::numeric) AS area, ST_AsGeoJSON(circle_center) as center, circle_radius, description FROM landplot WHERE tenant_id = $1",
      [tenantId]
    );

    const features = response.rows.map((row: any) => ({ landplot: row }));

    const FeatureCollection = PostGISToGeoJSONFeatureCollection(features);

    return res.status(200).json(FeatureCollection);
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

    return res.status(200).json("Unfinished function");
  } catch (e) {
    next(e);
  }
};

export const getAvailableAndOccupiedTenantGeo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    const response: QueryResult = await pool.query(
      `
      SELECT l.id AS id, ST_AsGeoJSON(l.area) as geometry, ST_AsGeoJSON(l.circle_center) as center, l.circle_radius, l.description, 
      c.id AS crop_id, c.finish_date 
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
      c.id AS crop_id, c.species_id, c.species_name, c.species_description, c.description AS crop_description, c.comments, c.start_date, c.finish_date, c.weight_in_tons
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

    const features = response.rows.map((row: any) => {
      const { id, description, geometry, center, circle_radius, ...cropData } =
        row;
      const landplot = {
        id,
        description,
        geometry,
        center,
        circle_radius,
      };

      let crop = null;

      if (row.crop_id) {
        const { crop_id, crop_description, ...rest } = cropData;

        crop = {
          id: crop_id,
          description: crop_description,
          ...rest,
        };
      }

      const properties = {
        crop,
      };

      return { landplot, properties };
    });

    const FeatureCollection = PostGISToGeoJSONFeatureCollection(features);

    return res.status(200).json(FeatureCollection);
  } catch (e) {
    next(e);
  }
};

const insertLandplot = async (feature: any) => {
  const geometry = feature.geometry;
  const { tenantId, description, radius } = feature.properties;

  if (feature.geometry.type === "Polygon") {
    await pool.query(
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

    await pool.query(queryText, values);
  } else {
    console.log("Invalid feature type");
  }
};

const newInsertLandplot = async (feature: any, tenantId: number) => {
  const geometry = feature.geometry;
  const { description, radius } = feature.properties;

  if (feature.geometry.type === "Polygon") {
    await pool.query(
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

    await pool.query(queryText, values);
  } else {
    console.log("Invalid feature type");
  }
};

const updateLandplot = async (feature: any) => {
  const geometry = feature.geometry;
  const { id, description, radius } = feature.properties;

  if (feature.geometry.type === "Polygon") {
    await pool.query(
      "UPDATE landplot SET area = $1, description = $2 WHERE id = $3",
      [geometry, description, id]
    );
  } else if (
    feature.geometry.type === "Point" &&
    feature.properties.subType === "Circle"
  ) {
    const WKT_point = `'POINT(${geometry.coordinates[0]} ${geometry.coordinates[1]})'`;
    const buffer_radius = radius / 100000;
    const circular_polygon = `ST_Buffer(ST_GeomFromText(${WKT_point}), ${buffer_radius})`;

    const queryText = `UPDATE landplot SET area = ${circular_polygon}, circle_center = ${WKT_point}, circle_radius  = ${radius}, description = $1 WHERE id = $2`;

    const values = [description, id];

    await pool.query(queryText, values);
  } else {
    console.log("Invalid feature type");
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
      insertLandplot(feature);
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

export const updateFeatures = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { tenantId, featurecollection } = req.body;
    console.log("tenantId: " + tenantId);

    featurecollection.forEach(async (feature: any) => {
      switch (feature.properties.status) {
        case "deleted": {
          await client.query("DELETE FROM landplot WHERE id = $1", [
            feature.properties.id,
          ]); // Modify to logical deletion
          break;
        }
        case "modified": {
          updateLandplot(feature);
          break;
        }
        case "added": {
          newInsertLandplot(feature, tenantId);
          break;
        }
        default: {
          console.log("Invalid feature status!");
          break;
        }
      }
    });

    await client.query("COMMIT");
    return res.status(201).send("Features updated");
  } catch (e) {
    await client.query("ROLLBACK");
    next(e);
  } finally {
    client.release();
  }
};
