import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Comment from "@/src/models/Comment";
import Blog from "@/src/models/Blog";
import User from "@/src/models/User"; // Add this to ensure User model is registered
import { verifyJwt } from "@/src/lib/auth";

// GET /api/blogs/[id]/comments - Get all comments for a blog
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Await the params since it's now a Promise
    const { id } = await params;
    
    // Check if id is a valid ObjectId (24 character hex string)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let blog;
    if (isValidObjectId) {
      // Try to find by ID first
      blog = await Blog.findById(id);
    }
    
    if (!blog) {
      // If not found by ID or not a valid ObjectId, try to find by slug
      blog = await Blog.findOne({ slug: id });
    }
    
    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }
    
    const comments = await Comment.find({ blog: blog._id })
      .populate("author", "name")
      .populate("parentComment")
      .sort({ createdAt: 1 });
    
    return NextResponse.json(comments);
  } catch (error: unknown) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/blogs/[id]/comments - Add a comment to a blog
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Await the params since it's now a Promise
    const { id } = await params;
    
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const decoded = verifyJwt<{ userId: string }>(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }
    
    // Check if id is a valid ObjectId (24 character hex string)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let blog;
    if (isValidObjectId) {
      // Try to find by ID first
      blog = await Blog.findById(id);
    }
    
    if (!blog) {
      // If not found by ID or not a valid ObjectId, try to find by slug
      blog = await Blog.findOne({ slug: id });
    }
    
    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const { content, parentComment } = body;
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }
    
    const comment = new Comment({
      content: content.trim(),
      author: decoded.userId,
      blog: blog._id,
      parentComment: parentComment || undefined,
    });
    
    await comment.save();
    
    const populatedComment = await comment.populate("author", "name");
    
    return NextResponse.json(populatedComment, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}