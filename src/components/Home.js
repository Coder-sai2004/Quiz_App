import React, { Fragment, useState, useEffect } from 'react';
import '@mdi/font/css/materialdesignicons.min.css';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("username");
    const adminFlag = localStorage.getItem("isAdmin") === "true";

    if (token) {
      setIsLoggedIn(true);
      setUsername(user || "");
      setIsAdmin(adminFlag);
    } else {
      setIsLoggedIn(false);
      setUsername("");
      setIsAdmin(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("isAdmin");
    setIsLoggedIn(false);
    setUsername("");
    setIsAdmin(false);
    alert("You have been logged out.");
    navigate("/"); // back to guest home
  };

  return (
    <Fragment>
      <Helmet><title>Quiz App - Home</title></Helmet>
      <div id="home">
        <section>
          <div style={{ textAlign: 'center' }}>
            <span className="mdi mdi-cube-outline cube"></span>
          </div>
          <h1>Quiz App</h1>

          {isLoggedIn && <p>Welcome, <strong>{username}</strong>!</p>}

          {/* Play button */}
          <div className="play-button-container">
            <ul>
              <li>
                <Link to="/play/CategoryDifficultySelection" className="play-btn">
                  Play
                </Link>
              </li>
            </ul>
          </div>

          {/* Auth & navigation buttons */}
          <div className="auth-container">
            {!isLoggedIn ? (
              <>
                <Link to="/Login" className="auth-btn" id="login">Login</Link>
                <Link to="/Register" className="auth-btn" id="register">Register</Link>
              </>
            ) : (
              <>
                <Link to="/history" className="auth-btn" id="history">History</Link>
                <Link to="/leaderboard" className="auth-btn" id="leaderboard">Leaderboard</Link>

                {/* ✅ Only show Admin Panel if user is admin */}
                {isAdmin && (
                  <Link to="/admin" className="auth-btn" id="admin">Admin Panel</Link>
                )}

                <button onClick={handleLogout} className="auth-btn" id="logout">Logout</button>
              </>
            )}
          </div>
        </section>
      </div>
    </Fragment>
  );
};

export default Home;
