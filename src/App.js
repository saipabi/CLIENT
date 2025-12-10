// src/App.js
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import { isAuthenticated } from './utils/auth';

const PrivateRoute = ({ children }) => {
  if (isAuthenticated()) {
    return children;
  }
  return <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const location = useLocation();
  if (isAuthenticated()) {
    return <Navigate to="/profile" replace state={{ from: location }} />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/register" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
