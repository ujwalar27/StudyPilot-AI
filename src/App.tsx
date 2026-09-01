import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Plan from "./pages/Plan";
import Dashboard from "./pages/Dashboard";
import CurrentPlans from "./pages/CurrentPlans";
import Insights from "./pages/Insights";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="app">

      {/* =================================================
          NAVBAR
          ================================================= */}

      <header className="navbar">

        <div
          className="logo"
          onClick={() => navigate("/")}
        >
          🚀 StudyPilot AI
        </div>

        <div className="navbar-actions">

          <button
            type="button"
            className="login-button"
            onClick={() => navigate("/login")}
          >
            Log In
          </button>

          <button
            type="button"
            className="signup-button"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>

        </div>

      </header>


      {/* =================================================
          HERO
          ================================================= */}

      <main className="hero">

        <div className="hero-content">

          <p className="eyebrow">
            AI-POWERED LEARNING PLANNER
          </p>

          <h1>
            Turn your learning goal into a
            <span>
              personalized study plan.
            </span>
          </h1>

          <p className="hero-description">
            Tell StudyPilot what you want to learn,
            your current skill level, your deadline,
            and how much time you have.
            Get a structured learning journey
            designed around your goals.
          </p>

          <div className="hero-buttons">

            <button
              type="button"
              className="primary-button"
              onClick={() => navigate("/signup")}
            >
              🚀 Create My Study Plan
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              See How It Works
            </button>

          </div>

        </div>


        {/* =================================================
            HERO CARD
            ================================================= */}

        <div className="hero-card">

          <div className="hero-mascot">
            🚀
          </div>

          <div className="card-header">

            <div>

              <p className="card-label">
                CURRENT MISSION
              </p>

              <h2>
                Learn SQL
              </h2>

            </div>

            <span className="progress-badge">
              35%
            </span>

          </div>

          <div className="progress-bar">

            <div className="progress-fill"></div>

          </div>

          <p className="card-info">
            30-day learning journey
          </p>

          <div className="task">

            <span className="check">
              ✓
            </span>

            <div>

              <strong>
                Learn SQL Joins
              </strong>

              <p>
                45 minutes
              </p>

            </div>

          </div>

          <div className="task">

            <span className="check empty">
              ○
            </span>

            <div>

              <strong>
                Practice 10 queries
              </strong>

              <p>
                30 minutes
              </p>

            </div>

          </div>

          <div className="task">

            <span className="check empty">
              ○
            </span>

            <div>

              <strong>
                Review CTEs
              </strong>

              <p>
                30 minutes
              </p>

            </div>

          </div>

        </div>

      </main>


      {/* =================================================
          HOW IT WORKS
          ================================================= */}

      <section
        className="how-it-works"
        id="how-it-works"
      >

        <div className="section-heading">

          <p className="eyebrow">
            HOW IT WORKS
          </p>

          <h2>
            From learning goal to daily action.
          </h2>

          <p>
            StudyPilot helps you create a plan,
            follow it, and track your progress.
          </p>

        </div>

        <div className="steps">

          <div className="step">

            <div className="step-number">
              1
            </div>

            <h3>
              Set Your Goal
            </h3>

            <p>
              Tell us what you want to learn,
              your current level, deadline,
              and available study time.
            </p>

          </div>

          <div className="step">

            <div className="step-number">
              2
            </div>

            <h3>
              Generate Your Plan
            </h3>

            <p>
              StudyPilot creates milestones,
              topics, and manageable missions.
            </p>

          </div>

          <div className="step">

            <div className="step-number">
              3
            </div>

            <h3>
              Complete Missions
            </h3>

            <p>
              Complete tasks, earn progress,
              and move closer to your learning goal.
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          FEATURES
          ================================================= */}

      <section className="features">

        <div className="feature">

          <div className="feature-icon">
            ✦
          </div>

          <h3>
            Personalized Plans
          </h3>

          <p>
            Plans based on your goal,
            skill level, deadline,
            and available time.
          </p>

        </div>

        <div className="feature">

          <div className="feature-icon">
            🎯
          </div>

          <h3>
            Learning Missions
          </h3>

          <p>
            Turn a broad goal into
            achievable daily missions.
          </p>

        </div>

        <div className="feature">

          <div className="feature-icon">
            📈
          </div>

          <h3>
            Track Progress
          </h3>

          <p>
            Complete missions and watch
            your learning journey grow.
          </p>

        </div>

      </section>


      {/* =================================================
          FINAL CTA
          ================================================= */}

      <section className="final-cta">

        <div className="final-mascot">
          🚀
        </div>

        <h2>
          Ready to start your learning journey?
        </h2>

        <p>
          Set your goal and let StudyPilot
          build the roadmap.
        </p>

        <button
          type="button"
          className="primary-button"
          onClick={() => navigate("/signup")}
        >
          🚀 Create My Study Plan
        </button>

      </section>

    </div>
  );
}


function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/onboarding"
          element={<Onboarding />}
        />

        <Route
          path="/plan"
          element={<Plan />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/current-plans"
          element={<CurrentPlans />}
        />
        <Route
  path="/insights"
  element={<Insights />}
/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;