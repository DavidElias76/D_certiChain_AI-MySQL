import './index.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UsersProvider } from './context/UsersContext'; 

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import LandingPage from './pages/LandingPage';

import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Student Pages
import DashboardPage from './pages/student/DashboardPage';
import MyCertificates from './pages/student/MyCertificates';
import VerifyCertificates from './pages/student/VerifyCertificates';
import CareerRecommendations from './pages/student/CareerRecommendations';

// Admin Pages (create these later)
import DashboardAdminPage from './pages/admin/DashboardAdminPage';
import IssueCertificates from './pages/admin/IssueCertificates'; // to issue certificate
import ManageCertificates from './pages/admin/ManageCertificates'; // to manage and see all the certificates
import ManageUsers from './pages/admin/ManageUsers';// managee all the users
import Analytics from './pages/admin/Analytics';

// System Admin pages
import SystemDashboardPage from './pages/systemAdmin/SystemDashboardPage';
import RegisterInstitution from './pages/systemAdmin/RegisterInstitution';
import SystemAdminLoginPage from './pages/systemAdmin/SystemAdminLoginPage';

// There will be also a a system admin page that will register institution with the instituionId and the issue wallet address

function App() {
  return (
    <AuthProvider>
      <UsersProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* system login page - This will be used to log in the system admin */}
        <Route path="/system/admin/login" element={<SystemAdminLoginPage />} />

        {/* Protected Student/User Routes - Restricted to 'student' role */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/my-certificates" element={<MyCertificates />} />
            <Route path="/verify-certificate" element={<VerifyCertificates />} />
            <Route path="/career-recommendations" element={<CareerRecommendations />} />
          </Route>
        </Route>

        {/* Protected Admin Routes - Restricted to 'admin' role */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            {/* Add more admin routes here like /admin/users or /admin/analytics */}
            <Route path="/admin/dashboard" element={<DashboardAdminPage />} />
            <Route path='/admin/issue-certificates' element = {<IssueCertificates/>}/>
            <Route path='/admin/manage-certificates' element = {<ManageCertificates/>}/>
            <Route path='/admin/manage-users' element = {<ManageUsers/>}/>
            <Route path='/admin/analytics' element = {<Analytics/>}/>
          </Route>
        </Route>

        {/* system admin routes */}
        <Route element = {<ProtectedRoute allowedRoles={["systemAdmin"]}/>}>
          <Route element = {<DashboardLayout/>}>
            <Route path='/system/admin/dashboard' element = {<SystemDashboardPage/>}/>
            <Route path='/system/admin/register' element = {<RegisterInstitution/>}/>
          </Route>
        </Route>

        {/* Fallback for undefined routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </UsersProvider>
    </AuthProvider>
  );
}

export default App;

