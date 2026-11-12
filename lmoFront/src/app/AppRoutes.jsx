import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../features/home/pages/HomePage";
import MenuPage from "../features/menu/pages/MenuPage";
import ReservationPage from "../features/reservation/pages/ReservationPage";
import ContactPage from "../features/contact/pages/ContactPage";
import GalleryPage from "../features/home/pages/GalleryPage";
import StaffEntryRedirect from "../common/components/StaffEntryRedirect";
import AdminDashboardPage from "../features/admin/pages/AdminDashboardPage";
import AgentsPage from "../features/admin/pages/AgentsPage";
import NotificationsPage from "../features/admin/pages/NotificationsPage";
import AccountPage from "../features/admin/pages/SettingsPage";
import AgentActivatePage from "../features/admin/pages/AgentActivatePage";
import ReservationsManagePage from "../features/admin/pages/ReservationsManagePage";
import MessagesManagePage from "../features/admin/pages/MessagesManagePage";
import CarteManagePage from "../features/admin/pages/CarteManagePage";
import GalleryManagePage from "../features/admin/pages/GalleryManagePage";
import HorairesPage from "../features/admin/pages/HorairesPage";
import RestaurantSettingsPage from "../features/admin/pages/RestaurantSettingsPage";
import RestaurantInfoPage from "../features/admin/pages/RestaurantInfoPage";
import ClientsPage from "../features/admin/pages/ClientsPage";
import AgentResetPasswordPage from "../features/admin/pages/AgentResetPasswordPage";
import ClientLoginPage from "../features/client/pages/ClientLoginPage";
import ClientSignupPage from "../features/client/pages/ClientSignupPage";
import ClientPortalLayout from "../features/client/components/ClientPortalLayout";
import ClientDashboardPage from "../features/client/pages/ClientDashboardPage";
import ClientReservationsPage from "../features/client/pages/ClientReservationsPage";
import ClientReservationDetailPage from "../features/client/pages/ClientReservationDetailPage";
import ClientCommandesPage from "../features/client/pages/ClientCommandesPage";
import ClientCommandeDetailPage from "../features/client/pages/ClientCommandeDetailPage";
import ClientProfilPage from "../features/client/pages/ClientProfilPage";
import ClientMessagesPage from "../features/client/pages/ClientMessagesPage";
import ClientNotificationsPage from "../features/client/pages/ClientNotificationsPage";
import CommanderPage from "../features/order/pages/CommanderPage";
import OrderConfirmationPage from "../features/order/pages/OrderConfirmationPage";
import CommandeManagePage from "../features/order/pages/CommandeManagePage";
import ReservationManagePage from "../features/reservation/pages/ReservationManagePage";
import CommandesManagePage from "../features/admin/pages/CommandesManagePage";
import ProtectedStaffRoute from "../common/auth/ProtectedStaffRoute";
import ProtectedAdminOnlyRoute from "../common/auth/ProtectedAdminOnlyRoute";
import ProtectedAgentOnlyRoute from "../common/auth/ProtectedAgentOnlyRoute";
import ProtectedClientRoute from "../common/auth/ProtectedClientRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/reservation" element={<ReservationPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/galerie" element={<GalleryPage />} />
      <Route path="/connexion" element={<ClientLoginPage />} />
      <Route path="/inscription" element={<ClientSignupPage />} />
      <Route
        path="/mon-compte"
        element={
          <ProtectedClientRoute>
            <ClientPortalLayout />
          </ProtectedClientRoute>
        }
      >
        <Route index element={<ClientDashboardPage />} />
        <Route path="reservations" element={<ClientReservationsPage />} />
        <Route path="reservations/:ref" element={<ClientReservationDetailPage />} />
        <Route path="commandes" element={<ClientCommandesPage />} />
        <Route path="commandes/:ref" element={<ClientCommandeDetailPage />} />
        <Route path="profil" element={<ClientProfilPage />} />
        <Route path="messages" element={<ClientMessagesPage />} />
        <Route path="notifications" element={<ClientNotificationsPage />} />
      </Route>
      <Route path="/commander" element={<CommanderPage />} />
      <Route path="/commande/confirmation/:token" element={<OrderConfirmationPage />} />
      <Route path="/commande/gerer/:token" element={<CommandeManagePage />} />
      <Route path="/reservation/gerer/:token" element={<ReservationManagePage />} />
      <Route path="/admin" element={<StaffEntryRedirect />} />
      <Route path="/admin/login" element={<Navigate to="/connexion" replace />} />
      <Route path="/admin/activer-compte" element={<AgentActivatePage />} />
      <Route path="/admin/reinitialiser-mot-de-passe" element={<AgentResetPasswordPage />} />
      <Route path="/admin/accueil" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/hub" element={<Navigate to="/admin/dashboard" replace />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedStaffRoute>
            <AdminDashboardPage />
          </ProtectedStaffRoute>
        }
      />
      <Route
        path="/admin/horaires"
        element={
          <ProtectedAgentOnlyRoute>
            <HorairesPage />
          </ProtectedAgentOnlyRoute>
        }
      />
      <Route
        path="/admin/restaurant"
        element={
          <ProtectedAgentOnlyRoute>
            <RestaurantSettingsPage />
          </ProtectedAgentOnlyRoute>
        }
      />
      <Route
        path="/admin/infos"
        element={
          <ProtectedAgentOnlyRoute>
            <RestaurantInfoPage />
          </ProtectedAgentOnlyRoute>
        }
      />
      <Route
        path="/admin/clients"
        element={
          <ProtectedAgentOnlyRoute>
            <ClientsPage />
          </ProtectedAgentOnlyRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedStaffRoute>
            <NotificationsPage />
          </ProtectedStaffRoute>
        }
      />
      <Route
        path="/admin/reservations"
        element={
          <ProtectedAgentOnlyRoute>
            <ReservationsManagePage />
          </ProtectedAgentOnlyRoute>
        }
      />
      <Route
        path="/admin/commandes"
        element={
          <ProtectedAgentOnlyRoute>
            <CommandesManagePage />
          </ProtectedAgentOnlyRoute>
        }
      />
      <Route
        path="/admin/messages"
        element={
          <ProtectedAgentOnlyRoute>
            <MessagesManagePage />
          </ProtectedAgentOnlyRoute>
        }
      />
      <Route
        path="/admin/carte"
        element={
          <ProtectedAgentOnlyRoute>
            <CarteManagePage />
          </ProtectedAgentOnlyRoute>
        }
      />
      <Route
        path="/admin/galerie"
        element={
          <ProtectedAgentOnlyRoute>
            <GalleryManagePage />
          </ProtectedAgentOnlyRoute>
        }
      />
      <Route
        path="/admin/agents"
        element={
          <ProtectedAdminOnlyRoute>
            <AgentsPage />
          </ProtectedAdminOnlyRoute>
        }
      />
      <Route
        path="/admin/compte"
        element={
          <ProtectedStaffRoute>
            <AccountPage />
          </ProtectedStaffRoute>
        }
      />
      <Route path="/admin/profil" element={<Navigate to="/admin/compte" replace />} />
      <Route path="/admin/parametres" element={<Navigate to="/admin/compte" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
