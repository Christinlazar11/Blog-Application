"use client";

import { useState, useEffect } from "react";
import api from "@/src/lib/axios";
import { Blog } from "@/src/types";

export default function DebugPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await api.get("/blogs");
      console.log("Debug: All blogs response:", response.data);
      setBlogs(response.data.blogs || []);
    } catch (err: unknown) {
      console.error("Debug: Error fetching blogs:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch blogs");
      }
    } finally {
      setLoading(false);
    }
  };

  const testBlogView = async (blogId: string, slug?: string) => {
    try {
      console.log("Testing blog view with ID:", blogId, "and slug:", slug);
      const response = await api.get(`/blogs/${slug || blogId}`);
      console.log("Blog view response:", response.data);
      alert("Blog view successful! Check console for details.");
    } catch (err: unknown) {
      console.error("Blog view error:", err);
      if (err instanceof Error) {
        alert(`Blog view failed: ${err.message}`);
      } else {
        alert("Blog view failed! Check console for details.");
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">All Blogs:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(blogs, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Test Blog Views:</h2>
        {blogs.map((blog) => (
          <div key={blog._id} className="border p-4 mb-2 rounded">
            <p><strong>Title:</strong> {blog.title}</p>
            <p><strong>ID:</strong> {blog._id}</p>
            <p><strong>Slug:</strong> {blog.slug || "No slug"}</p>
            <button
              onClick={() => testBlogView(blog._id, blog.slug)}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            >
              Test View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 