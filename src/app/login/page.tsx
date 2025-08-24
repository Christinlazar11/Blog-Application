import LoginForm from "@/src/components/forms/LoginForm";
import ProtectedRoute from "@/src/components/ProtectedRoute";

export default function LoginPage() {
  return (
    <ProtectedRoute>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <LoginForm />
      </div>
    </ProtectedRoute>
  );
}
