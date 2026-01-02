import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

function Dashboard() {
    const [salarySlips, setSalarySlips] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");

    const userEmail = sessionStorage.getItem("email");

    const headers = {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    };

    const fetchData = () => {
        axios
            .get("http://127.0.0.1:8000/salary-slip", { headers })
            .then((res) => setSalarySlips(res.data))
            .catch(() => toast.error("Failed to load salary slips"));

        axios
            .get("http://127.0.0.1:8000/expense", { headers })
            .then((res) => setExpenses(res.data))
            .catch(() => toast.error("Failed to load expenses"));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const submitExpense = async () => {
        if (!description || !amount) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            await axios.post(
                "http://127.0.0.1:8000/expense",
                { description, amount: Number(amount) },
                { headers }
            );

            toast.success("Expense submitted successfully");
            setDescription("");
            setAmount("");
            fetchData();
        } catch {
            toast.error("Failed to submit expense");
        }
    };

    const downloadPDF = async (slipId) => {
        try {
            const response = await axios.get(
                `http://127.0.0.1:8000/salary-slip/${slipId}/pdf`,
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                    responseType: "blob",
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `salary_slip_${slipId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error(error);
            toast.error("Failed to download PDF");
        }
    };


    const totalSalary = salarySlips.reduce((sum, s) => sum + s.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    const logout = () => {
        sessionStorage.clear();
        window.location.href = "/";
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* NAVBAR */}
            <div className="bg-white border-b shadow-sm px-8 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-indigo-600">
                        Payroll Management System
                    </h1>
                    <p className="text-sm text-gray-500">Employee Dashboard</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">{userEmail}</p>
                        <p className="text-xs text-gray-500">Employee</p>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                        {userEmail?.charAt(0).toUpperCase()}
                    </div>

                    <button
                        onClick={logout}
                        className="text-sm text-red-600 hover:underline ml-4"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="max-w-7xl mx-auto p-8">
                {/* KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <p className="text-sm text-gray-500">Total Salary</p>
                        <h3 className="text-2xl font-bold text-indigo-600">
                            ₹ {totalSalary}
                        </h3>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow">
                        <p className="text-sm text-gray-500">Total Expenses</p>
                        <h3 className="text-2xl font-bold text-red-500">
                            ₹ {totalExpense}
                        </h3>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow">
                        <p className="text-sm text-gray-500">Net Balance</p>
                        <h3 className="text-2xl font-bold text-green-600">
                            ₹ {totalSalary - totalExpense}
                        </h3>
                    </div>
                </div>

                {/* CHARTS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <h3 className="font-semibold mb-4">Salary History</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={salarySlips}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="amount" fill="#6366f1" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow">
                        <h3 className="font-semibold mb-4">Expense History</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={expenses}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="description" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="amount" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* SALARY TABLE WITH PDF */}
                <div className="bg-white p-6 rounded-2xl shadow mb-10">
                    <h3 className="font-semibold mb-4">Salary Slips</h3>
                    <table className="w-full text-sm border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">Month</th>
                                <th className="border p-2">Amount</th>
                                <th className="border p-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salarySlips.map((s) => (
                                <tr key={s.id}>
                                    <td className="border p-2">{s.month}</td>
                                    <td className="border p-2">₹ {s.amount}</td>
                                    <td className="border p-2 text-center">
                                        <button
                                            onClick={() => downloadPDF(s.id)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs"
                                        >
                                            Download PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* SUBMIT EXPENSE */}
                <div className="bg-white p-8 rounded-2xl shadow max-w-xl">
                    <h3 className="font-semibold mb-5">Submit Expense</h3>

                    <input
                        type="text"
                        placeholder="Expense description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border rounded-lg px-4 py-2 mb-4"
                    />

                    <input
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full border rounded-lg px-4 py-2 mb-6"
                    />

                    <button
                        onClick={submitExpense}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
                    >
                        Submit Expense
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
