import Link from "next/link";
import { authLayout } from "./auth.layout";

type Props = { text: string; label: string; href: string };

// Dòng "Chưa có tài khoản? Đăng ký ngay" / "Bạn đã có tài khoản? Đăng nhập ngay"
export default function AuthSwitch({ text, label, href }: Props) {
  return (
    <p className={authLayout.switchText}>
      {text}{" "}
      <Link href={href} className={authLayout.switchLink}>
        {label}
      </Link>
    </p>
  );
}
