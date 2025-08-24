import RegisterForm from "@/src/components/forms/RegisterForm";
import ProtectedRoute from "@/src/components/ProtectedRoute";

export default function RegisterPage() {
  return (
    <ProtectedRoute>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <RegisterForm />
      </div>
    </ProtectedRoute>
  );
}
