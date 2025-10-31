import express from "express";
import { deportivosController } from "../controllers/deportivosController.js";

const router = express.Router();

// Rutas para reservas deportivas
router.get("/reservas", deportivosController.obtenerReservas);
router.post("/reservas", deportivosController.crearReserva);
router.get("/reservas/:cod_reserva", deportivosController.obtenerReservaPorCodigo);

// Rutas para espacios deportivos
router.get("/espacios", deportivosController.obtenerEspacios);
router.post("/espacios", deportivosController.crearEspacio);

// Ruta para datos del formulario
router.get("/datos-formulario", deportivosController.obtenerDatosFormulario);

// Rutas adicionales para canchas y disciplinas
router.get("/canchas/:cod_espacio", deportivosController.obtenerCanchasPorEspacio);
router.get("/disciplinas/:cod_cancha", deportivosController.obtenerDisciplinasPorCancha);

// Buscar espacio deportivo por código
router.fetch("/buscar/:cod_espacio", deportivosController.obtenerDatosEspacio);

export default router;