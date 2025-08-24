"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import api from "@/src/lib/axios";
import DeleteModal from "@/src/components/DeleteModal";
import BlogSearchFilter from "@/src/components/BlogSearchFilter";
import { Blog, User } from "@/src/types";

// Loading component for Suspense fallback
function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Main dashboard content component
function DashboardContent() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const searchParams = useSearchParams(); // This is now safely wrapped in Suspense
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    blogId: string;
    blogTitle: string;
  }>({
    isOpen: false,
    blogId: "",
    blogTitle: "",
  });

  useEffect(() => {
    fetchUserBlogs();
    fetchUserProfile();
    fetchAvailableTags();
  }, [searchParams]);

  const fetchAvailableTags = async () => {
    try {
      // Get tags from user's own blogs
      const response = await api.get("/blogs?author=me");
      const userBlogs = response.data.blogs || [];
      const allTags = userBlogs
        .map((blog: Blog) => blog.tags || [])
        .flat()
        .filter((tag: string) => tag && tag.trim() !== "") as string[];
      const uniqueTags = [...new Set(allTags)].sort();
      setAvailableTags(uniqueTags);
    } catch (err) {
      console.error("Failed to fetch tags:", err);
    }
  };

  const fetchUserBlogs = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      setLoading(true);
      const queryString = searchParams.toString();
      const url = queryString ? `/blogs?author=me&${queryString}` : "/blogs?author=me";
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

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/profile");
      setUser(response.data.user);
    } catch (err: unknown) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    try {
      await api.delete(`/blogs/${blogId}`);
      setBlogs(blogs.filter(blog => blog._id !== blogId));
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Failed to delete blog");
      }
    }
  };

  const openDeleteModal = (blogId: string, blogTitle: string) => {
    setDeleteModal({
      isOpen: true,
      blogId,
      blogTitle,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      blogId: "",
      blogTitle: "",
    });
  };

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Blog Dashboard</h1>
              {user && (
                <p className="text-sm text-gray-600">Welcome, {user.name}!</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create New Blog
              </Link>
            </div>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Total Blogs</h3>
            <p className="text-3xl font-bold text-blue-600">{blogs.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Published</h3>
            <p className="text-3xl font-bold text-green-600">
              {blogs.filter(blog => blog.status === "published").length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Drafts</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {blogs.filter(blog => blog.status === "draft").length}
            </p>
          </div>
        </div>

        {/* Blogs List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Blogs</h2>
          </div>
          
          {blogs.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 mb-4">You haven&apos;t created any blogs yet.</p>
              <Link
                href="/dashboard/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Your First Blog
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {blogs.map((blog) => (
                <div key={blog._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {blog.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            blog.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {blog.status}
                        </span>
                      </div>
                      
                      {blog.excerpt && (
                        <p className="text-gray-600 mb-3">{blog.excerpt}</p>
                      )}
                      
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {blog.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-500">
                        Created: {new Date(blog.createdAt).toLocaleDateString()}
                        {blog.updatedAt !== blog.createdAt && (
                          <span className="ml-4">
                            Updated: {new Date(blog.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/dashboard/edit/${blog._id}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/blog/${blog.slug || blog._id}`}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        onClick={(e) => {
                          if (!blog.slug && !blog._id) {
                            e.preventDefault();
                            alert("Blog URL not available");
                          }
                        }}
                      >
                        View
                      </Link>
                      <button
                        onClick={() => openDeleteModal(blog._id, blog.title)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeleteBlog(deleteModal.blogId)}
        title="Delete Blog"
        message="Are you sure you want to delete this blog"
        itemName={deleteModal.blogTitle}
      />
    </div>
  );
}

// Main Dashboard component with Suspense wrapper
export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}