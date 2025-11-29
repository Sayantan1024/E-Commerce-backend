import {Router} from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import { addInterestedProducts, getDashboardForClient, loginClient } from "../controllers/user.controllers.js";

const router = Router();

//routes for customer
//router.route("/interested-products").post(addInterestedProducts)

//protected routes for client
router.route("/login").post(loginClient)
//router.route("/dashboard").post(verifyJWT, getDashboardForClient)

export default router