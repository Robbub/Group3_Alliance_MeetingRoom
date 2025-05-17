import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './SideNavBar.css';
import { navItems } from './navItems';

export interface NavItem {
    label: string; 
    path: string;
}

interface SideNavBarProps {
    navItems: NavItem[];
    logoText?: string;
    selectedPath?: string;
    onSelect?: (item: NavItem) => void;
}

const SideNavBar: React.FC<SideNavBarProps> = ({ navItems, logoText }) => {
    const location = useLocation();

    return (
        <nav className="side-nav">
            <div className="side-nav__logo">
                <h2>{logoText}</h2>
            </div>
            <ul className="side-nav__list">
                {navItems.map(item => (
                    <li
                        key={item.path} //ternary operator to check if the path is active
                        className={
                            location.pathname.startsWith(item.path)
                                ? 'side-nav__item active'
                                : 'side-nav__item'
                        }
                    >
                        <Link to={item.path} className="side-nav__link">
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default SideNavBar;