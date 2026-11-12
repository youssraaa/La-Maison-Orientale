import AuthProvider from "../common/auth/AuthContext";
import ClientAuthProvider from "../common/auth/ClientAuthContext";
import CartProvider from "../features/order/context/CartContext";
import AppRoutes from "./AppRoutes";

function App() {
  return (
    <AuthProvider>
      <ClientAuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </ClientAuthProvider>
    </AuthProvider>
  );
}

export default App;
