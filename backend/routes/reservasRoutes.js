import { Router } from "express";
import { reservasController } from "../controllers/reservasController.js";

const router = Router();

router.get("/confirmadas", reservasController.obtenerReservasConfirmadas);
router.get("/", reservasController.obtenerReservas);
router.get("/:id", reservasController.obtenerReservaPorId);
router.post("/", reservasController.crearReserva);
router.put("/:id", reservasController.actualizarReserva);
router.delete("/:id", reservasController.eliminarReserva);

export default router;