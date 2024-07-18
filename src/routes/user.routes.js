import { Router } from "express";
import {
  register,
  login,
  logout,
  verifyToken,
  profile,
  updateUser,
  test,
} from "../controllers/users.controller.js";
import { authRequired } from "../middlewares/validateToken.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.get("/profile", authRequired, profile);

router.get("/verify", verifyToken);

router.put("/users/:id", updateUser);

router.get("/ping", test);

router.get("/", (req,res) => {
  res.send("Hola Alfa");
})

export default router;
