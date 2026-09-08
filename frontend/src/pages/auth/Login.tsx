import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const selectedRole = searchParams.get("role")?.toUpperCase() || "";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const getRoleName = (role: string) => {
        if (role === "PATIENT") return "Patient";
        if (role === "DOCTOR") return "Doctor";
        if (role === "ADMIN") return "Admin";
        return "";
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/auth/login?email=${encodeURIComponent(
                    email
                )}&password=${encodeURIComponent(password)}`,
                {
                    method: "POST",
                }
            );

            const data = await response.json().catch(() => null);

            // =========================
            // LOGIN FAILED
            // =========================

            if (!response.ok) {
                throw new Error(
                    typeof data === "string"
                        ? data
                        : data?.message || "Invalid email or password"
                );
            }

            // =========================
            // ROLE VALIDATION
            // =========================

            const actualRole = data.role?.toUpperCase();

            if (
                selectedRole &&
                selectedRole !== actualRole
            ) {
                throw new Error(
                    `This account is registered as ${getRoleName(
                        actualRole
                    )}. Please select ${getRoleName(
                        actualRole
                    )} from the home page.`
                );
            }

            // =========================
            // SAVE JWT TOKEN
            // =========================

            localStorage.setItem(
                "token",
                data.token
            );

            // =========================
            // SAVE USER INFORMATION
            // =========================

            const user = {
                id: data.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                role: actualRole,
            };

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            setMessage("Login successful!");

            // =========================
            // REDIRECT BASED ON ROLE
            // =========================

            setTimeout(() => {
                if (actualRole === "PATIENT") {
                    navigate("/patient/dashboard");
                } else if (actualRole === "DOCTOR") {
                    navigate("/doctor/dashboard");
                } else if (actualRole === "ADMIN") {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/");
                }
            }, 800);

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">

                {/* HEADER */}

                <h1 className="text-3xl font-bold text-center">
                    {selectedRole
                        ? `${getRoleName(selectedRole)} Login`
                        : "Login"}
                </h1>

                <p className="mt-2 text-gray-600 text-center">
                    Login to your MediFlow account.
                </p>

                {selectedRole && (
                    <div className="mt-4 text-center text-sm text-teal-600 font-medium">
                        Continuing as {getRoleName(selectedRole)}
                    </div>
                )}

                {/* FORM */}

                <form
                    onSubmit={handleLogin}
                    className="mt-8 space-y-4"
                >

                    {/* EMAIL */}

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                        className="w-full border p-3 rounded"
                    />

                    {/* PASSWORD */}

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                        className="w-full border p-3 rounded"
                    />

                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

                {/* SUCCESS */}

                {message && (
                    <p className="mt-4 text-center text-green-600">
                        {message}
                    </p>
                )}

                {/* ERROR */}

                {error && (
                    <p className="mt-4 text-center text-red-600">
                        {error}
                    </p>
                )}

                {/* BACK */}

                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="w-full mt-4 text-sm text-slate-500 hover:text-teal-600"
                >
                    ← Back to role selection
                </button>

            </div>
        </div>
    );
}

export default Login;