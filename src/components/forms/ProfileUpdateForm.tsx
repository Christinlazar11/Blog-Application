"use client";

import { useState, useEffect } from "react";
import api from "@/src/lib/axios";
import { User } from "@/src/types";
import { validateName, validateEmail, validatePassword, ValidationError } from "@/src/lib/validation";

interface ProfileUpdateFormProps {
  user: User;
  onUpdate?: (updatedUser: User) => void;
}

export default function ProfileUpdateForm({ user, onUpdate }: ProfileUpdateFormProps) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState<string>("");
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      name: user.name,
      email: user.email,
    }));
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    setErrors(errors.filter(error => error.field !== name));
  };

  const validateForm = () => {
    const newErrors: ValidationError[] = [];

    // Validate name
    const nameError = validateName(form.name);
    if (nameError) newErrors.push({ field: 'name', message: nameError });

    // Validate email
    const emailError = validateEmail(form.email);
    if (emailError) newErrors.push({ field: 'email', message: emailError });

    // Validate new password if provided
    if (form.newPassword) {
      const passwordError = validatePassword(form.newPassword, true);
      if (passwordError) newErrors.push({ field: 'newPassword', message: passwordError });

      // Validate confirm password
      if (form.newPassword !== form.confirmPassword) {
        newErrors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
      }
    }

    // Validate current password if email or password is being changed
    if ((form.email !== user.email || form.newPassword) && !form.currentPassword) {
      newErrors.push({ field: 'currentPassword', message: 'Current password is required for this change' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setErrors([]);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const updateData: any = {};
      
      if (form.name !== user.name) {
        updateData.name = form.name;
      }
      
      if (form.email !== user.email) {
        updateData.email = form.email;
        updateData.currentPassword = form.currentPassword;
      }
      
      if (form.newPassword) {
        updateData.newPassword = form.newPassword;
        updateData.currentPassword = form.currentPassword;
      }

      const response = await api.put("/profile/update", updateData);
      
      setMessage("✅ Profile updated successfully!");
      
      // Clear sensitive fields
      setForm(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      // Call onUpdate callback if provided
      if (onUpdate && response.data.user) {
        onUpdate(response.data.user);
      }

      // Update localStorage if user data changed
      if (response.data.user) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(`❌ ${err.message}`);
      } else {
        setMessage("❌ Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName: string) => {
    return errors.find(e => e.field === fieldName)?.message;
  };

  const hasFieldError = (fieldName: string) => {
    return errors.some(e => e.field === fieldName);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Update Profile</h3>
      </div>

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            hasFieldError('name') ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your name"
        />
        {getFieldError('name') && (
          <p className="text-red-500 text-sm mt-1">{getFieldError('name')}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            hasFieldError('email') ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your email"
        />
        {getFieldError('email') && (
          <p className="text-red-500 text-sm mt-1">{getFieldError('email')}</p>
        )}
        {form.email !== user.email && (
          <p className="text-yellow-600 text-sm mt-1">
            ⚠️ Changing email requires current password verification
          </p>
        )}
      </div>

      {/* Current Password Field (required for email/password changes) */}
      {(form.email !== user.email || form.newPassword) && (
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasFieldError('currentPassword') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your current password"
          />
          {getFieldError('currentPassword') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('currentPassword')}</p>
          )}
        </div>
      )}

      {/* New Password Field */}
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
          New Password (optional)
        </label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            hasFieldError('newPassword') ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter new password"
        />
        {getFieldError('newPassword') && (
          <p className="text-red-500 text-sm mt-1">{getFieldError('newPassword')}</p>
        )}
        {form.newPassword && (
          <p className="text-gray-600 text-sm mt-1">
            Password must be at least 8 characters with uppercase, lowercase, and number
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      {form.newPassword && (
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasFieldError('confirmPassword') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Confirm new password"
          />
          {getFieldError('confirmPassword') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('confirmPassword')}</p>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`text-sm text-center p-3 rounded-md ${
          message.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message}
        </div>
      )}
    </form>
  );
}
