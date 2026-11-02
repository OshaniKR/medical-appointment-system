const express = require("express");
const ctrl = require("../controllers/appointmentController");

const router = express.Router();

router.get("/", ctrl.listAppointments);
router.post("/", ctrl.createAppointment);

// Must be declared before "/:id" so "availability" is not treated as an id
router.get("/availability", ctrl.getAvailability);

router.get("/:id", ctrl.getAppointment);
router.put("/:id", ctrl.updateAppointment);
router.patch("/:id/status", ctrl.updateStatus);
router.delete("/:id", ctrl.deleteAppointment);

module.exports = router;
