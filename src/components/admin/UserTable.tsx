"use client";
import { useEffect, useState } from "react";
import api from "@/src/lib/axios";
import { validateUserForm, ValidationError } from "@/src/lib/validation";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [crudLoading, setCrudLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  // Fetch Users
  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await api.get("/admin/user");
      setUsers(res.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Save User (edit or add)
  async function handleSave(userData: Partial<User> & { password?: string }) {
    // Validate form data - ensure all required fields are present
    const validation = validateUserForm({
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'user',
      ...(userData.password !== undefined && { password: userData.password })
    });
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setCrudLoading(true);
    setErrors([]);
    
    try {
      if (selectedUser) {
        // Update user
        await api.put(`/admin/user/${selectedUser._id}`, userData);
      } else {
        // Add user
        await api.post(`/admin/user`, userData);
      }
      fetchUsers();
      setIsEditModalOpen(false);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setCrudLoading(false);
    }
  }

  // Handle Delete
  async function handleDelete() {
    if (!selectedUser) return;
    setCrudLoading(true);
    try {
      await api.delete(`/admin/user/${selectedUser._id}`);
      fetchUsers();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setCrudLoading(false);
    }
  }

  if (loading) return <p className="text-center">Loading users...</p>;

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Users</h2>
        <button
          onClick={() => {
            setSelectedUser(null);
            setIsAddModalOpen(true);
          }}
          className="bg-green-500 hover:bg-green-600 transition duration-200 text-white px-4 py-2 rounded-lg"
        >
          + Add User
        </button>
      </div>

      {/* Users Table */}
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Name</th>
            <th className="py-3 px-6 text-left">Email</th>
            <th className="py-3 px-6 text-left">Role</th>
            <th className="py-3 px-6 text-left">Joined</th>
            <th className="py-3 px-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user._id}>
              <td className="py-3 px-6">{user.name}</td>
              <td className="py-3 px-6">{user.email}</td>
              <td className="py-3 px-6">{user.role}</td>
              <td className="py-3 px-6">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3 px-6 text-center">
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setIsEditModalOpen(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 transition duration-200 text-white px-3 py-1 rounded-lg mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setIsDeleteModalOpen(true);
                  }}
                  className="bg-red-500 hover:bg-red-600 transition duration-200 text-white px-3 py-1 rounded-lg"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="py-4 text-center text-gray-500">
                No users found
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
              {selectedUser ? "Edit User" : "Add User"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSave({
                  name: formData.get("name") as string,
                  email: formData.get("email") as string,
                  role: formData.get("role") as string,
                  ...(selectedUser ? {} : { password: formData.get("password") as string }), // only when creating
                });
              }}
              onChange={() => setErrors([])} // Clear errors when form changes
            >
              <input
                name="name"
                placeholder="Name"
                defaultValue={selectedUser?.name || ""}
                className={`w-full border rounded px-3 py-2 mb-2 ${
                  errors.find(e => e.field === 'name') ? 'border-red-500' : ''
                }`}
                required
              />
              {errors.find(e => e.field === 'name') && (
                <p className="text-red-500 text-sm mb-2">
                  {errors.find(e => e.field === 'name')?.message}
                </p>
              )}
              <input
                name="email"
                type="email"
                placeholder="Email"
                defaultValue={selectedUser?.email || ""}
                className={`w-full border rounded px-3 py-2 mb-2 ${
                  errors.find(e => e.field === 'email') ? 'border-red-500' : ''
                }`}
                required
              />
              {errors.find(e => e.field === 'email') && (
                <p className="text-red-500 text-sm mb-2">
                  {errors.find(e => e.field === 'email')?.message}
                </p>
              )}
                              {!selectedUser && (
                  <>
                    <input
                      name="password"
                      type="password"
                      placeholder="Password"
                      className={`w-full border rounded px-3 py-2 mb-2 ${
                        errors.find(e => e.field === 'password') ? 'border-red-500' : ''
                      }`}
                      required
                    />
                    {errors.find(e => e.field === 'password') && (
                      <p className="text-red-500 text-sm mb-2">
                        {errors.find(e => e.field === 'password')?.message}
                      </p>
                    )}
                  </>
                )}
              <select
                name="role"
                defaultValue={selectedUser?.role || "user"}
                className="w-full border rounded px-3 py-2 mb-2"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
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
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h3 className="text-lg font-bold mb-4">Delete User</h3>
            <p>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedUser.name}</span>?
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
