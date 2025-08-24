import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Blog from "@/src/models/Blog";
import { verifyJwt } from "@/src/lib/auth";

// GET /api/blogs/[id] - Get a specific blog
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Await the params Promise
    const { id } = await params;
    
    // Check if id is a valid ObjectId (24 character hex string)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let blog;
    if (isValidObjectId) {
      // Try to find by ID first
      blog = await Blog.findById(id).populate("author", "name email");
    }
    
    if (!blog) {
      // If not found by ID or not a valid ObjectId, try to find by slug
      blog = await Blog.findOne({ slug: id }).populate("author", "name email");
    }
    
    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(blog);
  } catch (error: unknown) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/[id] - Update a blog
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Await the params Promise
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
    
    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }
    
    // Check if user is the author
    if (blog.author.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { title, content, status, tags } = body;
    
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (status !== undefined) updateData.status = status;
    if (tags !== undefined) updateData.tags = tags;
    
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("author", "name email");
    
    return NextResponse.json(updatedBlog);
  } catch (error: unknown) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[id] - Delete a blog
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Await the params Promise
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
    
    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }
    
    // Check if user is the author
    if (blog.author.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
    
    await Blog.findByIdAndDelete(id);
    
    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}