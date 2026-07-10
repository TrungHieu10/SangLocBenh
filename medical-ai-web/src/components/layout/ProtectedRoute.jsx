/**
 * ProtectedRoute Component - Bảo vệ route cần authentication
 */
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Spinner from '../ui/Spinner';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-midnight">
        <Spinner size="lg" text="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Force Patient without patientCode to LinkPatientCodePage
  if (user.role === 'Patient' && !user.patientCode && location.pathname !== '/link-patient-code') {
    return <Navigate to="/link-patient-code" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Nếu user không có quyền, đẩy về dashboard tương ứng với role của họ
    if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'Doctor') return <Navigate to="/doctor/dashboard" replace />;
    if (user.role === 'Nurse') return <Navigate to="/nurse/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
