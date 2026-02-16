import { Routes, Route } from "react-router-dom";

import NavBar from "./Components/NavBar";

import HomePage from "./Pages/HomePage";
import Dashboard from "./Pages/Dashboard";
import Analytics from "./Pages/Analytics";
import Upload from "./Pages/Upload";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";

import "./App.css";

export default function App() {
  return (
    <>
      <NavBar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/upload" element={<Upload />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  );
}
