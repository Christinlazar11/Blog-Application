"use client";
import { useEffect, useState } from "react";
import api from "@/src/lib/axios";
import { validateBlogForm, ValidationError } from "@/src/lib/validation";

interface Blog {
  _id: string;
  title: string;
  content: string;
  author: { _id: string; name: string; email: string }; // populated User
  status: "draft" | "published";
  slug?: string;
  excerpt?: string;
  tags?: string[];
  createdAt: string;
}

export default function BlogTable() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [crudLoading, setCrudLoading] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  // Fetch Blogs
  async function fetchBlogs() {
    setLoading(true);
    try {
      const res = await api.get("/admin/blogs");
      setBlogs(res.data.blogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Handle Save Blog (edit or add)
  async function handleSave(blogData: Partial<Blog>) {
    // Validate form data
    const validation = validateBlogForm({
      title: blogData.title || '',
      content: blogData.content || '',
      status: blogData.status || 'draft',
      tags: Array.isArray(blogData.tags) ? blogData.tags.join(', ') : ''
    });
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setCrudLoading(true);
    setErrors([]);
    
    try {
      if (selectedBlog) {
        await api.put(`/admin/blogs/${selectedBlog?._id}`, blogData);
      } else {
        await api.post(`/admin/blogs`, blogData);
      }
      fetchBlogs();
      setIsEditModalOpen(false);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error saving blog:", error);
      // Show error to user
      if (error instanceof Error) {
        alert(`Error saving blog: ${error.message}`);
      } else {
        alert("Error saving blog. Please try again.");
      }
    } finally {
      setCrudLoading(false);
    }
  }

  // Handle Delete
  async function handleDelete() {
    if (!selectedBlog) return;
    setCrudLoading(true);
    try {
      await api.delete(`/admin/blogs/${selectedBlog?._id}`);
      fetchBlogs();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting blog:", error);
    } finally {
      setCrudLoading(false);
    }
  }

  if (loading) return <p className="text-center">Loading blogs...</p>;

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Blogs</h2>
        <button
          onClick={() => {
            setSelectedBlog(null);
            setIsAddModalOpen(true);
          }}
          className="bg-green-500 hover:bg-green-600 transition duration-200 text-white px-4 py-2 rounded-lg"
        >
          + Add Blog
        </button>
      </div>

      {/* Blogs Table */}
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Title</th>
            <th className="py-3 px-6 text-left">Author</th>
            <th className="py-3 px-6 text-left">Status</th>
            <th className="py-3 px-6 text-left">Created</th>
            <th className="py-3 px-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm divide-y divide-gray-200">
          {blogs.map((blog) => (
            <tr key={blog?._id}>
              <td className="py-3 px-6">{blog.title}</td>
              <td className="py-3 px-6">
                {blog?.author?.name || "Unknown"}
              </td>
              <td className="py-3 px-6 capitalize">{blog.status}</td>
              <td className="py-3 px-6">
                {new Date(blog?.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3 px-6 text-center">
                <button
                  onClick={() => {
                    setSelectedBlog(blog);
                    setIsEditModalOpen(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 transition duration-200 text-white px-3 py-1 rounded-lg mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setSelectedBlog(blog);
                    setIsDeleteModalOpen(true);
                  }}
                  className="bg-red-500 hover:bg-red-600 transition duration-200 text-white px-3 py-1 rounded-lg"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {blogs.length === 0 && (
            <tr>
              <td colSpan={5} className="py-4 text-center text-gray-500">
                No blogs found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Edit/Add Modal */}
      {(isEditModalOpen || isAddModalOpen) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">
              {selectedBlog ? "Edit Blog" : "Add Blog"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSave({
                  title: formData.get("title") as string,
                  content: formData.get("content") as string,
                  status: formData.get("status") as "draft" | "published",
                  tags: (formData.get("tags") as string)
                    ?.split(",")
                    .map((tag) => tag.trim()),
                });
              }}
              onChange={() => setErrors([])} // Clear errors when form changes
            >
              <input
                name="title"
                placeholder="Title"
                defaultValue={selectedBlog?.title || ""}
                className={`w-full border rounded px-3 py-2 mb-2 ${
                  errors.find(e => e.field === 'title') ? 'border-red-500' : ''
                }`}
                required
              />
              {errors.find(e => e.field === 'title') && (
                <p className="text-red-500 text-sm mb-2">
                  {errors.find(e => e.field === 'title')?.message}
                </p>
              )}
              <textarea
                name="content"
                placeholder="Content"
                defaultValue={selectedBlog?.content || ""}
                className={`w-full border rounded px-3 py-2 mb-2 h-24 ${
                  errors.find(e => e.field === 'content') ? 'border-red-500' : ''
                }`}
                required
              />
              {errors.find(e => e.field === 'content') && (
                <p className="text-red-500 text-sm mb-2">
                  {errors.find(e => e.field === 'content')?.message}
                </p>
              )}
              <select
                name="status"
                defaultValue={selectedBlog?.status || "draft"}
                className="w-full border rounded px-3 py-2 mb-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <input
                name="tags"
                placeholder="Tags (comma separated)"
                defaultValue={selectedBlog?.tags?.join(", ") || ""}
                className={`w-full border rounded px-3 py-2 mb-2 ${
                  errors.find(e => e.field === 'tags') ? 'border-red-500' : ''
                }`}
              />
              {errors.find(e => e.field === 'tags') && (
                <p className="text-red-500 text-sm mb-2">
                  {errors.find(e => e.field === 'tags')?.message}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setIsAddModalOpen(false);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 transition duration-200 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={crudLoading}
                  className="bg-green-500 hover:bg-green-600 transition duration-200 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {crudLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedBlog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h3 className="text-lg font-bold mb-4">Delete Blog</h3>
            <p>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedBlog?.title}</span>?
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 transition duration-200 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={crudLoading}
                className="bg-red-500 hover:bg-red-600 transition duration-200 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {crudLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
