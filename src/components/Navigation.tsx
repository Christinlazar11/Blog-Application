"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/src/lib/axios";
import { User } from "@/src/types";

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await api.get("/profile");
        setUser(response?.data?.user);
      }
    } catch (error: unknown) {
      // Token is invalid, remove it
      console.error("Navigation auth error:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blog App</h1>
            </div>
            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <Link href="/" className="text-3xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
              Blog App
            </Link>
            <p className="text-gray-600 mt-1">
              {user?.role === "admin" ? "Admin Panel" : "Share your thoughts with the world"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
                            {user ? (
              user.role === "admin" ? (
                // Admin Navigation - Simplified
                <>
                  <Link
                    href="/admin"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Profile
                  </Link>
                  <span className="text-gray-600">Welcome, {user.name}!</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                // Regular User Navigation
                <>
                  <Link
                    href="/"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    href="/feed"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Feed
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Profile
                  </Link>
                  <span className="text-gray-600">Welcome, {user.name}!</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Logout
                  </button>
                </>
              )
            ) : (
              // Guest Navigation
              <>
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/feed"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Feed
                </Link>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 