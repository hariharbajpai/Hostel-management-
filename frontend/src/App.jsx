import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';

// Pages
import Login from './pages/Login';
import StudentDashboard from './pages/student/Dashboard';
import StudentPreferences from './pages/student/Preferences';
import StudentProfile from './pages/student/Profile';
import StudentComplaints from './pages/student/Complaints';
import StudentNotices from './pages/student/Notices';
import AdminDashboard from './pages/admin/Dashboard';
import AdminApplications from './pages/admin/Applications';
import AdminSwaps from './pages/admin/Swaps';
import AdminRooms from './pages/admin/Rooms';
import AdminComplaints from './pages/admin/Complaints';
import AdminNotices from './pages/admin/Notices';
import AdminStudents from './pages/admin/AdminStudents';

const App = () => {
  const { user } = useAuthStore();

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#000',
              color: '#fff',
              fontWeight: '600',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace /> : <Login />}
          />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute requireRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/preferences"
            element={
              <ProtectedRoute requireRole="student">
                <StudentPreferences />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute requireRole="student">
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/complaints"
            element={
              <ProtectedRoute requireRole="student">
                <StudentComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/notices"
            element={
              <ProtectedRoute requireRole="student">
                <StudentNotices />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/swaps"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminSwaps />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rooms"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminRooms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notices"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminNotices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminStudents />
              </ProtectedRoute>
            }
          />

          {/* Default Redirect */}
          <Route
            path="/"
            element={
              user ? (
                <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;
