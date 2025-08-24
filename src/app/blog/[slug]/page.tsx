"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/src/lib/axios";
import { Blog, Comment } from "@/src/types";

export default function BlogPost({ params }: { params: { slug: string } }) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [newComment, setNewComment] = useState<string>("");
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);

  useEffect(() => {
    fetchBlog();
  }, [params.slug]);

  const fetchBlog = async () => {
    try {
      const response = await api.get(`/blogs/${params.slug}`);
      setBlog(response.data);
      
      // Fetch comments for this blog
      const commentsResponse = await api.get(`/blogs/${params.slug}/comments`);
      setComments(commentsResponse.data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch blog");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await api.post(`/blogs/${params.slug}/comments`, {
        content: newComment.trim(),
      });
      setComments([...comments, response.data]);
      setNewComment("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Failed to post comment");
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The blog post you're looking for doesn't exist."}</p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow overflow-hidden">
          {/* Blog Header */}
          <div className="p-8 border-b border-gray-200">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-sm text-gray-600">By</p>
                  <p className="font-medium text-gray-900">{blog.author.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="font-medium text-gray-900">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {blog.updatedAt !== blog.createdAt && (
                  <div>
                    <p className="text-sm text-gray-600">Updated</p>
                    <p className="font-medium text-gray-900">
                      {new Date(blog.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  blog.status === "published"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {blog.status}
              </span>
            </div>

            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Blog Content */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none">
              {blog.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow mt-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              Comments ({comments.length})
            </h3>
          </div>

          {/* Comment Form */}
          <div className="p-6 border-b border-gray-200">
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submittingComment ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>
          </div>

          {/* Comments List */}
          <div className="p-6">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment._id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">{comment.author.name}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 