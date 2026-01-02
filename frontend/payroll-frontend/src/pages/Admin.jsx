import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function Admin() {
    const [employees, setEmployees] = useState([]);
    const [userId, setUserId] = useState("");
    const [month, setMonth] = useState("");
    const [amount, setAmount] = useState("");

    const adminEmail = sessionStorage.getItem("email");

    const headers = {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await axios.get(
                "http://127.0.0.1:8000/admin/employees",
                { headers }
            );
            setEmployees(res.data);
        } catch {
            toast.error("Failed to load employees");
        }
    };

    const createSalarySlip = async () => {
        if (!userId || !month || !amount) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            await axios.post(
                "http://127.0.0.1:8000/salary-slip",
                {
                    user_id: Number(userId),
                    month,
                    amount: Number(amount),
                },
                { headers }
            );

            toast.success("Salary slip created");
            setUserId("");
            setMonth("");
            setAmount("");
        } catch {
            toast.error("Failed to create salary slip");
        }
    };

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
                    <p className="text-sm text-gray-500">Admin Dashboard</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">{adminEmail}</p>
                        <p className="text-xs text-gray-500">Administrator</p>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                        {adminEmail?.charAt(0).toUpperCase()}
                    </div>

                    <button
                        onClick={logout}
                        className="text-sm text-red-600 hover:underline ml-4"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* MAIN */}
            <div className="max-w-7xl mx-auto p-8">
                {/* CREATE SALARY SLIP */}
                <div className="bg-white p-8 rounded-2xl shadow mb-10 max-w-xl">
                    <h3 className="text-lg font-semibold mb-6">
                        Create Salary Slip
                    </h3>

                    <label className="block text-sm text-gray-600 mb-1">
                        Select Employee
                    </label>
                    <select
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full border rounded-lg px-4 py-2 mb-4"
                    >
                        <option value="">-- Select Employee --</option>
                        {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.email} (ID: {emp.id})
                            </option>
                        ))}
                    </select>

                    <label className="block text-sm text-gray-600 mb-1">
                        Month
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. March 2025"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-full border rounded-lg px-4 py-2 mb-4"
                    />

                    <label className="block text-sm text-gray-600 mb-1">
                        Salary Amount
                    </label>
                    <input
                        type="number"
                        placeholder="Enter salary amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full border rounded-lg px-4 py-2 mb-6"
                    />

                    <button
                        onClick={createSalarySlip}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold"
                    >
                        Create Salary Slip
                    </button>
                </div>

                {/* EMPLOYEE LIST */}
                <div className="bg-white p-6 rounded-2xl shadow">
                    <h3 className="font-semibold mb-4 text-gray-700">
                        Employee Accounts
                    </h3>

                    <table className="w-full text-sm border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2 text-left">ID</th>
                                <th className="border p-2 text-left">Email</th>
                                <th className="border p-2 text-left">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp.id}>
                                    <td className="border p-2">{emp.id}</td>
                                    <td className="border p-2">{emp.email}</td>
                                    <td className="border p-2 capitalize">{emp.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Admin;
