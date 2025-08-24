import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyJwt } from "@/src/lib/auth";
import User from "@/src/models/User";
import { connectDB } from "@/src/lib/db";
import { validateName, validateEmail, validatePassword } from "@/src/lib/validation";

interface JwtPayload {
  userId: string;
  role: string;
  email?: string;
}

interface UpdateData {
  name?: string;
  email?: string;
  password?: string;
}

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyJwt<JwtPayload>(token);

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, email, currentPassword, newPassword } = body;

    const updateData: UpdateData = {};

    // Update name (no password required)
    if (name !== undefined && name !== user.name) {
      const nameError = validateName(name);
      if (nameError) {
        return NextResponse.json({ error: nameError }, { status: 400 });
      }
      updateData.name = name;
    }

    // Update email (requires current password)
    if (email !== undefined && email !== user.email) {
      const emailError = validateEmail(email);
      if (emailError) {
        return NextResponse.json({ error: emailError }, { status: 400 });
      }

      // Check if email is already taken
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return NextResponse.json({ error: "Email is already taken" }, { status: 400 });
      }

      // Verify current password for email change
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to change email" }, { status: 400 });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      updateData.email = email;
    }

    // Update password (requires current password)
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to change password" }, { status: 400 });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      const passwordError = validatePassword(newPassword, true);
      if (passwordError) {
        return NextResponse.json({ error: passwordError }, { status: 400 });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // If no updates, return current user data
    if (Object.keys(updateData).length === 0) {
      const { password: _, ...userWithoutPassword } = user.toObject();
      return NextResponse.json({ 
        message: "No changes made",
        user: userWithoutPassword 
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    return NextResponse.json({ 
      message: "Profile updated successfully",
      user: updatedUser 
    });

  } catch (error: unknown) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}