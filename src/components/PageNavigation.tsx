import { useLocation, useNavigate } from "react-router-dom";

function PageNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <nav className="page-navigation">

      {/* BRAND / HOME */}
      <button
        type="button"
        className="page-navigation-brand"
        onClick={() => navigate("/")}
        aria-label="Go to StudyPilot AI home"
      >
        🚀 StudyPilot AI
      </button>


      {/* NAVIGATION */}
      <div className="page-navigation-actions">

        <button
          type="button"
          className={`page-navigation-button ${
            currentPath === "/" ? "active" : ""
          }`}
          onClick={() => navigate("/")}
        >
          🏠 Home
        </button>


        <button
          type="button"
          className={`page-navigation-button ${
            currentPath === "/dashboard" ? "active" : ""
          }`}
          onClick={() => navigate("/dashboard")}
        >
          📊 Dashboard
        </button>


        <button
          type="button"
          className={`page-navigation-button ${
            currentPath === "/current-plans" ? "active" : ""
          }`}
          onClick={() => navigate("/current-plans")}
        >
          📚 Current Plans
        </button>


        <button
          type="button"
          className={`page-navigation-button ${
            currentPath === "/insights" ? "active" : ""
          }`}
          onClick={() => navigate("/insights")}
        >
          📈 Insights
        </button>


        <button
          type="button"
          className="page-navigation-create"
          onClick={() => navigate("/onboarding")}
        >
          + New Plan
        </button>

      </div>

    </nav>
  );
}

export default PageNavigation;