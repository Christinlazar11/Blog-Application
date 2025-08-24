"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/src/lib/axios";
import ProfileUpdateForm from "@/src/components/forms/ProfileUpdateForm";
import { User } from "@/src/types";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await api.get("/profile");
      setUser(response.data.user);
    } catch (err: unknown) {
      console.error("Failed to fetch user profile:", err);
      setError("Failed to load profile");
      localStorage.removeItem("token");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "Unable to load your profile."}</p>
          <button
            onClick={() => router.push("/login")}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account information</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Current Profile Info */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          {/* Profile Update Form */}
          <div className="border-t pt-8">
            <ProfileUpdateForm user={user} onUpdate={handleProfileUpdate} />
          </div>
        </div>
      </main>
    </div>
  );
}
