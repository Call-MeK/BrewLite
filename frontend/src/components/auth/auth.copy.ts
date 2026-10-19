//kho text
export const authCopy = {
  brand: "BrewLite",
  tagline: "A little coffee. A little calm.",

  login: {
    title: "Chào mừng trở lại.",
    subtitle: "Đăng nhập để đặt món nhanh, tích điểm và thanh toán không tiền mặt.",
    phoneLabel: "Số điện thoại",
    phonePlaceholder: "090 123 4567",
    passwordLabel: "Mật khẩu",
    passwordPlaceholder: "••••••••",
    remember: "Ghi nhớ tôi",
    forgot: "Quên mật khẩu?",
    submit: "Login",
    terms: "Bằng cách tiếp tục, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật.",
    switchText: "Chưa có tài khoản?",
    switchLabel: "Đăng ký ngay",
    errors: {
      phone: "Số điện thoại không hợp lệ",
      password: "Vui lòng nhập mật khẩu",
    },
  },

  register: {
    namePlaceholder: "Họ tên",
    phonePlaceholder: "Số điện thoại",
    passwordPlaceholder: "Password",
    confirmPlaceholder: "Confirm Password",
    submit: "Sign Up",
    switchText: "Bạn đã có tài khoản?",
    switchLabel: "Đăng nhập ngay",
    errors: {
      name: "Vui lòng nhập họ tên",
      phone: "Số điện thoại không hợp lệ",
      password: "Mật khẩu tối thiểu 6 ký tự",
      confirm: "Mật khẩu nhập lại không khớp",
    },
  },
} as const;
