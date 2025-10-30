import express from "express";
import { danosController } from "../controllers/danosController.js";

const router = express.Router();

router.get("/", danosController.listar);
router.post("/", danosController.crear);
router.get("/registros", danosController.obtenerRegistrosIngreso);
router.get("/empleados", danosController.obtenerEmpleados);

export default router;