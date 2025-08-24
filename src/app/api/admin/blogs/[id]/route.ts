import { NextRequest, NextResponse } from "next/server";
import Blog from "@/src/models/Blog";
import User from "@/src/models/User"; // Add this import to ensure User model is registered
import { connectDB } from "@/src/lib/db";
import { verifyJwt } from "@/src/lib/auth";

// Helper to validate admin token
async function validateAdmin(req: NextRequest) {
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

export async function PUT(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminValidation = await validateAdmin(req);
    if (adminValidation instanceof NextResponse) {
      return adminValidation;
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    
    const blog = await Blog.findByIdAndUpdate(id, body, { 
      new: true,
      runValidators: true 
    }).populate("author", "name email");
    
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    
    return NextResponse.json({ blog });
  } catch (error: unknown) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminValidation = await validateAdmin(req);
    if (adminValidation instanceof NextResponse) {
      return adminValidation;
    }

    await connectDB();
    const { id } = await params;
    
    const blog = await Blog.findByIdAndDelete(id);
    
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}