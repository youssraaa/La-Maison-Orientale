import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import "./index.css";
import "./common/styles/public-responsive.css";
import "./features/order/order-banner.css";
import "./features/client/client-portal-hub.css";
import "./features/reservation/reservation-modals.css";
import "./features/admin/admin-dashboard.css";
import "./features/admin/admin-redesign.css";
import "./features/admin/admin-components.css";
import "./features/admin/admin-dashboard-charts.css";
import "./features/admin/admin-polish.css";
import "./features/admin/admin-ops-redesign.css";
import "./features/admin/staff-auth.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
