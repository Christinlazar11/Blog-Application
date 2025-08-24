import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Blog from "@/src/models/Blog";
import { verifyJwt } from "@/src/lib/auth";

// GET /api/blogs - Get all blogs (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const author = searchParams.get("author");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const tags = searchParams.get("tags");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    
    const filter: Record<string, unknown> = {};
    
    // Author filter
    if (author === "me") {
      // Get user's own blogs
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
      
      filter.author = decoded.userId;
    } else if (author) {
      filter.author = author;
    }
    
    // Status filter
    if (status) filter.status = status;
    
    // Search filter (title, content, excerpt)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }
    
    const blogs = await Blog.find(filter)
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Blog.countDocuments(filter);
    
    return NextResponse.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

// POST /api/blogs - Create a new blog
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
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
    
    const body = await request.json();
    const { title, content, status = "draft", tags } = body;
    
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }
    
    const blog = new Blog({
      title,
      content,
      author: decoded.userId,
      status,
      tags: tags || [],
    });
    
    await blog.save();
    
    const populatedBlog = await blog.populate("author", "name email");
    
    return NextResponse.json(populatedBlog, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 }
    );
  }
} 