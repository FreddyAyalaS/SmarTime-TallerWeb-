import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import '../styles/Sidebar.css'
import '../styles/LayoutPage.css'
const Layout = () => {
  return (
    <div className="app-layout"> {}
      <div className="sidebar-placeholder">
        <Sidebar />
      </div>
      <div className="main-content-wrapper">
        <div className="header-placeholder">
          <Header />
        </div>
        <main className="page-outlet">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
