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

const is_circle = `circle_center IS NOT NULL AND circle_radius IS NOT NULL`;
const shape_data_query = `
CASE
  WHEN ${is_circle} THEN NULL
  ELSE ST_AsGeoJSON(area)
END as geometry,
CASE
  WHEN ${is_circle} THEN ST_AsGeoJSON(circle_center)
  ELSE NULL
END as center,
CASE
  WHEN ${is_circle} THEN circle_radius
  ELSE NULL
END as circle_radius`;
const is_circle_l = `l.circle_center IS NOT NULL AND l.circle_radius IS NOT NULL`;
const shape_data_query_l = `
CASE
  WHEN ${is_circle_l} THEN NULL
  ELSE ST_AsGeoJSON(l.area)
END as geometry,
CASE
  WHEN ${is_circle_l} THEN ST_AsGeoJSON(l.circle_center)
  ELSE NULL
END as center,
CASE
  WHEN ${is_circle_l} THEN l.circle_radius
  ELSE NULL
END as circle_radius`;

export const getGeo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response: QueryResult = await pool.query(
      `SELECT id, ${shape_data_query}, description FROM landplot;
    `
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
      `SELECT id, ${shape_data_query}, ROUND(st_area(area, true)::numeric) AS area, description FROM landplot WHERE tenant_id = $1`,
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
      SELECT l.id AS landplot_id, ${shape_data_query_l}, l.description, 
      CASE 
        WHEN l.circle_radius IS NULL THEN ROUND(st_area(l.area, true)::numeric)
        ELSE ROUND((pi() * l.circle_radius * l.circle_radius)::numeric)
      END AS area,
      c.id, c.species_id, c.species_name, c.description, c.comments, c.start_date, c.finish_date, c.weight_in_tons
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
      area: response.rows[0].area,
    };

    let crops: any[] = [];

    if (response.rows[0].id) {
      crops = response.rows.map((row) => ({
        id: row.id,
        species_id: row.species_id,
        species_name: row.species_name,
        description: row.description,
        comments: row.comments,
        start_date: row.start_date,
        finish_date: row.finish_date,
        weight_in_tons: row.weight_in_tons,
      }));
    }

    const properties = { crops };
    const Feature = PostGISToGeoJSONFeature(landplot, properties);

    return res.status(200).json(Feature);
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
      SELECT l.id AS id, ${shape_data_query_l}, l.description, 
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
        const { crop_id, finish_date } = cropData;

        crop = {
          id: crop_id,
          finish_date,
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

export const getTenantGeoWithCurrentCrops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    const response: QueryResult = await pool.query(
      `
      SELECT l.id AS id, ${shape_data_query_l}, l.description, 
      CASE 
        WHEN l.circle_radius IS NULL THEN ROUND(st_area(l.area, true)::numeric)
        ELSE ROUND((pi() * l.circle_radius * l.circle_radius)::numeric)
      END AS area,
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
      const {
        id,
        description,
        geometry,
        center,
        circle_radius,
        area,
        ...cropData
      } = row;
      const landplot = {
        id,
        description,
        geometry,
        center,
        area,
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

const insertLandplot = async (feature: any, tenantId: number) => {
  const { geometry, properties } = feature;
  const { landplot, ...rest } = properties;
  const { description, radius, subType } = landplot;

  if (geometry.type === "Polygon") {
    await pool.query(
      "INSERT INTO landplot (tenant_id, area, description) VALUES ($1, $2, $3)",
      [tenantId, geometry, description]
    );
  } else if (geometry.type === "Point" && subType === "Circle") {
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
  const { geometry, properties } = feature;
  const { landplot, ...rest } = properties;
  const { id, description, radius, subType } = landplot;

  if (geometry.type === "Polygon") {
    await pool.query(
      "UPDATE landplot SET area = $1, description = $2 WHERE id = $3",
      [geometry, description, id]
    );
  } else if (geometry.type === "Point" && subType === "Circle") {
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

export const updateFeatures = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { tenantId, FeatureCollection } = req.body;

    FeatureCollection.features.forEach(async (feature: any) => {
      switch (feature.properties.status) {
        case "deleted": {
          await client.query("DELETE FROM landplot WHERE id = $1", [
            feature.properties.landplot.id,
          ]); // Modify to logical deletion
          break;
        }
        case "modified": {
          updateLandplot(feature);
          break;
        }
        case "added": {
          insertLandplot(feature, tenantId);
          break;
        }
        default: {
          console.log("Invalid feature status!");
          break;
        }
      }
    });

    await client.query("COMMIT");
    return res.status(200).send("Features updated");
  } catch (e) {
    await client.query("ROLLBACK");
    next(e);
  } finally {
    client.release();
  }
};

export const createSnapshot = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { image, landplot_id, crop_id, crop_stage_id, date } = req.body;

    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const binaryData = Buffer.from(base64Data, "base64");

    const queryText = `
    INSERT INTO landplot_snapshot (image, landplot_id, crop_id, crop_stage_id, date) VALUES ($1, $2, $3, $4, $5)`;
    const values = [binaryData, landplot_id, crop_id, crop_stage_id, date];
    const response = await pool.query(queryText, values);

    return res.status(200).json(response);
  } catch (e) {
    next(e);
  }
};

export function PostgresByteaToBase64(image: any): string {
  const base64Image = image.toString("base64");
  const imageDataUri = `data:image/png;base64,${base64Image}`;
  return imageDataUri;
}

export const getLandplotSnapshots = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);

    const queryResponse: QueryResult = await pool.query(
      "SELECT image, id, crop_id, crop_stage_id, date FROM landplot_snapshot WHERE landplot_id = $1",
      [id]
    );

    const snapshots = queryResponse.rows.map((row: any) => {
      const { image, ...rest } = row;

      const imageDataUri = PostgresByteaToBase64(image);

      const response = {
        imageDataUri,
        ...rest,
      };
      return response;
    });

    return res.status(200).json(snapshots);
  } catch (e) {
    next(e);
  }
};

export const getCropSnapshots = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);

    const queryResponse: QueryResult = await pool.query(
      "SELECT image, id, crop_stage_id, date FROM landplot_snapshot WHERE crop_id = $1",
      [id]
    );

    const snapshots = queryResponse.rows.map((row: any) => {
      const { image, ...rest } = row;

      const imageDataUri = PostgresByteaToBase64(image);

      const response = {
        imageDataUri,
        ...rest,
      };
      return response;
    });

    return res.status(200).json(snapshots);
  } catch (e) {
    next(e);
  }
};

export const deleteSnapshot = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    await pool.query("DELETE FROM landplot_snapshot WHERE id = $1", [id]);
    return res.status(200).send(`Snaphsot ${id} deleted succesfully`);
  } catch (e) {
    next(e);
  }
};
