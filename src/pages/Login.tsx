import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase/config";
import Piko from "../components/Piko";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      navigate("/dashboard");

    } catch (error: any) {
      console.error(error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setError(
          "Incorrect email or password."
        );
      } else if (error.code === "auth/invalid-email") {
        setError(
          "Please enter a valid email address."
        );
      } else {
        setError(
          "Unable to log in. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError(
        "Enter your email first, then click Forgot Password."
      );
      return;
    }

    try {
      await sendPasswordResetEmail(
        auth,
        email.trim()
      );

      setMessage(
        "Password reset email sent. Check your inbox."
      );

    } catch (error: any) {
      console.error(error);

      setError(
        "Unable to send the reset email. Please check your email address."
      );
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <button
          className="auth-logo"
          onClick={() => navigate("/")}
        >
          🚀 StudyPilot AI
        </button>

        <Piko
          size="medium"
          message="Welcome back! Ready for your next mission?"
          className="piko-auth"
        />

        <div className="auth-header">

          <p className="eyebrow">
            WELCOME BACK
          </p>

          <h1>
            Ready to continue?
          </h1>

          <p>
            Log in and continue your learning journey with Piko.
          </p>

        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {message && (
          <div className="auth-success">
            {message}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleLogin}
        >

          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              disabled={loading}
            />
          </div>

          <button
            type="button"
            className="forgot-button"
            onClick={handleForgotPassword}
            disabled={loading}
          >
            Forgot Password?
          </button>

          <button
            className="primary-button full-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging In..."
              : "Log In"}
          </button>

        </form>

        <p className="auth-footer">
          Don't have an account?

          <button
            type="button"
            className="text-button"
            onClick={() => navigate("/signup")}
            disabled={loading}
          >
            Sign Up
          </button>
        </p>

        <button
          className="back-button"
          onClick={() => navigate("/")}
          disabled={loading}
        >
          ← Back to home
        </button>

      </div>

    </div>
  );
}

export default Login;