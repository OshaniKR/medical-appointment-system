const mongoose = require("mongoose");

const STATUSES = ["scheduled", "completed", "cancelled"];

// Date and time are stored as plain strings ("YYYY-MM-DD" and "HH:mm") on purpose.
// This avoids timezone shifts that happen when JS Date objects are serialised to JSON.
const appointmentSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      minlength: [2, "Patient name must be at least 2 characters"],
      maxlength: [80, "Patient name must be at most 80 characters"],
    },
    patientEmail: {
      type: String,
      required: [true, "Patient email is required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    },
    patientPhone: {
      type: String,
      required: [true, "Patient phone is required"],
      trim: true,
      match: [/^[0-9+\-\s()]{7,20}$/, "Please enter a valid phone number"],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor is required"],
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format"],
    },
    reason: {
      type: String,
      required: [true, "Reason for visit is required"],
      trim: true,
      maxlength: [300, "Reason must be at most 300 characters"],
    },
    status: {
      type: String,
      enum: { values: STATUSES, message: "Status must be one of: " + STATUSES.join(", ") },
      default: "scheduled",
    },
    notes: { type: String, trim: true, maxlength: [500, "Notes must be at most 500 characters"] },
  },
  { timestamps: true }
);

// Database-level safety net against double booking (race conditions):
// only one *scheduled* appointment per doctor, date and time.
appointmentSchema.index(
  { doctor: 1, date: 1, time: 1 },
  { unique: true, partialFilterExpression: { status: "scheduled" } }
);

appointmentSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model("Appointment", appointmentSchema);
