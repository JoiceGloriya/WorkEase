import axios from "axios";
import React, { useEffect, useState } from "react";

const Home = () => {
  const [adminTotal, setAdminTotal] = useState(0);
  const [employeeTotal, setEmployeeTotal] = useState(0);
  const [salaryTotal, setSalaryTotal] = useState(0);
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    fetchCounts();
    fetchAdminRecords();
  }, []);

  const fetchCounts = async () => {
    try {
      const [adminRes, employeeRes, salaryRes] = await Promise.all([
        axios.get("http://localhost:3000/auth/admin_count"),
        axios.get("http://localhost:3000/auth/employee_count"),
        axios.get("http://localhost:3000/auth/salary_count"),
      ]);

      console.log("Admin Count API Response:", adminRes.data);
      console.log("Employee Count API Response:", employeeRes.data);
      console.log("Salary Count API Response:", salaryRes.data);

      if (adminRes.data.Status && adminRes.data.data.length > 0) {
        setAdminTotal(adminRes.data.data[0].admin || 0);
      }

      if (employeeRes.data.Status && employeeRes.data.data.length > 0) {
        setEmployeeTotal(employeeRes.data.data[0].employee || 0);
      }

      if (salaryRes.data.Status && salaryRes.data.data.length > 0) {
        setSalaryTotal(salaryRes.data.data[0].salaryOFEmp || 0);
      }
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const fetchAdminRecords = async () => {
    try {
      const result = await axios.get(
        "http://localhost:3000/auth/admin_records"
      );
      console.log("Admin Records API Response:", result.data);

      if (result.data.Status && Array.isArray(result.data.data)) {
        setAdmins(result.data.data);
      } else {
        alert("Unexpected API response: " + JSON.stringify(result.data));
      }
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  return (
    <div>
      <div className="p-3 d-flex justify-content-around mt-3">
        <div className="px-3 pt-2 pb-3 border shadow-sm w-25">
          <div className="text-center pb-1">
            <h4>Admin</h4>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5>Total:</h5>
            <h5>{adminTotal}</h5>
          </div>
        </div>
        <div className="px-3 pt-2 pb-3 border shadow-sm w-25">
          <div className="text-center pb-1">
            <h4>Employee</h4>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5>Total:</h5>
            <h5>{employeeTotal}</h5>
          </div>
        </div>
        <div className="px-3 pt-2 pb-3 border shadow-sm w-25">
          <div className="text-center pb-1">
            <h4>Salary</h4>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5>Total:</h5>
            <h5>${salaryTotal}</h5>
          </div>
        </div>
      </div>
      <div className="mt-4 px-5 pt-3">
        <h3>List of Admins</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.ID}>
                <td>{a.EMAIL}</td>
                <td>
                  <button className="btn btn-info btn-sm me-2">Edit</button>
                  <button className="btn btn-warning btn-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
