import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { LogOut, Users, GraduationCap, Grid, Settings, AlertCircle, DollarSign, Calendar, Menu, Bell, Search, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifs, setShowNotifs] = useState(false);
    const notifRef = useRef(null);

    // Broadcast State
    const [showBroadcast, setShowBroadcast] = useState(false);
    const [broadcastMsg, setBroadcastMsg] = useState("");

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/dashboard', icon: Grid, label: 'Dashboard', roles: ['admin', 'teacher', 'student'] },
        { path: '/dashboard/students', icon: Users, label: 'Students', roles: ['admin'] },
        { path: '/dashboard/grades', icon: GraduationCap, label: 'Grades', roles: ['admin', 'teacher', 'student'] },
        { path: '/dashboard/absences', icon: AlertCircle, label: 'Absences', roles: ['admin', 'teacher', 'student'] },
        { path: '/dashboard/payments', icon: DollarSign, label: 'Payments', roles: ['admin', 'teacher', 'student'] },
        { path: '/dashboard/planning', icon: Calendar, label: 'Planning', roles: ['admin', 'teacher', 'student'] },
        { path: '/dashboard/settings', icon: Settings, label: 'Settings', roles: ['admin', 'teacher', 'student'] },
    ];

    const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

    // Notification Logic
    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/notifications.php`);
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unread_count);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // 30s poll
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async () => {
        if (unreadCount > 0) {
            await axios.post(`${API_BASE_URL}/notifications.php`, { action: 'mark_read' });
            // Optimistic update
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        }
    };

    const toggleNotifs = () => {
        if (!showNotifs) markAsRead();
        setShowNotifs(!showNotifs);
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/notifications.php`, {
                action: 'send',
                message: broadcastMsg
            });
            setShowBroadcast(false);
            setBroadcastMsg("");
            alert("Notification sent to all students!");
        } catch (error) {
            alert("Failed to send notification.");
        }
    };

    // Close click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifs(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [notifRef]);


    // Mobile Menu State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden relative">
            {/* Background ambiances */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary-50 to-slate-50 opacity-50 z-0 pointer-events-none"></div>

            {/* Mobile Sidebar Overlay & Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 lg:hidden shadow-2xl flex flex-col overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                                            <GraduationCap className="text-white w-6 h-6" />
                                        </div>
                                        <span className="font-bold text-xl text-slate-800 tracking-tight font-display">GestionETD</span>
                                    </div>
                                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    {filteredNavItems.map((item) => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive(item.path)
                                                ? 'text-primary-700 bg-primary-50/50'
                                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                                }`}
                                        >
                                            <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-primary-600' : 'text-slate-400'}`} />
                                            <span>{item.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto p-6 border-t border-slate-100">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Sign Out
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <aside className="w-72 hidden lg:flex flex-col h-[calc(100vh-2rem)] m-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl z-20 relative">
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <GraduationCap className="text-white w-6 h-6" />
                        </div>
                        <span className="font-bold text-xl text-slate-800 tracking-tight font-display">GestionETD</span>
                    </div>

                    <div className="space-y-1">
                        {filteredNavItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group overflow-hidden ${isActive(item.path)
                                    ? 'text-primary-700 bg-primary-50/50 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                {isActive(item.path) && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r-full"
                                    />
                                )}
                                <item.icon className={`w-5 h-5 transition-colors ${isActive(item.path) ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="mt-auto p-4 border-t border-slate-100/50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-y-auto relative z-10 scroll-smooth">
                {/* Header */}
                <header className="sticky top-0 z-30 px-8 py-4 backdrop-blur-md bg-white/50 border-b border-white/40 flex justify-between items-center transition-all">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex flex-col">
                            <h1 className="text-xl md:text-2xl font-bold font-display text-slate-900">Dashboard</h1>
                            <p className="text-sm text-slate-500 hidden md:block">Welcome back, {user.name} 👋</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 bg-white/50 border border-slate-200 rounded-full text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none w-64 transition-all"
                            />
                        </div>

                        {/* Broadcast Button (Admin/Teacher) */}
                        {(user.role === 'admin' || user.role === 'teacher') && (
                            <button
                                onClick={() => setShowBroadcast(true)}
                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                                title="Send Notification to Students"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        )}

                        {/* Notification Bell */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={toggleNotifs}
                                className="relative p-2 text-slate-500 hover:text-primary-600 transition-colors rounded-full hover:bg-primary-50 focus:outline-none"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifs && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="fixed top-20 left-4 right-4 md:absolute md:right-0 md:top-full md:left-auto md:w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 origin-top-right ring-1 ring-black ring-opacity-5"
                                    >
                                        <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center">
                                            <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                                            <span className="text-xs text-slate-400">{unreadCount} new</span>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {notifications && notifications.length > 0 ? (
                                                notifications.map(notif => (
                                                    <div key={notif.id} className={`px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${!notif.is_read ? 'bg-primary-50/30' : ''}`}>
                                                        <p className="text-sm text-slate-800 leading-snug">{notif.message}</p>
                                                        <span className="text-xs text-slate-400 mt-1 block">{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-8 text-center text-slate-400 text-sm flex flex-col items-center">
                                                    <Bell className="w-8 h-8 opacity-20 mb-2" />
                                                    No new notifications
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                                <div className="text-xs text-slate-500 capitalize">{user.role}</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 p-0.5 shadow-md shadow-primary-500/20">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-primary-700 font-bold text-lg">
                                    {user.name.charAt(0)}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 pb-20">
                    <Outlet />
                </div>
            </main>

            {/* Broadcast Modal */}
            <AnimatePresence>
                {showBroadcast && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-900">Send Notification</h3>
                                <button onClick={() => setShowBroadcast(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">This message will be sent to ALL students.</p>
                            <form onSubmit={handleBroadcast}>
                                <textarea
                                    className="input-field min-h-[100px] mb-4 resize-none"
                                    placeholder="Type your message here..."
                                    value={broadcastMsg}
                                    onChange={(e) => setBroadcastMsg(e.target.value)}
                                    required
                                ></textarea>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowBroadcast(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 shadow-lg shadow-primary-500/30"
                                    >
                                        Send Message
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
