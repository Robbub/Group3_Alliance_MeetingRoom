import React from "react";
import SideNavBar, { NavItem } from "../../components/SideNavBar/SideNavBar";
import { Header } from "../../components/Header/Header";
import { Outlet } from "react-router-dom";
import "./Settings.css";

export const navItems = [
  { label: 'Account', path: 'account' },
  { label: 'Security', path: 'security' },
  { label: 'Notifications', path: 'notifications' },
  { label: 'Appearance', path: 'appearance' },
];

export const Settings: React.FC = () => {
    return (
        <div className="main-layout">
            <Header />
            <div className="settings-container">
                <SideNavBar
                    navItems={navItems}
                    logoText="Settings"
                />
                <div className="settings-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};