import React from "react";
import { Routes, Route } from "react-router-dom";
import Launcher from "./Launcher.jsx";
import Frame from "./Frame.jsx";

import HomePage from "./customer/HomePage.jsx";
import CategoryPage from "./customer/CategoryPage.jsx";
import ProductPage from "./customer/ProductPage.jsx";
import SearchPage from "./customer/SearchPage.jsx";
import CartPage from "./customer/CartPage.jsx";
import AddressMapScreen from "./customer/AddressMapScreen.jsx";
import OrderTrackingScreen from "./customer/OrderTrackingScreen.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Launcher />} />
      <Route path="/app" element={<Frame><HomePage /></Frame>} />
      <Route path="/app/category" element={<Frame><CategoryPage /></Frame>} />
      <Route path="/app/product" element={<Frame><ProductPage /></Frame>} />
      <Route path="/app/search" element={<Frame><SearchPage /></Frame>} />
      <Route path="/app/cart" element={<Frame><CartPage /></Frame>} />
      <Route path="/app/address" element={<Frame><AddressMapScreen /></Frame>} />
      <Route path="/app/track" element={<Frame><OrderTrackingScreen /></Frame>} />
      <Route path="/admin" element={<Frame><AdminDashboard /></Frame>} />
      <Route path="*" element={<Launcher />} />
    </Routes>
  );
}
