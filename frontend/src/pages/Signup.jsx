import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { API_BASE_URL } from "../config";
import axios from "axios";
import { motion } from "framer-motion";
import { UserPlus, User, Mail, Lock, ArrowRight, BookOpen } from "lucide-react";

const Signup = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "teacher", // Enforce Teacher registration
    });
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate(); // Hook for redirection

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setIsLoading(true);
        try {
            // Updated backend URL
            const response = await axios.post(`${API_BASE_URL}/auth.php?action=signup`, formData);
            if (response.data.message) {
                setMessage("Signup successful! Redirecting to login...");
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || "Error signing up");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 relative overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 -mt-20 -ml-20 w-80 h-80 bg-primary-400 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 -mb-20 -mr-20 w-80 h-80 bg-secondary-400 rounded-full blur-[100px] opacity-20 animate-pulse delay-1000"></div>

            {/* Right Side - Hero/Visuals (Order Swapped for visual balance vs Login) */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden order-2 text-right"
            >
                <div className="absolute inset-0 bg-gradient-to-bl from-secondary-900 to-primary-900 opacity-90"></div>
                <div className="relative z-10 text-white max-w-lg items-end flex flex-col">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-glow">
                        <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold font-display leading-tight mb-6">
                        Join <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary-300 to-secondary-300">the Community</span>
                    </h1>
                    <p className="text-lg text-slate-300 leading-relaxed mb-8">
                        Sign up today to start managing your academic journey. Connect with teachers, track your progress, and excel.
                    </p>
                    <div className="flex gap-4 p-4 bg-white/5 backdrop-blur rounded-2xl border border-white/10 w-fit">
                        <div>
                            <div className="text-2xl font-bold text-white">100%</div>
                            <div className="text-xs text-slate-400 text-right">Secure</div>
                        </div>
                        <div className="w-px bg-white/10"></div>
                        <div>
                            <div className="text-2xl font-bold text-white">24/7</div>
                            <div className="text-xs text-slate-400 text-right">Access</div>
                        </div>
                    </div>
                </div>
                {/* Abstract Shapes */}
                <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none rotate-180">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="url(#gradient)" />
                    </svg>
                </div>
            </motion.div>

            {/* Left Side - Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10 order-1">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold font-display text-slate-900 mb-2">Create Account</h2>
                        <p className="text-slate-500">Get started with your free account.</p>
                    </div>

                    {message && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className={`mb-6 p-4 border-l-4 text-sm rounded-r-lg flex items-center gap-3 ${message.includes('successful')
                                ? 'bg-green-50 border-green-500 text-green-700'
                                : 'bg-red-50 border-red-500 text-red-600'
                                }`}
                        >
                            <span className="font-bold">{message.includes('successful') ? 'Success:' : 'Error:'}</span> {message}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-200"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-200"
                                    placeholder="john.doe@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-200"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                            {!isLoading && <ArrowRight className="w-5 h-5" />}
                        </motion.button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500">
                        Already have an account? <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 ml-1">Sign In</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Signup;
