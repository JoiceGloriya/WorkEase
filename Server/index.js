import express from "express";
import { config } from "dotenv";
import cors from "cors";
import connectDB from "./utils/db.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { employeeRouter } from "./routes/employeeRoutes.js";
import  jwt  from "jsonwebtoken";
import cookieParser from "cookie-parser";

config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  //Middleware (like cors) should be applied before defining routes to affect all incoming requests.
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/auth", adminRouter);
app.use("/employee", employeeRouter);
app.use(express.static("public"));
const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) return res.json({ Status: false, Error: "Wrong token" });
      req.id = decoded.id;
      req.role = decoded.role;
      next();
    });
  } else {
    return res.json({ Status: false, Error: "Not authenticated" });
  }
};
app.use("/verify", verifyUser, (req, res) => {
  return res.json({ Status: true, role: req.role, id: req.id });
});

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}!`));
  } catch (err) {
    console.error("Oops, failed to start server due to DB connection error:");
  }
}

startServer();
