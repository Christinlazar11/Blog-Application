"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/src/lib/axios";
import { User } from "@/src/types";

interface AdminProtectedProps {
  children: React.ReactNode;
}

export default function AdminProtected({ children }: AdminProtectedProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);
  

  const checkAuth = async () => {
    console.log("in checkout auth")
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await api.get("/profile");
      const userData = response?.data?.user;
      console.log("userData",userData)
      if (!userData || userData.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      setUser(userData);
    } catch (error) {
      console.error("Admin auth error:", error);
      localStorage.removeItem("token");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };
console.log("user is",user)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    console.log("in return in user.role != admin last")
    return null;
  }

  return <>{children}</>;
}
