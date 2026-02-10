import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, BookOpen } from 'lucide-react';

const Planning = () => {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form
    const [className, setClassName] = useState('');
    const [subject, setSubject] = useState('');
    const [day, setDay] = useState('Monday');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const isAdmin = user.role === 'admin';

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/planning.php`);
            setSchedule(response.data);
            setLoading(false);
        } catch (error) { console.error(error); }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/planning.php`, {
                class_name: className,
                subject,
                day_of_week: day,
                start_time: startTime,
                end_time: endTime,
                teacher_id: user.id // Assign to self if admin/teacher creates it, simplistic logic
            });
            setShowAddForm(false);
            fetchSchedule();
        } catch (error) { alert('Error adding class'); }
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Weekly Schedule</h2>
                    <p className="text-slate-500">Class timings and planning</p>
                </div>
                {isAdmin && (
                    <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary py-2 px-4 w-full md:w-auto">
                        <Calendar className="w-5 h-5" />
                        Add Class
                    </button>
                )}
            </div>

            {showAddForm && (
                <div className="card mb-6 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-slate-800 mb-4">Add Class Session</h3>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required className="input-field" placeholder="Algorithms" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Day</label>
                            <select value={day} onChange={e => setDay(e.target.value)} className="input-field">
                                {days.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Start</label>
                            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">End</label>
                            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required className="input-field" />
                        </div>
                        <button type="submit" className="btn-primary bg-indigo-600 hover:bg-indigo-700">Add</button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {days.map(d => {
                    const dayClasses = schedule.filter(s => s.day_of_week === d);
                    return (
                        <div key={d} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 h-full">
                            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                                {d}
                            </h3>
                            {dayClasses.length === 0 ? (
                                <p className="text-slate-400 text-sm italic">No classes scheduled</p>
                            ) : (
                                <div className="space-y-3">
                                    {dayClasses.map(c => (
                                        <div key={c.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 hover:shadow-sm transition-shadow">
                                            <div className="font-bold text-slate-700">{c.subject}</div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                <Clock className="w-3 h-3" />
                                                {c.start_time.slice(0, 5)} - {c.end_time.slice(0, 5)}
                                            </div>
                                            {c.teacher_name && (
                                                <div className="text-xs text-slate-400 mt-1">Prof. {c.teacher_name}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Planning;
