export function errorMiddleware(err, req, res, next) {
  console.error("API Error:", err);

  if (err.name === "MulterError") {
    return res.status(400).json({
      message: err.message,
    });
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors || {}).map((e) => e.message);
    return res.status(400).json({
      message: messages.join(", ") || "Validation error occurred.",
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: `Invalid identifier format for ${err.path || "field"}.`,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "Record";
    return res.status(409).json({
      message: `${field} already exists.`,
    });
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
}

