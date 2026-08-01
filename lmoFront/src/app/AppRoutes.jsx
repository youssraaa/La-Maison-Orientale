import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../features/home/pages/HomePage";
import MenuPage from "../features/menu/pages/MenuPage";
import ReservationPage from "../features/reservation/pages/ReservationPage";
import ContactPage from "../features/contact/pages/ContactPage";
import GalleryPage from "../features/home/pages/GalleryPage";
import AdminLoginPage from "../features/admin/pages/AdminLoginPage";
import AdminDashboardPage from "../features/admin/pages/AdminDashboardPage";
import ProtectedAdminRoute from "../common/auth/ProtectedAdminRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/reservation" element={<ReservationPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/galerie" element={<GalleryPage />} />
      <Route path="/admin" element={<AdminLoginPage />} />
      <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedAdminRoute>
            <AdminDashboardPage />
          </ProtectedAdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
