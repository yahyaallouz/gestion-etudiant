import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { Calendar, UserX, AlertCircle } from 'lucide-react';

const Absences = () => {
    const { user } = useAuth();
    const [absences, setAbsences] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form
    const [selectedStudent, setSelectedStudent] = useState('');
    const [course, setCourse] = useState('');
    const [date, setDate] = useState('');
    const [status, setStatus] = useState('absent');

    const isTeacher = user.role !== 'student';

    useEffect(() => {
        fetchAbsences();
        if (isTeacher) fetchStudents();
    }, []);

    const fetchAbsences = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/absences.php`);
            setAbsences(response.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/users.php?role=student`);
            setStudents(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/absences.php`, {
                student_id: selectedStudent,
                course_name: course,
                date,
                status
            });
            setShowAddForm(false);
            fetchAbsences();
        } catch (error) {
            alert('Error adding absence');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Attendance & Absences</h2>
                    <p className="text-slate-500">Track student attendance</p>
                </div>
                {isTeacher && (
                    <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary py-2 px-4">
                        <AlertCircle className="w-5 h-5" />
                        Record Absence
                    </button>
                )}
            </div>

            {showAddForm && (
                <div className="card mb-6 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-slate-800 mb-4">Record New Absence</h3>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Student</label>
                            <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} required className="input-field">
                                <option value="">Select...</option>
                                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Course</label>
                            <input type="text" value={course} onChange={e => setCourse(e.target.value)} required className="input-field" placeholder="Chemistry" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value)} className="input-field">
                                <option value="absent">Absent</option>
                                <option value="late">Late</option>
                                <option value="excused">Excused</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-primary bg-red-600 hover:bg-red-700">Save</button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-600">Student</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Course</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {absences.map(ab => (
                            <tr key={ab.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{ab.student_name}</td>
                                <td className="px-6 py-4 text-slate-600">{new Date(ab.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-slate-600">{ab.course_name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${ab.status === 'absent' ? 'bg-red-100 text-red-700' :
                                            ab.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-green-100 text-green-700'
                                        }`}>
                                        {ab.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {absences.length === 0 && !loading && (
                            <tr><td colSpan="4" className="p-8 text-center text-slate-500">No absences recorded.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Absences;
