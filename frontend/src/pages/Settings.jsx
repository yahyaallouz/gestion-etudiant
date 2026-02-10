import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, User, Lock, Bell } from 'lucide-react';

const Settings = () => {
    const { user } = useAuth();
    const [name, setName] = useState(user.name);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSave = (e) => {
        e.preventDefault();
        // Mock save
        alert('Settings saved successfully!');
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">Account Settings</h2>
                <p className="text-slate-500">Manage your profile and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Section */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4 pb-2 border-b border-slate-50">
                            <User className="w-5 h-5 text-primary-500" />
                            Profile Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email (Read Only)</label>
                                <input type="email" value={user.email} disabled className="input-field bg-slate-50 text-slate-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                <input type="text" value={user.role} disabled className="input-field bg-slate-50 text-slate-500 uppercase" />
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4 pb-2 border-b border-slate-50">
                            <Lock className="w-5 h-5 text-primary-500" />
                            Security
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="New Password" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" placeholder="Confirm Password" />
                            </div>
                        </div>
                    </div>

                    <button onClick={handleSave} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-primary-500/30">
                        <Save className="w-5 h-5" />
                        Save Changes
                    </button>
                </div>

                <div>
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">
                            <Bell className="w-4 h-4" />
                            Notifications
                        </h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
                                <span className="text-slate-700 font-medium">Email Notifications</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
                                <span className="text-slate-700 font-medium">Security Alerts</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
