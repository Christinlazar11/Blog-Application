"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/src/lib/axios";
import { User } from "@/src/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ children, redirectTo }: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await api.get("/profile");
        const userData = response?.data?.user;
        
        if (userData) {
          setUser(userData);
          // Redirect based on user role
          if (userData.role === "admin") {
            router.push(redirectTo || "/admin");
          } else {
            router.push(redirectTo || "/dashboard");
          }
          return;
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If user is logged in, don't render children (they will be redirected)
  if (user) {
    return null;
  }

  // If user is not logged in, render the children (login/register forms)
  return <>{children}</>;
}
