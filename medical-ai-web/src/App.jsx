import './App.css'
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './store/ThemeContext';
import { Toaster } from 'react-hot-toast';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { SkeletonStatCard } from './components/ui/Skeleton';
import useAuth from './hooks/useAuth';

const RoleBasedRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'Admin') return <Navigate to="/admin/dashboard" />;
  if (user.role === 'Doctor') return <Navigate to="/doctor/dashboard" />;
  if (user.role === 'Nurse') return <Navigate to="/nurse/dashboard" />;
  return <Navigate to="/dashboard" />;
};

// ─── Lazy-loaded Pages ────────────────────────────────────────────────────────
const LoginPage          = lazy(() => import('./pages/LoginPage'));
const RegisterPage       = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage  = lazy(() => import('./pages/ResetPasswordPage'));
const ClinicalForm       = lazy(() => import('./pages/ClinicalForm'));
const ResultDashboard    = lazy(() => import('./pages/ResultDashboard'));
const LinkPatientCodePage= lazy(() => import('./pages/LinkPatientCodePage'));
const DashboardPage      = lazy(() => import('./pages/DashboardPage'));
const ProfilePage        = lazy(() => import('./pages/ProfilePage'));
const AdminDashboard     = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers         = lazy(() => import('./pages/AdminUsers'));
const AdminCheckups      = lazy(() => import('./pages/AdminCheckups'));
const DoctorDashboard    = lazy(() => import('./pages/DoctorDashboard'));
const NurseDashboard     = lazy(() => import('./pages/NurseDashboard'));
const NotFoundPage       = lazy(() => import('./pages/NotFoundPage'));
const PrivacyPolicyPage  = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));

// ─── Suspense Fallback ────────────────────────────────────────────────────────
const PageFallback = () => (
  <div className="min-h-screen bg-midnight flex items-center justify-center">
    <div className="grid grid-cols-2 gap-4 w-64">
      <SkeletonStatCard />
      <SkeletonStatCard />
      <SkeletonStatCard />
      <SkeletonStatCard />
    </div>
  </div>
);

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <Toaster position="top-right" toastOptions={{ className: 'glass-card text-glass-50 border-cyan-500/20' }} />
        <Router>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected layout routes */}
              <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route index element={<RoleBasedRedirect />} />

                {/* Patient */}
                <Route path="dashboard" element={<ProtectedRoute allowedRoles={['Patient']}><DashboardPage /></ProtectedRoute>} />

                {/* Doctor */}
                <Route path="doctor/dashboard" element={<ProtectedRoute allowedRoles={['Doctor']}><DoctorDashboard /></ProtectedRoute>} />

                {/* Nurse */}
                <Route path="nurse/dashboard" element={<ProtectedRoute allowedRoles={['Nurse', 'Admin']}><NurseDashboard /></ProtectedRoute>} />

                {/* Admin */}
                <Route path="admin/dashboard" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="admin/users" element={<ProtectedRoute allowedRoles={['Admin']}><AdminUsers /></ProtectedRoute>} />
                <Route path="admin/checkups" element={<ProtectedRoute allowedRoles={['Admin']}><AdminCheckups /></ProtectedRoute>} />

                {/* Shared */}
                <Route path="clinical-form" element={<ProtectedRoute allowedRoles={['Nurse', 'Doctor']}><ClinicalForm /></ProtectedRoute>} />
                <Route path="link-patient-code" element={<LinkPatientCodePage />} />
                <Route path="result/:checkupId" element={<ResultDashboard />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
