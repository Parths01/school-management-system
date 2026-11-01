import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import studentsRouter from "./routes/students.js";
import schoolRouter from "./routes/school.js";
import dashboardRouter from "./routes/dashboard.js";

const app = express();
const port = Number(process.env.PORT) || 5000;
const mongoUri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json({ limit: "20kb" }));
app.use("/api/students", studentsRouter);
app.use("/api/school", schoolRouter);
app.use("/api/dashboard", dashboardRouter);
app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", database: mongoose.connection.readyState === 1 });
});

app.use((error, _request, response, _next) => {
  if (error.name === "ValidationError") {
    response.status(400).json({
      message: Object.values(error.errors)
        .map((item) => item.message)
        .join(" "),
    });
    return;
  }
  if (error.code === 11000) {
    response.status(409).json({ message: "A student with that email already exists." });
    return;
  }
  if (error instanceof SyntaxError && "body" in error) {
    response.status(400).json({ message: "Request body must be valid JSON." });
    return;
  }

  console.error("API request failed:", error);
  response.status(500).json({ message: "An unexpected server error occurred." });
});

if (!mongoUri) {
  console.error("MONGODB_URI is required. Copy .env.example to .env and configure MongoDB.");
  process.exit(1);
}

try {
  await mongoose.connect(mongoUri);
  app.listen(port, () => {
    console.log(`Scholar API listening at http://localhost:${port}`);
  });
} catch (error) {
  console.error("Unable to connect to MongoDB:", error.message);
  process.exit(1);
}
