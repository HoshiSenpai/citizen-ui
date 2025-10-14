import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth";
import "./styles.css";

export default function Login() {
  const { signIn } = useAuth();
  const nav = useNavigate();

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
               strokeWidth={1.5} stroke="currentColor" className="icon">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75H4.5v-.75z" />
          </svg>
        </div>

        <h2>Login</h2>
        <h3>Citizen Portal</h3>
        <p>Sign in to continue</p>

        <GoogleLogin
          onSuccess={(cred) => {
            try {
              // decode JWT payload from Google ID token
              const payload = JSON.parse(atob(cred.credential.split(".")[1]));
              // save minimal user object (persisted by auth context)
              signIn({
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                idToken: cred.credential,
              });
              // go to dashboard
              nav("/", { replace: true });
            } catch (e) {
              console.error("Failed to parse Google token", e);
              alert("Login failed. Please try again.");
            }
          }}
          onError={() => alert("Login failed")}
        />
      </div>
    </div>
  );
}
