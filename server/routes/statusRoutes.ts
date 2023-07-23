import express, { Router } from "express";
import {
  addStatus,
  getStatuses,
  deleteStatus,
  reset,
  editInitStatus,
  test,
} from "../controllers/statusController";
const router: Router = express.Router();

router
  .route("/")
  .post(addStatus)
  .get(getStatuses)
  .delete(deleteStatus)
  .patch(editInitStatus);
router.route("/reset").delete(reset).get(test);

export default router;
