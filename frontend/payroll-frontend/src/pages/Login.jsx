import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";

function Login() {
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("employee");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!email || !password) {
            alert("Please fill all fields");
            return;
        }

        try {
            setLoading(true);

            if (isSignup) {
                // SIGNUP
                await axios.post("http://127.0.0.1:8000/auth/signup", {
                    email,
                    password,
                    role,
                });

                alert("Signup successful! Please login.");
                setIsSignup(false);
            } else {
                // LOGIN
                const res = await axios.post(`${API_BASE_URL}/auth/login`,
                    {
                        email,
                        password,
                    }
                );

                // 🔐 STORE SESSION DATA
                sessionStorage.setItem("token", res.data.access_token);
                sessionStorage.setItem("role", res.data.role);
                sessionStorage.setItem("email", email);
                

                navigate(res.data.role === "admin" ? "/admin" : "/dashboard");
            }
        } catch (err) {
            alert(
                err.response?.data?.detail ||
                "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 via-blue-600 to-purple-600 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                {/* HEADER */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-indigo-600">
                        Payroll System
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {isSignup
                            ? "Create your account"
                            : "Sign in to continue"}
                    </p>
                </div>

                {/* EMAIL */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Email Address
                    </label>
                    <input
                        type="email"
                        placeholder="employee@test.com"
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* PASSWORD */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {/* ROLE (ONLY FOR SIGNUP) */}
                {isSignup && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Role
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="employee">Employee</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                )}

                {/* BUTTON */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold transition disabled:opacity-60"
                >
                    {loading
                        ? "Please wait..."
                        : isSignup
                            ? "Create Account"
                            : "Login"}
                </button>

                {/* TOGGLE */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    {isSignup ? "Already have an account?" : "New here?"}{" "}
                    <button
                        onClick={() => setIsSignup(!isSignup)}
                        className="text-indigo-600 font-semibold hover:underline"
                    >
                        {isSignup ? "Login" : "Create account"}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Login;
