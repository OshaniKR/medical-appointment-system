const Doctor = require("../models/Doctor");

// GET /api/doctors
exports.listDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find().sort({ name: 1 });
    res.json(doctors);
  } catch (err) {
    next(err);
  }
};
