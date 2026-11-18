//kho text
export const authCopy = {
  brand: "BrewLite",
  tagline: "A little coffee. A little calm.",

  login: {
    title: "Chào mừng trở lại.",
    subtitle: "Đăng nhập để đặt món nhanh, tích điểm và thanh toán không tiền mặt.",
    emailLabel: "Email",
    emailPlaceholder: "ban@example.com",
    passwordLabel: "Mật khẩu",
    passwordPlaceholder: "••••••••",
    submit: "Login",
    terms: "Bằng cách tiếp tục, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật.",
    switchText: "Chưa có tài khoản?",
    switchLabel: "Đăng ký ngay",
    errors: {
      email: "Email không hợp lệ",
      password: "Mật khẩu tối thiểu 8 ký tự",
    },
  },

  register: {
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    confirmPlaceholder: "Confirm Password",
    submit: "Sign Up",
    switchText: "Bạn đã có tài khoản?",
    switchLabel: "Đăng nhập ngay",
    errors: {
      email: "Email không hợp lệ",
      password: "Mật khẩu tối thiểu 8 ký tự",
      confirm: "Mật khẩu nhập lại không khớp",
    },
  },
} as const;
