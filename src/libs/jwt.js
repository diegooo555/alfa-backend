import { verifyUserById } from "../controllers/users.controller.js";
import jwt from "jsonwebtoken";

export async function createAccesToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "1d" }, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
}

export const verifyToken = async (req, res) => {
  const { token } = req.cookies;

  if (!token)
    return res.status(401).json({ message: "Unauthorized not token" });

  jwt.verify(token, TOKEN_SECRET, async (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Invalid Token" });
    }
    const id = user.id;

    const userFound = await verifyUserById(id);

    if (!userFound) {
      return res.status(401).json({ message: "User not found" });
    }

    return res.json({
      id: userFound.id,
      email: userFound.email,
    });
  });
};
