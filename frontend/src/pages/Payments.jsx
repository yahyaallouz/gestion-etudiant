import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { CreditCard, DollarSign } from 'lucide-react';

const Payments = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [students, setStudents] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form
    const [selectedStudent, setSelectedStudent] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const isAdmin = user.role === 'admin';

    useEffect(() => {
        fetchPayments();
        if (isAdmin) fetchStudents();
    }, []);

    const fetchPayments = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/payments.php`);
            setPayments(response.data);
        } catch (error) { console.error(error); }
    };

    const fetchStudents = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/users.php?role=student`);
            setStudents(response.data);
        } catch (error) { console.error(error); }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/payments.php`, {
                student_id: selectedStudent,
                amount,
                payment_date: new Date().toISOString().split('T')[0],
                status: 'paid', // Simple add payment
                description
            });
            setShowAddForm(false);
            fetchPayments();
        } catch (error) { alert('Error adding payment'); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Financials</h2>
                    <p className="text-slate-500">Payment history and status</p>
                </div>
                {isAdmin && (
                    <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary py-2 px-4">
                        <DollarSign className="w-5 h-5" />
                        New Payment
                    </button>
                )}
            </div>

            {showAddForm && (
                <div className="card mb-6 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-slate-800 mb-4">Record Payment</h3>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Student</label>
                            <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} required className="input-field">
                                <option value="">Select...</option>
                                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required className="input-field" placeholder="100.00" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} required className="input-field" placeholder="Tuition Fee" />
                        </div>
                        <button type="submit" className="btn-primary bg-green-600 hover:bg-green-700">Record</button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-600">ID</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Student</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Amount</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {payments.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-slate-400">#{p.id}</td>
                                <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                                <td className="px-6 py-4 font-mono font-medium text-slate-700">${p.amount}</td>
                                <td className="px-6 py-4 text-slate-600">{new Date(p.payment_date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-700">
                                        {p.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Payments;
