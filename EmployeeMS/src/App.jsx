import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./Components/Login.jsx";
import Dashboard from "./Components/Dashboard.jsx";
import Home from "./Components/Home.jsx";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Employee from "./Components/Employee.jsx";
import Category from "./Components/Category.jsx";
import Profile from "./Components/Profile.jsx";
import AddCategory from "./Components/AddCategory.jsx";
import AddEmployee from "./Components/AddEmployee.jsx";
import EditEmployee from "./Components/EditEmployee.jsx";
import Start from "./Components/Start.jsx";
import EmployeeLogin from "./Components/EmployeeLogin.jsx";
import EmployeeDetail from "./Components/EmployeeDetail.jsx";
import { useEffect } from "react";
import PrivateRoute from "./Components/PrivateRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/adminlogin" element={<Login />} />
        <Route path="/employee_login" element={<EmployeeLogin />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route path="" element={<Home />} />
          <Route path="/dashboard/employee" element={<Employee />} />
          <Route path="/dashboard/category" element={<Category />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/add_category" element={<AddCategory />} />
          <Route path="/dashboard/add_employee" element={<AddEmployee />} />
          <Route
            path="/dashboard/edit_employee/:id"
            element={<EditEmployee />}
          />
          <Route
            path="/dashboard/edit_employee/:id"
            element={<EditEmployee />}
          />
        </Route>
        <Route path="/employee_detail/:id" element={<EmployeeDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
