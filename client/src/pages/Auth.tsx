import AuthForm from "@/components/AuthForm";
import { useLocation } from "wouter";

export default function Auth() {
  const [, setLocation] = useLocation();

  const handleLogin = (username: string, password: string) => {
    console.log('Login:', { username, password });
    setLocation("/");
  };

  const handleRegister = (username: string, password: string) => {
    console.log('Register:', { username, password });
    setLocation("/");
  };

  return (
    <AuthForm
      onLogin={handleLogin}
      onRegister={handleRegister}
    />
  );
}
