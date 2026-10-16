import { authLayout } from "./auth.layout";
import { authCopy } from "./auth.copy";

// Logo + tagline ở đầu khung
export default function AuthHeader() {
  return (
    <header className={authLayout.header}>
      <h1 className={authLayout.brand}>{authCopy.brand}</h1>
      <p className={authLayout.tagline}>{authCopy.tagline}</p>
    </header>
  );
}
