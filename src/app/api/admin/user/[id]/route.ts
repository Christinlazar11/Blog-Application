import { NextRequest, NextResponse } from "next/server";
import User from "@/src/models/User";
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
    const { id } = await params; // Await the params
    const body = await req.json();
    
    const user = await User.findByIdAndUpdate(id, body, { 
      new: true,
      runValidators: true 
    }).select("-password");
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({ user });
  } catch (error: unknown) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
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
    const { id } = await params; // Await the params
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminValidation = await validateAdmin(req);
    if (adminValidation instanceof NextResponse) {
      return adminValidation;
    }

    await connectDB();
    const { id } = await params; // Await the params
    
    const user = await User.findById(id).select("-password");
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({ user });
  } catch (error: unknown) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}