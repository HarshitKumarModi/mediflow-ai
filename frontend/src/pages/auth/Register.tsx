import { useState } from "react";
import { API_BASE_URL } from "../../config/api";

function Register() {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "PATIENT"
  });

  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setMessage("Creating account...");

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(formData)
        }
      );

      const data = await response.text();

      if (response.ok) {

        setMessage("Registration successful!");

        setFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
          role: "PATIENT"
        });

      } else {

        setMessage(data);
      }

    } catch (error) {

      setMessage(
        "Unable to connect to server."
      );
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-50">

      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">

        <h1 className="text-3xl font-bold text-center">
          Create Account
        </h1>

        <p className="mt-2 text-gray-600 text-center">
          Create your MediFlow account.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border p-3 rounded"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border p-3 rounded"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border p-3 rounded"
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          >

            <option value="PATIENT">
              Patient
            </option>

            <option value="DOCTOR">
              Doctor
            </option>

          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
          >
            Create Account
          </button>

        </form>

        {message && (
          <p className="mt-4 text-center">
            {message}
          </p>
        )}

      </div>

    </div>
  );
}

export default Register;