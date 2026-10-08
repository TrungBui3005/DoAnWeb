import { Navigate, Route, Routes } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import UserLayout from '../layouts/UserLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import HomePage from '../pages/user/HomePage';
import FoodDiaryPage from '../pages/user/FoodDiaryPage';
import ActivityPage from '../pages/user/ActivityPage';
import ReportsPage from '../pages/user/ReportsPage';
import ScanFoodPage from '../pages/user/ScanFoodPage';
import AIChatPage from '../pages/user/AIChatPage';
import ProfilePage from '../pages/user/ProfilePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import UserManagePage from '../pages/admin/UserManagePage';
import FoodManagePage from '../pages/admin/FoodManagePage';

function RootRedirect() {
  const { user } = useAuth();
  const destination = !user ? '/login' : user.role === 'admin' ? '/admin' : '/app';
  return <Navigate to={destination} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<PrivateRoute />}>
        <Route element={<UserLayout />}>
          <Route path="/app" element={<HomePage />} />
          <Route path="/diary" element={<FoodDiaryPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/foods" element={<FoodManagePage />} />
          <Route path="/scan" element={<ScanFoodPage />} />
          <Route path="/assistant" element={<AIChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<UserManagePage />} />
            <Route path="/admin/foods" element={<FoodManagePage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
