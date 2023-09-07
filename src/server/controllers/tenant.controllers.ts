import { NextFunction, Request, Response } from "express";
import { QueryResult } from "pg";
import pool from "../database";

// test controller

export const getTime = async (req: Request, res: Response) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows[0].now);
};

// real tenant controllers

export const getTenants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response: QueryResult = await pool.query(
      "SELECT id, name, deleted FROM tenant"
    );
    return res.status(200).json(response.rows);
  } catch (e) {
    next(e);
  }
};

export const getTenantById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    const response: QueryResult = await pool.query(
      "SELECT * FROM tenant WHERE id = $1",
      [id]
    );
    return res.json(response.rows);
  } catch (e) {
    next(e);
  }
};

export const disableTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    await pool.query("UPDATE tenant SET deleted = true WHERE id = $1", [id]);
    return res.status(200).send("Tenant ${id} disabled succesfully");
  } catch (e) {
    next(e);
  }
};

export const enableTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    await pool.query("UPDATE tenant SET deleted = false WHERE id = $1", [id]);
    return res.status(200).send("Tenant ${id} enabled succesfully");
  } catch (e) {
    next(e);
  }
};

export const getTenantUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    const tenantQuery: QueryResult = await pool.query(
      `
      SELECT 
      name FROM tenant WHERE id = $1
      `,
      [id]
    );

    const tenantName = tenantQuery.rows[0].name;

    const usersQuery: QueryResult = await pool.query(
      `
      SELECT 
      id, usertype_id, mail_address, username, names, surname, deleted
      FROM user_account 
      WHERE tenant_id = $1
      `,
      [id]
    );

    let users: any[] = [];

    if (usersQuery.rows[0]) {
      users = usersQuery.rows;
    }

    const result = { tenantName, users };

    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

export const getTenantData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    const tenantQuery: QueryResult = await pool.query(
      `
      SELECT 
      id, name, deleted FROM tenant WHERE id = $1
      `,
      [id]
    );

    const tenant = tenantQuery.rows[0];

    const usersQuery: QueryResult = await pool.query(
      `
      SELECT 
      id, usertype_id, mail_address, username, names, surname, deleted
      FROM user_account 
      WHERE tenant_id = $1
      `,
      [id]
    );

    let users: any[] = [];

    if (usersQuery.rows[0]) {
      users = usersQuery.rows;
    }

    const landQuery: QueryResult = await pool.query(
      `SELECT 
        COUNT(id) AS landplots_number,
        SUM(CASE 
          WHEN circle_radius IS NULL THEN ROUND(st_area(area, true)::numeric)
          ELSE ROUND((pi() * circle_radius * circle_radius)::numeric)
        END) AS areas_sum
        FROM landplot WHERE tenant_id = $1;
    `,
      [id]
    );

    const land = landQuery.rows[0];

    const speciesQuery: QueryResult = await pool.query(
      `SELECT 
        COUNT(id) AS species_number
        FROM species WHERE tenant_id = $1;
    `,
      [id]
    );

    const species = speciesQuery.rows[0];

    const result = { tenant, users, land, species };

    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

export const createTenantWithUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // Comienza la transacción

    const tenantData = req.body.tenant;
    const usersData = req.body.users || [];

    // Insertar nuevo tenant y obtener el ID
    const tenantInsertQuery = `
      INSERT INTO tenant (name)
      VALUES ($1)
      RETURNING id
    `;
    const tenantInsertValues = [tenantData.name];
    const tenantInsertResponse: QueryResult = await client.query(
      tenantInsertQuery,
      tenantInsertValues
    );
    const tenantId = tenantInsertResponse.rows[0].id;

    // Insertar usuarios utilizando el ID del tenant
    for (const userData of usersData) {
      const {
        usertype_id,
        mail_address,
        username,
        names,
        surname,
        password_hash,
      } = userData;

      await client.query(
        `
        INSERT INTO user_account (tenant_id, usertype_id, mail_address, username, names, surname, password_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          tenantId,
          usertype_id,
          mail_address,
          username,
          names,
          surname,
          password_hash,
        ]
      );
    }

    await client.query("COMMIT"); // Confirma la transacción

    return res.status(201).send("Tenant with users added");
  } catch (e) {
    await client.query("ROLLBACK"); // Deshace la transacción en caso de error
    next(e);
  } finally {
    client.release(); // Libera el cliente de la conexión de la pool
  }
};

export const updateTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    const { name } = req.body;
    const response: QueryResult = await pool.query(
      "UPDATE tenant SET name = $1 WHERE id = $2",
      [name, id]
    );
    return res.status(204).send("Tenant ${id} updated succesfully");
  } catch (e) {
    next(e);
  }
};
