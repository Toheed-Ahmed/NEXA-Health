import express from "express";
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, createPatient)
  .get(protect, getPatients);

router.route("/:id")
  .get(protect, getPatientById)
  .put(protect, updatePatient)
  .delete(protect, deletePatient);

export default router;
