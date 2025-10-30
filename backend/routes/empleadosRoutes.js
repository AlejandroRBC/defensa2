import express from "express";
import { empleadosController } from "../controllers/empleadosController.js";

const router = express.Router();

router.get("/", empleadosController.listar);
router.post("/", empleadosController.crear);
router.put("/:id", empleadosController.actualizar);
router.delete("/:id", empleadosController.eliminar);

export default router;
