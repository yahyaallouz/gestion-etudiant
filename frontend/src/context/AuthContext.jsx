import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    // Configure global Axios headers
    if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    useEffect(() => {
        // Check if user is stored in local storage to persist session
        const storedUser = localStorage.getItem("user");
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, [token]);

    const login = (userData, newToken) => {
        setUser(userData);
        setToken(newToken);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", newToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
