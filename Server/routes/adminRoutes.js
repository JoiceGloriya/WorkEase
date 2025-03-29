import express from "express";
const router = express.Router();
import connectDB from "../utils/db.js"; // connectDB is an async function that returns a database connection
import jwt from "jsonwebtoken";
import oracledb from "oracledb"; // oracledb is a CommonJS module, so import as default and then destructure the desired property
const { OUT_FORMAT_OBJECT } = oracledb;
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";

// Configure storage for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    ); // Unique filename
  },
});

// Initialize multer
const upload = multer({ storage });

router.post("/adminlogin", async (req, res) => {
  let connection;
  try {
    connection = await connectDB();

    // Get admin details
    const sql = "SELECT id, email, password FROM admin WHERE email = :email";
    const binds = { email: req.body.email };

    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    if (result.rows.length === 0) {
      return res.json({ loginStatus: false, Error: "Wrong email or password" });
    }

    const adminRecord = result.rows[0];

    // 🔴 Remove bcrypt.compare() since password is stored as plain text
    if (req.body.password !== adminRecord.PASSWORD) {
      return res.json({ loginStatus: false, Error: "Wrong email or password" });
    }

    // ✅ Generate JWT Token
    const token = jwt.sign(
      { role: "admin", email: adminRecord.EMAIL, id: adminRecord.ID },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    // ✅ Set the token in a cookie
    res.cookie("token", token, { httpOnly: true });

    return res.json({ loginStatus: true, id: adminRecord.ID });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ loginStatus: false, Error: "Server error" });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});


router.get("/category", async (req, res) => {
  let connection;
  try {
    connection = await connectDB();
    const sql = "SELECT * FROM category";
    const result = await connection.execute(sql, [], {
      outFormat: OUT_FORMAT_OBJECT,
    });

    return res.json({ Status: true, data: result.rows });
  } catch (err) {
    console.error("Error in fetching categories:", err);
    return res.status(500).json({ Status: false, Error: "Server error" });
  } finally {
    if (connection) await connection.close();
  }
});

router.post("/add_category", async (req, res) => {
  let connection;
  try {
    connection = await connectDB();
    const sql =
      "INSERT INTO category (id, name) VALUES (category_seq.NEXTVAL, :name)";
    const binds = { name: req.body.category };
    await connection.execute(sql, binds, { autoCommit: true });
    return res.json({ Status: true });
  } catch (err) {
    console.error("Error in add_category:", err);
    return res.status(500).json({ Status: false, Error: "Query Error" });
  } finally {
    if (connection) await connection.close();
  }
});

router.post("/add_employee", upload.single("image"), async (req, res) => {
  let connection;
  try {
    connection = await connectDB();

    const hash = await bcrypt.hash(req.body.password, 10); //saltRounds = 10 -> number of unique characters

    const sql = `INSERT INTO employee 
                 (id, name, email, password, address, salary, image, category_id) 
                 VALUES (employee_seq.NEXTVAL, :name, :email, :password, :address, :salary, :image, :category_id)`;

    const binds = {
      name: req.body.name,
      email: req.body.email,
      password: hash,
      address: req.body.address,
      salary: req.body.salary,
      image: req.file ? req.file.filename : null,
      category_id: req.body.category_id,
    };

    await connection.execute(sql, binds, { autoCommit: true });

    res.json({ Status: true });
  } catch (err) {
    console.error("Error inserting employee:", err);
    res.json({ Status: false, Error: err.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing connection:", closeErr);
      }
    }
  }
});

router.get("/employee", async (req, res) => {
  let connection;

  try {
    connection = await connectDB();

    const result = await connection.execute("SELECT * FROM EMPLOYEE", [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.json({ Status: true, data: result.rows });
  } catch (err) {
    res.json({ Status: false, Error: err.message });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

router.get("/employee/:id", async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    connection = await connectDB();

    const query = "SELECT * FROM EMPLOYEE WHERE ID = :id";
    // const binds = { ID: id };

    const result = await connection.execute(
      query,
      { id },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({ data: result.rows });
  } catch (err) {
    res.json({ Status: false, Error: err.message });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

// Update Employee Route
router.put("/edit_employee/:id", async (req, res) => {
  let connection;
  try {
    const id = req.params.id;

    // Update query using Oracle SQL
    const sql = `
        UPDATE employee 
        SET name = :name, email = :email, salary = :salary, 
            address = :address, category_id = :category_id 
        WHERE id = :id`;

    const values = {
      name: req.body.name,
      email: req.body.email,
      salary: req.body.salary,
      address: req.body.address,
      category_id: req.body.category_id,
      id: id,
    };

    // Connect to Oracle DB
    connection = await connectDB();
    // Execute the update query
    const result = await connection.execute(sql, values, { autoCommit: true });

    // Check if any rows were affected
    if (result.rowsAffected === 0) {
      return res
        .status(404)
        .json({ Status: false, Error: "Employee not found" });
    }

    res.json({ Status: true, data: result });
  } catch (err) {
    res
      .status(500)
      .json({ Status: false, Error: "Query Error: " + err.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

router.delete("/delete_employee/:id", async (req, res) => {
  let connection;
  try {
    const id = req.params.id;

    // Delete query using Oracle SQL
    const sql = "DELETE FROM employee WHERE id = :id";

    connection = await connectDB();

    const result = await connection.execute(
      sql,
      { id: id },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res
        .status(404)
        .json({ Status: false, Error: "Employee not found" });
    }

    res.json({ Status: true, data: result });
  } catch (err) {
    res
      .status(500)
      .json({ Status: false, Error: "Query Error: " + err.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

router.get("/admin_count", async (req, res) => {
  let connection;
  try {
    connection = await connectDB();
    const sql = "SELECT COUNT(id) AS admin FROM admin";
    const result = await connection.execute(sql, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.json({ Status: true, data: result.rows });
  } catch (err) {
    res.json({ Status: false, Error: "Query Error " + err.message });
  } finally {
    if (connection) await connection.close();
  }
});

router.get("/employee_count", async (req, res) => {
  let connection;
  try {
    connection = await connectDB();
    const sql = "SELECT COUNT(id) AS employee FROM employee";
    const result = await connection.execute(sql, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.json({ Status: true, data: result.rows });
  } catch (err) {
    res.json({ Status: false, Error: "Query Error " + err.message });
  } finally {
    if (connection) await connection.close();
  }
});

router.get("/salary_count", async (req, res) => {
  let connection;
  try {
    connection = await connectDB();
    const sql = "SELECT SUM(salary) AS salaryOFEmp FROM employee";
    const result = await connection.execute(sql, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.json({ Status: true, data: result.rows });
  } catch (err) {
    res.json({ Status: false, Error: "Query Error " + err.message });
  } finally {
    if (connection) await connection.close();
  }
});

async function executeQuery(
  sql,
  binds = [],
  options = { outFormat: oracledb.OUT_FORMAT_OBJECT }
) {
  let connection;
  try {
    connection = await connectDB(); // Open connection
    const result = await connection.execute(sql, binds, options);
    return result.rows;
  } catch (err) {
    console.error("Query Error:", err);
    throw err;
  } finally {
    if (connection) {
      await connection.close(); // Always close connection
    }
  }
}

// ✅ Route: Get All Admin Records
router.get("/admin_records", async (req, res) => {
  try {
    const result = await executeQuery("SELECT * FROM ADMIN");
    res.json({ Status: true, data: result });
  } catch (err) {
    res.json({ Status: false, Error: "Query Error " + err.message });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

export { router as adminRouter };
