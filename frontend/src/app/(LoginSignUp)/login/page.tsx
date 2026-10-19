import AuthLayout from "@/components/auth/AuthLayout"; // (hoặc đường dẫn tương ứng đến thư mục chứa component của bạn)
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}