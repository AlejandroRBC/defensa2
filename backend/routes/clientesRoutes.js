import express from "express";
import { clientesController } from "../controllers/clientesController.js";

const router = express.Router();

router.get("/", clientesController.listar);
router.post("/", clientesController.crear);
router.put("/:id", clientesController.actualizar);
router.delete("/:id", clientesController.eliminar);

export default router;
