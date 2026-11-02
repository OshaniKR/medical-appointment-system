const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// Clinic hours: 09:00 - 16:30, 30 minute slots
const SLOTS = [];
for (let h = 9; h < 17; h++) {
  SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

const httpError = (status, message) => Object.assign(new Error(message), { status });

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function isInPast(date, time) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm) < new Date();
}

async function assertValidBooking({ doctor, date, time }, excludeId) {
  if (!mongoose.isValidObjectId(doctor)) throw httpError(400, "Invalid doctor");
  if (!(await Doctor.exists({ _id: doctor }))) throw httpError(400, "Selected doctor does not exist");
  if (!SLOTS.includes(time)) {
    throw httpError(400, "Time must be a 30-minute slot between 09:00 and 16:30");
  }
  if (isInPast(date, time)) throw httpError(400, "Appointment cannot be in the past");

  const clash = await Appointment.findOne({
    doctor,
    date,
    time,
    status: "scheduled",
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });
  if (clash) {
    throw httpError(409, "This doctor already has a scheduled appointment at that date and time.");
  }
}

// GET /api/appointments?date=&status=&doctor=&q=
exports.listAppointments = async (req, res, next) => {
  try {
    const { date, status, doctor, q } = req.query;
    const filter = {};
    if (date) filter.date = date;
    if (status) filter.status = status;
    if (doctor) {
      if (!mongoose.isValidObjectId(doctor)) throw httpError(400, "Invalid doctor");
      filter.doctor = doctor;
    }
    if (q) {
      const rx = new RegExp(escapeRegex(q.trim()), "i");
      filter.$or = [{ patientName: rx }, { patientEmail: rx }];
    }
    const appointments = await Appointment.find(filter)
      .populate("doctor", "name specialization")
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

// GET /api/appointments/availability?doctor=&date=
exports.getAvailability = async (req, res, next) => {
  try {
    const { doctor, date, excludeId } = req.query;
    if (!doctor || !date) throw httpError(400, "doctor and date are required");
    if (!mongoose.isValidObjectId(doctor)) throw httpError(400, "Invalid doctor");

    const booked = await Appointment.find({
      doctor,
      date,
      status: "scheduled",
      ...(excludeId && mongoose.isValidObjectId(excludeId) ? { _id: { $ne: excludeId } } : {}),
    }).select("time");
    const taken = new Set(booked.map((a) => a.time));

    res.json(
      SLOTS.map((time) => ({
        time,
        available: !taken.has(time) && !isInPast(date, time),
      }))
    );
  } catch (err) {
    next(err);
  }
};

// GET /api/appointments/:id
exports.getAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id).populate("doctor", "name specialization");
    if (!appt) throw httpError(404, "Appointment not found");
    res.json(appt);
  } catch (err) {
    next(err);
  }
};

// POST /api/appointments
exports.createAppointment = async (req, res, next) => {
  try {
    const { patientName, patientEmail, patientPhone, doctor, date, time, reason, notes } = req.body;

    // Run schema validation first so field-level messages come back cleanly
    const appt = new Appointment({
      patientName, patientEmail, patientPhone, doctor, date, time, reason, notes,
      status: "scheduled",
    });
    await appt.validate();
    await assertValidBooking({ doctor, date, time });

    await appt.save();
    await appt.populate("doctor", "name specialization");
    res.status(201).json(appt);
  } catch (err) {
    next(err);
  }
};

// PUT /api/appointments/:id
exports.updateAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) throw httpError(404, "Appointment not found");

    const fields = ["patientName", "patientEmail", "patientPhone", "doctor", "date", "time", "reason", "status", "notes"];
    const before = { doctor: String(appt.doctor), date: appt.date, time: appt.time, status: appt.status };
    fields.forEach((f) => {
      if (req.body[f] !== undefined) appt[f] = req.body[f];
    });
    await appt.validate();

    const slotChanged =
      String(appt.doctor) !== before.doctor || appt.date !== before.date || appt.time !== before.time;
    const reactivated = appt.status === "scheduled" && before.status !== "scheduled";

    // Only re-check booking rules when the slot moves or a cancelled booking is re-scheduled,
    // so cancelling/completing an old appointment is never blocked by the "past" rule.
    if (appt.status === "scheduled" && (slotChanged || reactivated)) {
      await assertValidBooking(
        { doctor: String(appt.doctor), date: appt.date, time: appt.time },
        appt._id
      );
    }

    await appt.save();
    await appt.populate("doctor", "name specialization");
    res.json(appt);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/appointments/:id/status   body: { status }
exports.updateStatus = async (req, res, next) => {
  try {
    req.body = { status: req.body.status };
    return exports.updateAppointment(req, res, next);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/appointments/:id
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findByIdAndDelete(req.params.id);
    if (!appt) throw httpError(404, "Appointment not found");
    res.json({ message: "Appointment deleted", id: appt._id });
  } catch (err) {
    next(err);
  }
};
