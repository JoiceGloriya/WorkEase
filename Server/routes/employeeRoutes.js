import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import connectDB from "../utils/db.js"; // connectDB is an async function that returns a database connection
// oracledb is a CommonJS module, so import as default and then destructure the desired property
import oracledb from "oracledb";
const OUT_FORMAT_OBJECT = oracledb.OUT_FORMAT_OBJECT;

router.post("/employee_login", async (req, res) => {
  let connection;
  try {
    connection = await connectDB();

    const sql = "SELECT * FROM employee WHERE email = :email";
    const binds = { email: req.body.email };

    const result = await connection.execute(sql, binds, {
      outFormat: OUT_FORMAT_OBJECT,
    });

    if (result.rows.length === 0) {
      return res.json({ loginStatus: false, Error: "Wrong email or password" });
    }

    // Extract stored hashed password
    const employeeRecord = result.rows[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(
      req.body.password,
      employeeRecord.PASSWORD
    );
    if (!isMatch) {
      return res.json({ loginStatus: false, Error: "Wrong email or password" });
    }

    // Generate JWT Token
    const email = result.rows[0].EMAIL;
    const token = jwt.sign(
      { role: "employee", email: email, id: result.rows[0].ID },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.cookie("token", token);
    return res.json({ loginStatus: true, id: result.rows[0].ID });
  } catch (err) {
    return res.status(500).json({ loginStatus: false, Error: "Server error" });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

router.get("/detail/:id", async (req, res) => {
  let connection;
  try {
    connection = await connectDB();
    const id = req.params.id;
    const sql = "SELECT * FROM employee WHERE id = :id";
    const result = await connection.execute(
      sql,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (result.rows.length === 0) {
      return res.json({ Status: false, Error: "Employee not found" });
    }

    return res.json({ Status: true, Data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ Status: false, Error: "Server error" });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

  router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json({Status: true})
  })

export { router as employeeRouter };
