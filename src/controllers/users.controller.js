import { pool } from "../app.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createAccesToken } from "../libs/jwt.js";

export const verifyUserById = async (id) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE id= $1", [id]);
  if (rows.length === 0) {
    undefined;
  }

  return rows[0];
};

export const verifyUserByEmail = async (email) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE email= $1", [email]);
  if (rows.length === 0) {
    return undefined;
  }

  return rows[0];
};

export const verifyUserByName = async (name) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE name= $1", [name]);
  if (rows.length === 0) {
    return undefined;
  }

  return rows[0];
};

export const getUsers = async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM users");
  console.log(rows);
  res.json(rows);
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  if (rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(rows[0]);
};


export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING *",
    [id]
  );

  if (rowCount === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.sendStatus(204);
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const passwordHash = await bcrypt.hash(data.password, 10);

  const { rows } = await pool.query(
    "UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING *",
    [data.name, data.email, passwordHash, id]
  );

  return res.json(rows[0]);
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {

    if(!verifyUserByName(name)) return res.status(400).json(["El nombre no esta disponible"]);

    if (!verifyUserByEmail(email)) return res.status(400).json(["El email ingresado esta en uso"]);

    const passwordHash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      "INSERT INTO users (name,email,password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, passwordHash]
    );

    const newUser = rows[0];

    const token = await createAccesToken({ id: newUser.id });

    res.cookie("token", token);
    res.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
    });
  } catch (error) {
    if (error?.code === "23505") {
      return res.status(409).json({ message: "Email already exists" });
    }
    console.log(error)
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userFound = await verifyUserByEmail(email);

    if (!userFound) return res.status(400).json(["Email invalido"]);

    const isMatch = await bcrypt.compare(password, userFound.password);

    if (!isMatch) return res.status(400).json(["Contraseña Incorrecta"]);

    const token = await createAccesToken({ id: userFound.id });

    console.log(userFound);

    res.cookie("token", token);
    res.json({
      id: userFound.id,
      name: userFound.name,
      email: userFound.email,
      created_at: userFound.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  res.cookie('token', "", {
    expires: new Date(0),
  });

  return res.sendStatus(200);
}

//Profile have a middleware and this pass the argument req.user in req parameter
export const profile = async (req, res) => {
  const userFound = await verifyUserById(req.user.id);

  if (!userFound) return res.status(400).json({ message: "Usrenotfound" });

  return res.json({
    id: userFound.id,
    username: userFound.name,
    email: userFound.email,
    createdAt: userFound.createdAt,
  });
};

export const verifyToken = async (req, res) => {
  const { token } = req.cookies;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.TOKEN_SECRET, async (err, user) => {
    if (err) return res.status(401).json({ message: "Invalid Token" });

    const userFound = await verifyUserById(user.id);

    if (!userFound) return res.status(401).json({ message: "User not found" });

    return res.json({
      id: userFound.id,
      email: userFound.email,
    });
  });
};

export const createUsersTable = async () => {
  const queryCreateTable= `CREATE TABLE
    users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;
    try {
      await pool.query(queryCreateTable);
      console.log("Table create succesfull")
    } catch (error) {
      console.log(error);
    }
}











export const test = async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  return res.json(result.rows[0]);
};