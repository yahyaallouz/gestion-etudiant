import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Mail, Lock, ArrowRight, Shield, GraduationCap, Users } from "lucide-react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student"); // Default role
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const roles = [
        { id: "admin", label: "Admin", icon: Shield, color: "bg-purple-600", light: "bg-purple-50", text: "text-purple-600", ring: "focus:ring-purple-500", border: "focus:border-purple-500" },
        { id: "teacher", label: "Teacher", icon: Users, color: "bg-indigo-600", light: "bg-indigo-50", text: "text-indigo-600", ring: "focus:ring-indigo-500", border: "focus:border-indigo-500" },
        { id: "student", label: "Student", icon: GraduationCap, color: "bg-emerald-600", light: "bg-emerald-50", text: "text-emerald-600", ring: "focus:ring-emerald-500", border: "focus:border-emerald-500" },
    ];

    const currentRole = roles.find(r => r.id === role);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/auth.php?action=login`, {
                email,
                password,
            });
            if (response.data.token) {
                // Strict Role Check (Optional: Allow auto-redirect? User asked for strict choice)
                if (response.data.user.role !== role) {
                    setError(`Access Denied. You are not registered as a ${currentRole.label}. Please switch tabs.`);
                    setIsLoading(false);
                    return;
                }

                login(response.data.user, response.data.token);
                navigate("/dashboard");
            }
        } catch (err) {
            console.error(err);
            let errorMsg = "Login failed.";
            if (err.response) {
                // Server responded with a status code
                if (typeof err.response.data === 'object' && err.response.data.message) {
                    errorMsg = err.response.data.message;
                } else {
                    // Likely HTML or raw text (hosting error/security check)
                    errorMsg = `Server blocked request. Status: ${err.response.status}. Data: ${JSON.stringify(err.response.data).substring(0, 50)}...`;
                }
            } else if (err.request) {
                // Network error (CORS, SSL, etc)
                errorMsg = "Network Error. Check internet or SSL.";
            } else {
                errorMsg = err.message;
            }
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 relative overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className={`absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 rounded-full blur-[100px] opacity-20 animate-pulse transition-colors duration-500 ${currentRole.color}`}></div>
            <div className={`absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 rounded-full blur-[100px] opacity-20 animate-pulse delay-1000 transition-colors duration-500 ${currentRole.color}`}></div>

            {/* Left Side - Hero/Visuals */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-90"></div>
                <div className={`absolute inset-0 bg-gradient-to-br opacity-40 mix-blend-overlay transition-colors duration-700 ${role === 'admin' ? 'from-purple-900' : role === 'teacher' ? 'from-indigo-900' : 'from-emerald-900'}`}></div>

                <div className="relative z-10 text-white max-w-lg">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={role}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-glow">
                                <currentRole.icon className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-5xl font-bold font-display leading-tight mb-6">
                                Portal <span className={`text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400`}>{currentRole.label}</span>
                            </h1>
                            <p className="text-lg text-slate-300 leading-relaxed mb-8">
                                {role === 'admin' && "Manage the entire institution, students, and faculty with ease."}
                                {role === 'teacher' && "Track student performance, manage grades, and organize your classes."}
                                {role === 'student' && "Access your grades, check your schedule, and stay on top of your studies."}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-bold font-display text-slate-900 mb-2">Sign In</h2>
                        <p className="text-slate-500">Select your role and enter your details.</p>
                    </div>

                    {/* Role Tabs */}
                    <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
                        {roles.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => setRole(r.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${role === r.id
                                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                    }`}
                            >
                                <r.icon className={`w-4 h-4 ${role === r.id ? r.text : ''}`} />
                                {r.label}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 text-sm rounded-r-lg flex items-center gap-3"
                        >
                            <span className="font-bold">Error:</span> {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                            <div className="relative group">
                                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:${currentRole.text} transition-colors`} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 ${currentRole.ring} ${currentRole.border} outline-none transition-all duration-200`}
                                    placeholder="name@school.com"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-slate-700">Password</label>
                                <a href="#" className={`text-xs font-semibold ${currentRole.text} hover:opacity-80`}>Forgot password?</a>
                            </div>
                            <div className="relative group">
                                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:${currentRole.text} transition-colors`} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 ${currentRole.ring} ${currentRole.border} outline-none transition-all duration-200`}
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={isLoading}
                            className={`w-full ${currentRole.color} hover:opacity-90 text-white font-semibold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                            {!isLoading && <ArrowRight className="w-5 h-5" />}
                        </motion.button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500">
                        Don't have an account?
                        {role === 'student' || role === 'admin' ? (
                            <span className="text-slate-400 ml-1 cursor-not-allowed" title="Restricted Access">
                                {role === 'student' ? 'Contact Admin' : 'Restricted Access'}
                            </span>
                        ) : (
                            <Link to="/signup" className={`font-semibold ml-1 hover:underline ${currentRole.text}`}>Create account</Link>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
