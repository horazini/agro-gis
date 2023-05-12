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
      "SELECT id, name FROM tenant"
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

export const getTenantUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    const response: QueryResult = await pool.query(
      "SELECT id, usertype_id, mail_address, username, names, surname FROM user_account WHERE tenant_id = $1",
      [id]
    );
    return res.status(200).json(response.rows);
  } catch (e) {
    next(e);
  }
};

/* export const getTenantWithUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    const response: QueryResult = await pool.query(
      `
      SELECT t.id AS tenant_id, t.name AS tenant_name, u.id AS user_id, u.usertype_id, u.mail_address, u.username, u.names, u.surname
      FROM tenant t
      JOIN user_account u ON t.id = u.tenant_id
      WHERE t.id = $1
      `,
      [id]
    );

    const tenant = {
      id: response.rows[0].tenant_id,
      name: response.rows[0].tenant_name,
    };

    const users = response.rows.map((row) => ({
      id: row.user_id,
      usertype_id: row.usertype_id,
      mail_address: row.mail_address,
      username: row.username,
      names: row.names,
      surname: row.surname,
    }));

    const result = { tenant, users };

    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}; */

export const getTenantWithUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    const response: QueryResult = await pool.query(
      `
      SELECT t.id AS tenant_id, t.name AS tenant_name, u.id AS user_id, u.usertype_id, u.mail_address, u.username, u.names, u.surname
      FROM tenant t
      LEFT JOIN user_account u ON t.id = u.tenant_id
      WHERE t.id = $1
      `,
      [id]
    );

    const tenant = {
      id: response.rows[0].tenant_id,
      name: response.rows[0].tenant_name,
    };

    let users: any[] = [];

    if (response.rows.length > 1) {
      users = response.rows.map((row) => ({
        id: row.user_id,
        usertype_id: row.usertype_id,
        mail_address: row.mail_address,
        username: row.username,
        names: row.names,
        surname: row.surname,
      }));
    }

    const result = { tenant, users };

    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

export const createTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;
    const response: QueryResult = await pool.query(
      "INSERT INTO tenant (name) VALUES ($1) RETURNING id", // Agregar "RETURNING id" a la consulta SQL
      [name]
    );
    const id: number = response.rows[0].id; // Obtener el id del nuevo tenant creado
    return res.status(201).json({
      message: "New tenant added",
      body: {
        tenant: {
          id,
          name,
        },
      },
    });
  } catch (e) {
    next(e);
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

export const deleteTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    await pool.query("DELETE FROM tenant WHERE id = $1", [id]);
    return res.status(204).send("Tenant ${id} deleted succesfully");
  } catch (e) {
    next(e);
  }
};
