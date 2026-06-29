import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { CartProvider } from "./customer/cart.jsx";

import HomePage from "./customer/HomePage.jsx";
import CategoryPage from "./customer/CategoryPage.jsx";
import ProductPage from "./customer/ProductPage.jsx";
import SearchPage from "./customer/SearchPage.jsx";
import CartPage from "./customer/CartPage.jsx";
import AddressMapScreen from "./customer/AddressMapScreen.jsx";
import OrderTrackingScreen from "./customer/OrderTrackingScreen.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import RiderApp from "./rider/RiderApp.jsx";

// تغليف شاشات الزبون بسلة مشتركة
function CustomerLayout() {
  return (
    <CartProvider>
      <Outlet />
    </CartProvider>
  );
}

export default function App() {
  return (
    <Routes>
      {/* لوحة التاجر — منفصلة تماماً على /admin */}
      <Route path="/admin" element={<AdminDashboard />} />
      {/* تطبيق المندوب — منفصل، لا يحتاج سلّة */}
      <Route path="/rider" element={<RiderApp />} />

      {/* تطبيق الزبون — يفتح مباشرة على الرئيسية */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/address" element={<AddressMapScreen />} />
        <Route path="/track" element={<OrderTrackingScreen />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
}
