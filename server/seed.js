require("dotenv").config();
const mongoose = require("mongoose");
const Doctor = require("./models/Doctor");

const doctors = [
  { name: "Dr. Nimal Perera", specialization: "General Physician" },
  { name: "Dr. Sanduni Fernando", specialization: "Cardiologist" },
  { name: "Dr. Kasun Silva", specialization: "Dermatologist" },
  { name: "Dr. Ayesha Rahman", specialization: "Pediatrician" },
  { name: "Dr. Ruwan Jayasuriya", specialization: "Orthopedic Surgeon" },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Doctor.deleteMany({});
    await Doctor.insertMany(doctors);
    console.log(`Seeded ${doctors.length} doctors`);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
