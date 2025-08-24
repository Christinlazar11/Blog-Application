import { NextResponse } from "next/server";
import Blog from "@/src/models/Blog";
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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminValidation = await validateAdmin(req);
  if (adminValidation instanceof NextResponse) {
    return adminValidation;
  }

  await connectDB();
  const { id } = await params;
  const body = await req.json();
  const blog = await Blog.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json({ blog });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminValidation = await validateAdmin(req);
  if (adminValidation instanceof NextResponse) {
    return adminValidation;
  }

  await connectDB();
  const { id } = await params;
  await Blog.findByIdAndDelete(id);
  return NextResponse.json({ message: "Blog deleted" });
}