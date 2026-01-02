import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import API_BASE_URL from "../api";

function Admin() {
    const [employees, setEmployees] = useState([]);
    const [userId, setUserId] = useState("");
    const [month, setMonth] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const adminEmail = sessionStorage.getItem("email");

    const headers = {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // ================= FETCH EMPLOYEES =================
    const fetchEmployees = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/admin/employees`, {
                headers,
            });
            setEmployees(res.data);
        } catch {
            toast.error("Failed to load employees");
        }
    };

    // ================= CREATE SALARY SLIP =================
    const createSalarySlip = async () => {
        if (!userId || !month || !amount) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            setLoading(true);

            await axios.post(
                `${API_BASE_URL}/salary-slip`,
                {
                    user_id: Number(userId),
                    month, // format: YYYY-MM
                    amount: Number(amount),
                },
                { headers }
            );

            toast.success("Salary slip created successfully");
            setUserId("");
            setMonth("");
            setAmount("");
        } catch (err) {
            toast.error(
                err.response?.data?.detail || "Failed to create salary slip"
            );
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        sessionStorage.clear();
        window.location.href = "/";
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* ================= NAVBAR ================= */}
            <div className="bg-white border-b shadow-sm px-4 sm:px-8 py-4 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-indigo-600">
                        Payroll Management System
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500">
                        Admin Dashboard
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-700">
                            {adminEmail}
                        </p>
                        <p className="text-xs text-gray-500">Administrator</p>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                        {adminEmail?.charAt(0).toUpperCase()}
                    </div>

                    <button
                        onClick={logout}
                        className="text-sm text-red-600 hover:underline"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* ================= MAIN ================= */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ================= CREATE SALARY SLIP ================= */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow">
                    <h3 className="text-lg font-semibold mb-6">
                        Create Salary Slip
                    </h3>

                    {/* Employee */}
                    <label className="block text-sm text-gray-600 mb-1">
                        Select Employee
                    </label>
                    <select
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full border rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">-- Select Employee --</option>
                        {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.email} (ID: {emp.id})
                            </option>
                        ))}
                    </select>

                    {/* Month Picker ✅ */}
                    <label className="block text-sm text-gray-600 mb-1">
                        Salary Month
                    </label>
                    <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-full border rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-indigo-500"
                    />

                    {/* Amount */}
                    <label className="block text-sm text-gray-600 mb-1">
                        Salary Amount
                    </label>
                    <input
                        type="number"
                        placeholder="Enter salary amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full border rounded-lg px-4 py-2 mb-6 focus:ring-2 focus:ring-indigo-500"
                    />

                    <button
                        onClick={createSalarySlip}
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-60"
                    >
                        {loading ? "Creating..." : "Create Salary Slip"}
                    </button>
                </div>

                {/* ================= EMPLOYEE LIST ================= */}
                <div className="bg-white p-6 rounded-2xl shadow lg:col-span-2">
                    <h3 className="font-semibold mb-4 text-gray-700">
                        Employee Accounts
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2 text-left">ID</th>
                                    <th className="border p-2 text-left">Email</th>
                                    <th className="border p-2 text-left">Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50">
                                        <td className="border p-2">{emp.id}</td>
                                        <td className="border p-2">{emp.email}</td>
                                        <td className="border p-2 capitalize">
                                            {emp.role}
                                        </td>
                                    </tr>
                                ))}
                                {employees.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="3"
                                            className="border p-4 text-center text-gray-500"
                                        >
                                            No employees found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Admin;
