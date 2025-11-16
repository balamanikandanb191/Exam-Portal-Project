// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Context ah create panrom
export const AuthContext = createContext(null);

// 2. Provider component ah create panrom
export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(localStorage.getItem('role'));
    const navigate = useNavigate();

    // Indha function, localStorage ah check panni, state ah update pannum
    const checkAuthStatus = () => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const name = localStorage.getItem('name');

        if (token && role && name) {
            setIsLoggedIn(true);
            setRole(role);
            setUser({ name, role }); // User object ah set panrom
        } else {
            setIsLoggedIn(false);
            setUser(null);
            setRole(null);
        }
    };

    // App load aagum bodhu, login status ah check pannu
    useEffect(() => {
        checkAuthStatus();
        
        // Unga Login.jsx file 'storage' nu oru event ah fire pannudhu.
        // Adha inga listen panni, login aana udane state update pannikalam.
        window.addEventListener('storage', checkAuthStatus);

        // Cleanup
        return () => {
            window.removeEventListener('storage', checkAuthStatus);
        };
    }, []); // Oru thadava run aana podhum

    // Navbar la use panrathukku, oru logout function
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('name');
        
        // 'storage' event ah fire pannu, appo ella component um update aagidum
        window.dispatchEvent(new Event('storage')); 
        
        navigate('/login'); // Logout aana login page ku po
    };

    // Ellathayum provider moolama pass pannu
    return (
        <AuthContext.Provider value={{ isLoggedIn, user, role, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Oru custom hook (easy ah use panna)
export const useAuth = () => {
    return useContext(AuthContext);
};