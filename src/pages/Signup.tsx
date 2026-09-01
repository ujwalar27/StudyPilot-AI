import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/config";
import Piko from "../components/Piko";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      await updateProfile(userCredential.user, {
        displayName: name.trim(),
      });

      navigate("/onboarding");

    } catch (error: any) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        setError(
          "An account with this email already exists."
        );
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        setError(
          "Password is too weak. Use at least 6 characters."
        );
      } else {
        setError(
          "Unable to create your account. Please try again."
        );
      }

    } finally {
      setLoading(false);
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
          message="Let's launch your learning journey!"
          className="piko-auth"
        />

        <div className="auth-header">

          <p className="eyebrow">
            NEW LEARNER
          </p>

          <h1>
            Create your account
          </h1>

          <p>
            Start building a personalized study plan
            for your learning goal.
          </p>

        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSignup}
        >

          <div className="form-group">
            <label htmlFor="name">
              Name
            </label>

            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              disabled={loading}
            />
          </div>

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
              placeholder="Create a password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              disabled={loading}
            />
          </div>

          <button
            className="primary-button full-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        <p className="auth-footer">
          Already have an account?

          <button
            type="button"
            className="text-button"
            onClick={() => navigate("/login")}
            disabled={loading}
          >
            Log In
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

export default Signup;