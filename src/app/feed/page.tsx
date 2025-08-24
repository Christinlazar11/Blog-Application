"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import api from "@/src/lib/axios";
import { Blog } from "@/src/types";
import BlogSearchFilter from "@/src/components/BlogSearchFilter";

export default function Feed() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchAllBlogs();
    fetchAvailableTags();
  }, [searchParams]);

  const fetchAvailableTags = async () => {
    try {
      const response = await api.get("/blogs/tags");
      setAvailableTags(response.data.tags || []);
    } catch (err) {
      console.error("Failed to fetch tags:", err);
    }
  };

  const fetchAllBlogs = async () => {
    try {
      setLoading(true);
      const queryString = searchParams.toString();
      const url = queryString ? `/blogs?status=published&${queryString}` : "/blogs?status=published";
      const response = await api.get(url);
      setBlogs(response.data.blogs || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch blogs");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Feed Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Blog Feed</h1>
            <p className="text-gray-600 mt-2">Discover amazing content from our community</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <BlogSearchFilter 
            availableTags={availableTags}
            showStatusFilter={true}
            showAuthorFilter={false}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blogs...</p>
          </div>
        ) : (
          <>
            {blogs.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No published blogs yet</h3>
                <p className="text-gray-600 mb-6">Be the first to share your thoughts!</p>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                  <article key={blog._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        <Link
                          href={`/blog/${blog.slug || blog._id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {blog.title}
                        </Link>
                      </h3>
                      
                      {blog.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>By {blog?.author?.name}</span>
                        <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {blog.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {blog.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{blog.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <Link
                          href={`/blog/${blog.slug || blog._id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                        >
                          Read More →
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
} 