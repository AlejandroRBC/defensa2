
import express from "express";
import { hotelesController } from "../controllers/hotelesController.js";

const router = express.Router();

router.get("/", hotelesController.listar);
router.post("/", hotelesController.crear);
router.put("/:id", hotelesController.actualizar);
router.delete("/:id", hotelesController.eliminar);

export default router;