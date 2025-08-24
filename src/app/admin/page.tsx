"use client";

import { useState } from "react";
import BlogTable from "@/src/components/admin/BlogTable";
import UserTable from "@/src/components/admin/UserTable";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"blogs" | "users">("blogs");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Dashboard Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your blog application</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("blogs")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "blogs"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Blogs
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Users
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "blogs" && <BlogTable />}
        {activeTab === "users" && <UserTable />}
      </main>
    </div>
  );
}
