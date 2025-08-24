"use client";

import { useState } from "react";
import api from "@/src/lib/axios";
import type { RegisterForm } from "@/src/types";
import { validateRegisterForm, ValidationError } from "@/src/lib/validation";

export default function RegisterForm() {
  const [form, setForm] = useState<RegisterForm>({ name: "", email: "", password: "" });
  const [message, setMessage] = useState<string>("");
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error for this field when user starts typing
    setErrors(errors.filter(error => error.field !== e.target.name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setMessage("");

    // Validate form
    const validation = validateRegisterForm(form);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setMessage("Registering...");

    try {
      const { data } = await api.post("/auth/register", form);

      setMessage("✅ Registered successfully! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(`❌ ${err.message}`);
      } else {
        setMessage("❌ Something went wrong");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Register</h2>

      <div>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className={`w-full border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
            errors.find(e => e.field === 'name') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          required
        />
                  {errors.find(e => e.field === 'name') && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">
              {errors.find(e => e.field === 'name')?.message}
            </p>
          )}
      </div>

      <div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className={`w-full border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
            errors.find(e => e.field === 'email') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          required
        />
                  {errors.find(e => e.field === 'email') && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">
              {errors.find(e => e.field === 'email')?.message}
            </p>
          )}
      </div>

      <div>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className={`w-full border p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
            errors.find(e => e.field === 'password') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          required
        />
                  {errors.find(e => e.field === 'password') && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">
              {errors.find(e => e.field === 'password')?.message}
            </p>
          )}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition-colors"
      >
        Register
      </button>

      {message && <p className="text-sm text-center text-gray-700 dark:text-gray-300">{message}</p>}
    </form>
  );
}
