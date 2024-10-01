import { Router } from "express";
import * as SessionController from "../controllers/SessionController";
import * as UserController from "../controllers/UserController";
import isAuth from "../middleware/isAuth";
const authRoutes = Router();



authRoutes.post("/login", SessionController.store);
authRoutes.post("/logout", SessionController.logout);

authRoutes.post("/refresh_token", SessionController.update);
authRoutes.post("/signup", isAuth, UserController.store);
export default authRoutes;
