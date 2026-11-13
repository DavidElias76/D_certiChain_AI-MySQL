import './index.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UsersProvider } from './context/UsersContext'; 
import { WalletProvider } from './context/WalletContext';
import { InstitutionProvider } from './context/InstitutionContext';
import { CertificateProvider as CertificateProvider } from './context/CertificateContext';
import { RecommendationsProvider } from './context/CarrerRecommendationsContext'
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useUsers } from './context/UsersContext';
import { useCertificates } from './context/CertificateContext';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import LandingPage from './pages/LandingPage';

import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import ProfilePage from './components/layout/ProfilePage';

// Student Pages
import DashboardPage from './pages/student/DashboardPage';
import MyCertificates from './pages/student/MyCertificates';
import VerifyCertificates from './pages/student/VerifyCertificates';
import CareerRecommendations from './pages/student/CareerRecommendations';
import VerifyCertificateDashboard from './pages/employer/VerifyCertificateDashboard';

// Admin Pages (create these later)
import DashboardAdminPage from './pages/admin/DashboardAdminPage';
import IssueCertificates from './pages/admin/IssueCertificates'; // to issue certificate
import CertificatePreview from './pages/admin/CertificatePreview'; // full cert preview before issuing
import ManageCertificates from './pages/admin/ManageCertificates'; // to manage and see all the certificates
import ManageUsers from './pages/admin/ManageUsers';// managee all the users
import Analytics from './pages/admin/Analytics';
import RegisterAdmin from './pages/admin/RegisterAdmin';

// System Admin pages
import SystemDashboardPage from './pages/systemAdmin/SystemDashboardPage';
import RegisterInstitution from './pages/systemAdmin/RegisterInstitution';
import RegisterMainAdminPage from './pages/systemAdmin/RegisterMainAdminPage';
import SystemAdminLoginPage from './pages/systemAdmin/SystemAdminLoginPage';
import AdminAnalytics from './pages/systemAdmin/AdminAnalytics';
import ManageInstitutionsPage from './pages/systemAdmin/ManageInstitutionsPage';
import ManageAdmins from './pages/systemAdmin/ManageAdmins';

// There will be also a system admin page that will register institution with the instituionId and the issue wallet address

function RefreshAuthenticatedData() {
  const { user } = useAuth();
  const { getUsers } = useUsers();
  const { getCertificates } = useCertificates();

  useEffect(() => {
    if (!user) return;

    const refreshes: Promise<void>[] = [getCertificates()];
    if (user.role === 'admin') refreshes.push(getUsers());

    void Promise.all(refreshes).catch((error) => {
      console.error('Failed to refresh data after login', error);
    });
  }, [user?.id, user?.role, getCertificates, getUsers]);

  return null;
}

function App() {
  return (
<AuthProvider>
  <InstitutionProvider>
    <UsersProvider>
      <RecommendationsProvider>
          <WalletProvider>
            <CertificateProvider>
                <RefreshAuthenticatedData />
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/verify" element={<VerifyCertificates standalone />} />

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

                    {/* Employer certificate verification */}
                    <Route element={<ProtectedRoute allowedRoles={['employer', "alumni"]} />}>
                      <Route element={<DashboardLayout />}>
                      {/* The dashboad not need and removed */}
                        {/* <Route path="/employer/dashboard" element={<Navigate to="/employer/verify-certificate" replace />} /> */}
                        <Route path="/employer/verify-certificate" element={<VerifyCertificateDashboard />} />
                      </Route>
                    </Route>

                    {/* Protected institution admin routes */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'main_admin']} />}>
                      <Route element={<DashboardLayout />}>
                        <Route path="/admin/dashboard" element={<DashboardAdminPage />} />
                        <Route path='/admin/issue-certificates' element = {<IssueCertificates/>}/>
                        <Route path='/admin/issue-certificates/preview' element = {<CertificatePreview/>}/>
                        <Route path='/admin/manage-certificates' element = {<ManageCertificates/>}/>
                        <Route path='/admin/manage-users' element = {<ManageUsers/>}/>
                        <Route path='/admin/analytics' element = {<Analytics/>}/>
                      </Route>
                    </Route>

                    {/* system admin routes */}
                    <Route element = {<ProtectedRoute allowedRoles={["systemAdmin"]}/>}>
                      <Route element = {<DashboardLayout/>}>
                        <Route path='/system/admin/dashboard' element = {<SystemDashboardPage/>}/>
                        <Route path='/system/admin/register-institutions' element = {<RegisterInstitution/>}/>
                        <Route path='/system/admin/register-main-admin' element = {<RegisterMainAdminPage/>}/>
                        <Route path='/system/admin/manage-institutions' element = {<ManageInstitutionsPage/>}/>
                        <Route path='/system/admin/manage-admins' element = {<ManageAdmins/>}/>
                        <Route path='/system/admin/analytics' element = {<AdminAnalytics/>}/>
                      </Route>
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={['main_admin', 'systemAdmin']} />}>
                      <Route element={<DashboardLayout />}>
                        <Route path='/admin/register-admin' element={<RegisterAdmin />} />
                      </Route>
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={['student', 'employer', 'admin', 'main_admin', 'systemAdmin']} />}>
                      <Route element={<DashboardLayout />}>
                        <Route path="/profile" element={<ProfilePage />} />
                      </Route>
                    </Route>

                    {/* Fallback for undefined routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
          </CertificateProvider>
        </WalletProvider>
      </RecommendationsProvider>
    </UsersProvider>
  </InstitutionProvider>
</AuthProvider>
  );
}

export default App;
