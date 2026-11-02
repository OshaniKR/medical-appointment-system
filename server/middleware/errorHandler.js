function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error handler: turns Mongoose / app errors into clean JSON responses.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: errors.join(". "), errors });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: `Invalid value for ${err.path}` });
  }
  if (err.code === 11000) {
    return res.status(409).json({
      message: "This doctor already has a scheduled appointment at that date and time.",
    });
  }
  if (err.status) {
    return res.status(err.status).json({ message: err.message });
  }
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
}

module.exports = { notFound, errorHandler };
