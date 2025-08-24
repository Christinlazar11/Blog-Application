"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/src/lib/axios";
import { BlogForm } from "@/src/types";
import { validateBlogForm, ValidationError } from "@/src/lib/validation";

export default function NewBlog() {
  const router = useRouter();
  const [form, setForm] = useState<BlogForm>({
    title: "",
    content: "",
    status: "draft",
    tags: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error for this field when user starts typing
    setErrors(errors.filter(error => error.field !== e.target.name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setError("");

    // Validate form
    const validation = validateBlogForm(form);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);

    try {
      const tags = form.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await api.post("/blogs", {
        title: form.title,
        content: form.content,
        status: form.status,
        tags,
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create blog");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Create New Blog</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.find(e => e.field === 'title') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter blog title"
                required
              />
              {errors.find(e => e.field === 'title') && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.find(e => e.field === 'title')?.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={15}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.find(e => e.field === 'content') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Write your blog content here..."
                required
              />
              {errors.find(e => e.field === 'content') && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.find(e => e.field === 'content')?.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.find(e => e.field === 'tags') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter tags separated by commas (e.g., technology, programming, web)"
              />
              {errors.find(e => e.field === 'tags') ? (
                <p className="text-red-500 text-sm mt-1">
                  {errors.find(e => e.field === 'tags')?.message}
                </p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">
                  Separate multiple tags with commas
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating..." : "Create Blog"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 