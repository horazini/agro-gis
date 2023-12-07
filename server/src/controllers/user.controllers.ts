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
    await pool.query(
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

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, usertype_id, mail_address, username, names, surname } =
      req.body;
    await pool.query(
      "UPDATE user_account SET usertype_id = $1, mail_address = $2, username = $3, names = $4, surname = $5 WHERE id = $6",
      [usertype_id, mail_address, username, names, surname, id]
    );

    return res.status(201).send("User added");
  } catch (e) {
    next(e);
  }
};

// Métodos de autenticación

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

export const renameUsernameAlreadyExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, currentUsernameId } = req.body;
    const query: QueryResult = await pool.query(
      "SELECT id FROM user_account WHERE username = $1",
      [username]
    );
    let response = false;
    query.rows.forEach((userId: any) => {
      if (userId.id !== currentUsernameId) {
        response = true;
      }
    });
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

  const query = `  
    SELECT
      tenant_id, usertype_id, user_account.id, username, names, surname,
      ut.name AS usertype_name,
      t.name AS tenant_name
    FROM
      user_account 
        JOIN usertype ut ON user_account.usertype_id = ut.id
        JOIN tenant t ON user_account.tenant_id = t.id
    WHERE
      user_account.username = $1;
    `;
  const result = await pool.query(query, [username]);
  console.log(result.rows[0]);
  const {
    tenant_id: tenantId,
    tenant_name: tenantName,
    usertype_id: userTypeId,
    usertype_name: usertypeName,
    id: userId,
    names: names,
    surname: surname,
  } = result.rows[0];

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });

  res.json({
    token,
    tenantId,
    tenantName,
    userTypeId,
    usertypeName,
    userId,
    username,
    names,
    surname,
  });
};

export const verifyCredentials = async (
  req: { body: { username: any; password: any } },
  res: any
) => {
  const { username, password } = req.body;
  const isValidCredentials = await verifyUserCredentials(username, password);
  return res.status(200).json(isValidCredentials);
};

export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, username, prevPassword, newPasswordHash } = req.body;
    const isValidCredentials = await verifyUserCredentials(
      username,
      prevPassword
    );
    if (isValidCredentials) {
      await pool.query(
        "UPDATE user_account SET password_hash = $1 WHERE id = $2 AND username = $3",
        [newPasswordHash, userId, username]
      );
      return res
        .status(200)
        .send(`User ${userId}'s password updated succesfully`);
    } else {
      return res.status(400).send(`Something went wrong.`);
    }
  } catch (e) {
    next(e);
  }
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

export const getUserData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    const queryResponse: QueryResult = await pool.query(
      `
      SELECT 
      id, usertype_id, mail_address, username, names, surname, deleted
      FROM user_account 
      WHERE id = $1
      `,
      [id]
    );

    const result = queryResponse.rows[0];

    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

export const disableUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    await pool.query("UPDATE user_account SET deleted = true WHERE id = $1", [
      id,
    ]);
    return res.status(200).send(`User ${id} disabled succesfully`);
  } catch (e) {
    next(e);
  }
};

export const enableUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    await pool.query("UPDATE user_account SET deleted = false WHERE id = $1", [
      id,
    ]);
    return res.status(200).send(`User ${id} enabled succesfully`);
  } catch (e) {
    next(e);
  }
};
