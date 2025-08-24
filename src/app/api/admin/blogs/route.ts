import { NextResponse } from "next/server";
import Blog from "@/src/models/Blog";
import User from "@/src/models/User"; // Import User model to register the schema
import { connectDB } from "@/src/lib/db";
import { verifyJwt } from "@/src/lib/auth";

// Helper to validate admin token
async function validateAdmin(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const decoded = verifyJwt<{ userId: string; role: string }>(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (decoded.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return decoded;
}

// GET /api/admin/blogs - Get all blogs
export async function GET(req: Request) {
  const adminValidation = await validateAdmin(req);
  if (adminValidation instanceof NextResponse) {
    return adminValidation;
  }

  await connectDB();
  const blogs = await Blog.find().populate("author", "name email");
  return NextResponse.json({ blogs });
}

// POST /api/admin/blogs - Create blog
export async function POST(req: Request) {
  const adminValidation = await validateAdmin(req);
  if (adminValidation instanceof NextResponse) {
    return adminValidation;
  }

  await connectDB();
  const body = await req.json();
  
  // Add the admin user as the author
  const blogData = {
    ...body,
    author: adminValidation.userId
  };
  
  const blog = await Blog.create(blogData);
  const populatedBlog = await blog.populate("author", "name email");
  
  return NextResponse.json({ blog: populatedBlog });
}