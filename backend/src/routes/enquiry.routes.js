import {Router} from "express";
import { enquiryFromCustomer } from "../controllers/enquiry.controllers.js";

const router = Router();

router.route("/enquiry").post(enquiryFromCustomer)

export default router