import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import "../Styles/NavBar.css";

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          billwise
        </Link>

        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/analytics" className="nav-link">
                Analytics
              </Link>
              <Link to="/upload" className="nav-link">
                Upload
              </Link>
              <button onClick={logout} className="nav-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/signup" className="nav-button">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}