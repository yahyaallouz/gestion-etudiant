import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Award, Search } from 'lucide-react';

const Grades = () => {
    const { user } = useAuth();
    const [grades, setGrades] = useState([]);
    const [students, setStudents] = useState([]); // For selecting student
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Form
    const [selectedStudent, setSelectedStudent] = useState('');
    const [subject, setSubject] = useState('');
    const [score, setScore] = useState('');
    const [message, setMessage] = useState('');

    const isTeacher = user.role === 'teacher' || user.role === 'admin';

    useEffect(() => {
        fetchGrades();
        if (isTeacher) {
            fetchStudents();
        }
    }, []);

    const fetchGrades = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/grades.php`);
            setGrades(response.data);
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

    const handleAddGrade = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await axios.post(`${API_BASE_URL}/grades.php`, {
                student_id: selectedStudent,
                subject,
                score
            });
            setMessage('Grade added!');
            setSubject('');
            setScore('');
            fetchGrades();
        } catch (error) {
            setMessage('Error adding grade');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/grades.php`, { data: { id } });
            fetchGrades();
        } catch (error) {
            alert('Error deleting grade');
        }
    };

    // Filter grades based on search term (Subject or Student Name)
    const filteredGrades = grades.filter(grade =>
        grade.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (grade.student_name && grade.student_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Student Grades</h2>
                    <p className="text-slate-500">{isTeacher ? 'Manage and assign grades' : 'Your academic performance'}</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder={isTeacher ? "Search student or subject..." : "Search subject..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all text-sm"
                        />
                    </div>

                    {isTeacher && (
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-primary-500/30 whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" />
                            Add Grade
                        </button>
                    )}
                </div>
            </div>

            {message && (
                <div className="p-4 mb-4 rounded-lg bg-green-50 text-green-600">
                    {message}
                </div>
            )}

            {showAddForm && isTeacher && (
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm mb-6 animate-in slide-in-from-top-4 fade-in">
                    <h3 className="font-bold text-slate-800 mb-4">Assign New Grade</h3>
                    <form onSubmit={handleAddGrade} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Student</label>
                            <select
                                value={selectedStudent}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                                required
                                className="input-field"
                            >
                                <option value="">Select Student...</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required className="input-field" placeholder="e.g. Mathematics" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Score (/20)</label>
                            <input type="number" step="0.01" max="20" value={score} onChange={(e) => setScore(e.target.value)} required className="input-field" placeholder="15.5" />
                        </div>
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors h-[42px]">
                            Save Grade
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-600">Student</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Subject</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Score</th>
                            {isTeacher && <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredGrades.length > 0 ? (
                            filteredGrades.map(grade => (
                                <tr key={grade.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                                                <Award className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900">{grade.student_name || 'My Grade'}</span>
                                                <span className="text-xs text-slate-400">Teacher: {grade.teacher_name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">{grade.subject}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${grade.score >= 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {grade.score} / 20
                                        </span>
                                    </td>
                                    {isTeacher && (
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(grade.id)}
                                                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={isTeacher ? 4 : 3} className="px-6 py-8 text-center text-slate-500">
                                    No grades found matching "{searchTerm}".
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Grades;
