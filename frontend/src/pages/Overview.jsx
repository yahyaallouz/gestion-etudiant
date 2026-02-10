import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import {
    TrendingUp, Users, BookOpen, Clock, AlertTriangle, GraduationCap, Calendar, Activity, UserPlus
} from "lucide-react";

const StatCard = ({ title, value, subtext, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay }}
        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
    >
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>
        <div>
            <h3 className="text-slate-500 font-medium text-sm mb-1">{title}</h3>
            <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
            <p className="text-slate-400 text-xs">{subtext}</p>
        </div>
    </motion.div>
);

const Overview = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/dashboard.php`);
                setStats(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const isStudent = user.role === 'student';

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold font-display text-slate-900">
                        {isStudent ? 'My Performance' : 'Academy Overview'}
                    </h2>
                    <p className="text-slate-500 mt-1">Here's what's happening today.</p>
                </div>
                <div className="text-sm text-slate-400 font-medium">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isStudent ? (
                    <>
                        <StatCard
                            title="Average Grade"
                            value={stats?.average_grade || "N/A"}
                            subtext="Across all subjects"
                            icon={GraduationCap}
                            color="bg-purple-600"
                            delay={0.1}
                        />
                        <StatCard
                            title="Total Exams"
                            value={stats?.total_exams || 0}
                            subtext="Completed assessments"
                            icon={BookOpen}
                            color="bg-blue-600"
                            delay={0.2}
                        />
                        <StatCard
                            title="Absences"
                            value={stats?.total_absences || 0}
                            subtext="Total missed classes"
                            icon={AlertTriangle}
                            color="bg-orange-500"
                            delay={0.3}
                        />
                        <StatCard
                            title="Attendance"
                            value={stats?.total_absences == 0 ? "100%" : "95%"}
                            subtext="Overall presence"
                            icon={Clock}
                            color="bg-emerald-500"
                            delay={0.4}
                        />
                    </>
                ) : (
                    <>
                        <StatCard
                            title="Total Students"
                            value={stats?.total_students || 0}
                            subtext="Active learners"
                            icon={Users}
                            color="bg-indigo-600"
                            delay={0.1}
                        />
                        <StatCard
                            title="Class Average"
                            value={stats?.class_average || "N/A"}
                            subtext="Global performance"
                            icon={Activity}
                            color="bg-rose-500"
                            delay={0.2}
                        />
                        <StatCard
                            title="New Enrolls"
                            value={stats?.recent_users?.length || 0}
                            subtext="This month"
                            icon={UserPlus}
                            color="bg-cyan-500"
                            delay={0.3}
                        />
                        <StatCard
                            title="Active Courses"
                            value="12"
                            subtext="Currently running"
                            icon={BookOpen}
                            color="bg-amber-500"
                            delay={0.4}
                        />
                    </>
                )}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Performance Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800">
                            {isStudent ? 'Grade History' : 'Subject Performance'}
                        </h3>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            {isStudent ? (
                                <AreaChart data={stats?.recent_grades || []}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="subject" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 20]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                                </AreaChart>
                            ) : (
                                <BarChart data={stats?.subject_performance || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="subject" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                    <Bar dataKey="avg_score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity / Users */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6">
                        {isStudent ? 'Recent Grades' : 'New Users'}
                    </h3>
                    <div className="space-y-6">
                        {isStudent ? (
                            stats?.recent_grades?.length > 0 ? (
                                stats.recent_grades.slice(0, 5).map((grade, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                            {Number(grade.score).toFixed(1)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{grade.subject}</div>
                                            <div className="text-xs text-slate-400">New grade posted</div>
                                        </div>
                                        <div className="ml-auto text-xs text-slate-400">
                                            {new Date(grade.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            ) : <p className="text-slate-500 text-sm">No recent grades found.</p>
                        ) : (
                            stats?.recent_users?.length > 0 ? (
                                stats.recent_users.map((u, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 uppercase">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{u.name}</div>
                                            <div className="text-xs text-slate-400 capitalize">{u.role} joined</div>
                                        </div>
                                    </div>
                                ))
                            ) : <p className="text-slate-500 text-sm">No recent activity.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
