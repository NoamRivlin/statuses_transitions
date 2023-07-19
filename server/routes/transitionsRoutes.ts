import express, { Router } from "express";
import {
  addTransition,
  getTransitions,
  deleteTransition,
} from "../controllers/transitionController";

const router: Router = express.Router();

router
  .route("/")
  .post(addTransition)
  .get(getTransitions)
  .delete(deleteTransition);

export default router;
