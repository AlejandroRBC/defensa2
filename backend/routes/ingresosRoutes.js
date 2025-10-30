import { Router } from "express";
import { ingresoController } from "../controllers/ingresosController.js";

const router = Router();

router.post("/", ingresoController.crear);
router.get("/activos", ingresoController.listarActivos);
router.get("/:idregistro", ingresoController.obtenerDetalle);

export default router;