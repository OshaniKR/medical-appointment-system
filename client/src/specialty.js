// Each specialty gets its own color so a doctor is recognisable at a glance.
// main = accent, tint = soft background, ink = dark text that stays readable on the tint.
const PALETTE = {
  "General Physician": { main: "#1FA39A", tint: "#DDF4F1", ink: "#0B6B64" },
  Cardiologist: { main: "#F0604F", tint: "#FFE4E0", ink: "#A82F22" },
  Dermatologist: { main: "#8B79E0", tint: "#ECE8FC", ink: "#5442B5" },
  Pediatrician: { main: "#F2B01E", tint: "#FFF1CC", ink: "#7A5400" },
  "Orthopedic Surgeon": { main: "#3A9AD0", tint: "#DCEFF9", ink: "#17658F" },
};

const FALLBACK = { main: "#6B7C93", tint: "#E6EBF1", ink: "#3F4F63" };

export const specialtyColors = (specialization) => PALETTE[specialization] || FALLBACK;

export const colorVars = (specialization) => {
  const c = specialtyColors(specialization);
  return { "--spec-main": c.main, "--spec-tint": c.tint, "--spec-ink": c.ink };
};

export const initials = (name = "") =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");