import { NextFunction, Request, Response } from "express";
import { QueryResult } from "pg";
import pool from "../database";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

// Métodos de operaciones CRUD de usuarios

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response: QueryResult = await pool.query(
      "SELECT id, tenant_id, usertype_id, mail_address, username, names, surname FROM user_account"
    );
    return res.status(200).json(response.rows);
  } catch (e) {
    next(e);
  }
};

export const getUsersByTenant = async (
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

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      tenant_id,
      usertype_id,
      mail_address,
      username,
      names,
      surname,
      password_hash,
    } = req.body;
    const response: QueryResult = await pool.query(
      "INSERT INTO user_account (tenant_id, usertype_id, mail_address, username, names, surname, password_hash) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        tenant_id,
        usertype_id,
        mail_address,
        username,
        names,
        surname,
        password_hash,
      ]
    );
    return res.status(201).send("User added");
  } catch (e) {
    next(e);
  }
};

// Métodos de autenticación

export async function getUserData(
  username: string
): Promise<{ tenant_id: number; usertype_id: number; id: number }> {
  const query =
    "SELECT id, tenant_id, usertype_id FROM user_account WHERE username = $1";
  const result = await pool.query(query, [username]);
  if (result.rows.length === 0) {
    throw new Error("User not found");
  }
  const userData = result.rows[0];
  return {
    tenant_id: userData.tenant_id,
    usertype_id: userData.usertype_id,
    id: userData.id,
  };
}

export async function verifyUserCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const query = "SELECT password_hash FROM user_account WHERE username = $1";
  const result = await pool.query(query, [username]);
  if (result.rows.length === 0) {
    return false; // usuario no encontrado
  }
  const passwordHash = result.rows[0].password_hash;
  return bcrypt.compare(password, passwordHash);
}

export async function verifyUserEnabled(username: string): Promise<string> {
  const query = `
  SELECT u.deleted AS user_deleted, t.deleted AS tenant_deleted
  FROM user_account AS u
  JOIN tenant AS t ON u.tenant_id = t.id
  WHERE u.username = $1
`;

  const result = await pool.query(query, [username]);

  if (result.rows.length > 0) {
    const userDeleted = result.rows[0].user_deleted;
    const tenantDeleted = result.rows[0].tenant_deleted;

    if (tenantDeleted) {
      return "Disabled tenant";
    }
    if (userDeleted) {
      return "Disabled user";
    }
  } else {
    return "Username not found";
  }

  return "OK";
}

export const usernameAlreadyExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const username: string = req.body.username;
    const query: QueryResult = await pool.query(
      "SELECT COUNT(*) AS user_exists FROM user_account WHERE username = $1",
      [username]
    );
    const response = query.rows[0].user_exists > 0;
    return res.status(200).json(response);
  } catch (e) {
    next(e);
  }
};

export const login = async (
  req: { body: { username: any; password: any } },
  res: any
) => {
  const { username, password } = req.body;
  const isUserEnabled = await verifyUserEnabled(username);
  if (isUserEnabled !== "OK") {
    return res.status(401).json({ error: isUserEnabled });
  }
  const isValidCredentials = await verifyUserCredentials(username, password);
  if (!isValidCredentials) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const query =
    "SELECT tenant_id, usertype_id, id, username, names, surname FROM user_account WHERE username = $1";
  const result = await pool.query(query, [username]);
  const {
    tenant_id: tenantId,
    usertype_id: userTypeId,
    id: userId,
    names: names,
    surname: surname,
  } = result.rows[0];

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });

  res.json({ token, tenantId, userTypeId, userId, username, names, surname });
};

// Obtener tipos de usuario

export const getUserTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response: QueryResult = await pool.query(
      "SELECT id, name FROM usertype"
    );
    return res.status(200).json(response.rows);
  } catch (e) {
    next(e);
  }
};

// Obtener tipos de usuario sin el sysadmin

export const getTenantUserTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response: QueryResult = await pool.query(
      "SELECT id, name FROM usertype"
    );

    const filteredRows = response.rows.filter((row) => row.id > 1);

    return res.status(200).json(filteredRows);
  } catch (e) {
    next(e);
  }
};
