import React, { useState } from "react";
import "./style.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EmployeeLogin = () => {
    const [values, setValues] = useState({
        email: "",
        password: "",
      });
      const [error, setError] = useState(null);
      const navigate = useNavigate();
    
      const handleSubmit = async (event) => {
        event.preventDefault();
    
        try {
          const response = await axios.post(
            `http://localhost:3000/employee/employee_login`,
            values,
            { withCredentials: true } // Ensures session-based authentication works
          );
          if (response.data.loginStatus) {
            localStorage.setItem("valid", true);
            navigate(`/employee_detail/${response.data.id}`);
          } else {
            setError(response.data.Error || "Invalid credentials!");
          }
        } catch (err) {
          setError(err.response?.data?.Error || "Login failed. Try again.");
          console.error("Login Error:", err.response?.data || err.message);
        }
    }
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 loginPage">
      <div className="p-3 rounded w-25 border loginForm">
        {error && <div className="text-warning">{error}</div>}
        <h2>Login Page</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email">
              <strong>Email:</strong>
            </label>
            <input
              type="email"
              name="email"
              autoComplete="off"
              placeholder="Enter email"
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              className="form-control rounded-0"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password">
              <strong>Password:</strong>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              onChange={(e) =>
                setValues({ ...values, password: e.target.value })
              }
              className="form-control rounded-0"
              required
            />
          </div>

          <button className="btn btn-success w-100 rounded-0 mb-2">
            Log in
          </button>

          <div className="mb-1">
            <input type="checkbox" name="tick" id="tick" className="me-2" />
            <label htmlFor="tick">You agree to our terms and conditions</label>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeLogin;
