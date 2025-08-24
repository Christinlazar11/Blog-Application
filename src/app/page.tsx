"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/src/lib/axios";
import { Blog } from "@/src/types";

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchPublishedBlogs();
  }, []);

  const fetchPublishedBlogs = async () => {
    try {
      const response = await api.get("/blogs?status=published&limit=6");
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
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Latest Blog Posts</h2>
              <p className="text-gray-600">Discover amazing content from our community</p>
            </div>

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
              <>
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
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>By {blog?.author?.name}</span>
                          <span>{new Date(blog?.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
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
                      </div>
                    </article>
                  ))}
                </div>
                
                <div className="text-center mt-8">
                  <Link
                    href="/feed"
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-block"
                  >
                    View All Blogs
                  </Link>
        </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
