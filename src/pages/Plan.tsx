import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

/* =========================================================
   TYPES
========================================================= */

type PlanData = {
  goal: string;
  skillLevel: string;
  deadline: string;
  studyTime: string;
};

type Task = {
  day: number;
  title: string;
  description: string;
  duration: string;
  type: string;
  milestone: string;
};

type Milestone = {
  title: string;
  description: string;
  order: number;
};

type GeneratedPlan = {
  title: string;
  summary: string;
  milestones: Milestone[];
  tasks: Task[];
};

export type SavedPlan = PlanData & {
  id: string;
  title: string;
  summary: string;
  milestones: Milestone[];
  tasks: Task[];
  createdAt: string;
};

/* =========================================================
   STORAGE KEYS
========================================================= */

const PLANS_KEY = "studypilot_plans";
const ACTIVE_PLAN_KEY = "studypilot_active_plan_id";

/* =========================================================
   API URL
========================================================= */

/*
  Local development:
  VITE_API_URL=http://localhost:5000

  Production:
  VITE_API_URL=https://studypilot-ai-api-kp87.onrender.com

  The production fallback is intentionally set to the
  deployed backend so the live application does not
  accidentally call localhost.
*/

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://studypilot-ai-api-kp87.onrender.com";

/* =========================================================
   GET SAVED PLANS
========================================================= */

const getSavedPlans = (): SavedPlan[] => {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(PLANS_KEY) || "[]"
    );

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/* =========================================================
   SET ACTIVE PLAN
========================================================= */

const setActivePlan = (plan: SavedPlan) => {
  localStorage.setItem(
    ACTIVE_PLAN_KEY,
    plan.id
  );

  /*
    Keep the old key for backwards compatibility
    with older StudyPilot data.
  */

  localStorage.setItem(
    "studypilot_plan",
    JSON.stringify(plan)
  );
};

/* =========================================================
   PLAN COMPONENT
========================================================= */

function Plan() {
  const navigate = useNavigate();
  const location = useLocation();

  /*
    The onboarding page sends PlanData here.

    When an existing saved plan is opened from
    Current Plans, the same location state contains
    the complete SavedPlan.
  */

  const data = location.state as PlanData | null;

  const [plan, setPlan] =
    useState<GeneratedPlan | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
    If a previously saved plan was opened from
    Current Plans, display that plan instead of
    generating a new one.
  */

  const existingPlan =
    location.state as SavedPlan | null;

  const isSavedPlan =
    existingPlan &&
    "id" in existingPlan &&
    "tasks" in existingPlan &&
    "milestones" in existingPlan;

  /* =======================================================
     GENERATE PLAN
  ======================================================= */

  const generatePlan = async () => {
    if (!data) {
      setError(
        "No learning goal was provided."
      );

      setLoading(false);

      return;
    }

    try {
      setLoading(true);
      setError("");

      /*
        IMPORTANT:
        Use the deployed API URL in production.

        Local:
        http://localhost:5000/api/generate-plan

        Production:
        https://studypilot-ai-api-kp87.onrender.com/api/generate-plan
      */

      const response = await fetch(
        `${API_URL}/api/generate-plan`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            goal: data.goal,
            skillLevel:
              data.skillLevel,
            deadline:
              data.deadline,
            studyTime:
              data.studyTime,
          }),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to generate study plan."
        );
      }

      setPlan(result.plan);
    } catch (err) {
      console.error(
        "Plan generation error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate study plan."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     LOAD PLAN
  ======================================================= */

  useEffect(() => {
    /*
      Existing plans must become the active plan
      immediately.

      This is important when the user switches
      between Python, SQL, or another saved plan.
    */

    if (isSavedPlan) {
      setActivePlan(existingPlan);

      setPlan({
        title:
          existingPlan.title,

        summary:
          existingPlan.summary,

        milestones:
          existingPlan.milestones,

        tasks:
          existingPlan.tasks,
      });

      setLoading(false);

      return;
    }

    generatePlan();

    /*
      This effect intentionally runs once when
      the Plan page opens.
    */

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =======================================================
     NO DATA
  ======================================================= */

  if (!data) {
    return (
      <div className="empty-page">
        <div className="empty-card">

          <div className="mascot mascot-small">
            🚀
          </div>

          <h1>
            No study goal found
          </h1>

          <p>
            Please create your learning
            goal before generating a
            study plan.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              navigate("/onboarding")
            }
          >
            Create Learning Goal
          </button>

        </div>
      </div>
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="loading-page">

        <div className="loading-card">

          <div className="loading-mascot">
            <div className="mascot-orbit">
              🚀
            </div>
          </div>

          <p className="eyebrow">
            STUDYPILOT AI
          </p>

          <h1>
            Building your study plan...
          </h1>

          <p>
            StudyPilot is designing a
            learning journey around
            your goal.
          </p>

          <div className="loading-details">

            <div>
              <span className="loading-dot"></span>
              Analyzing learning goal
            </div>

            <div>
              <span className="loading-dot"></span>
              Creating milestones
            </div>

            <div>
              <span className="loading-dot"></span>
              Planning daily missions
            </div>

          </div>

        </div>

      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="empty-page">

        <div className="empty-card">

          <div className="mascot mascot-small">
            🚀
          </div>

          <p className="eyebrow">
            SOMETHING WENT WRONG
          </p>

          <h1>
            We couldn't generate your plan.
          </h1>

          <p>
            {error}
          </p>

          <div className="error-actions">

            <button
              className="secondary-button"
              onClick={() =>
                navigate("/onboarding")
              }
            >
              Edit Goal
            </button>

            <button
              className="primary-button"
              onClick={generatePlan}
            >
              Try Again
            </button>

          </div>

        </div>

      </div>
    );
  }

  /* =======================================================
     SAFETY CHECK
  ======================================================= */

  if (!plan) {
    return null;
  }

  /* =======================================================
     FORMAT DEADLINE
  ======================================================= */

  const formattedDeadline =
    new Date(
      data.deadline + "T00:00:00"
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );

  /* =======================================================
     APPROVE & SAVE PLAN
  ======================================================= */

  const handleApprove = () => {
    const newPlan: SavedPlan = {
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`,

      goal: data.goal,

      skillLevel:
        data.skillLevel,

      deadline:
        data.deadline,

      studyTime:
        data.studyTime,

      title:
        plan.title,

      summary:
        plan.summary,

      milestones:
        plan.milestones,

      tasks:
        plan.tasks,

      createdAt:
        new Date().toISOString(),
    };

    /*
      Get ALL previously saved plans.
    */

    const existingPlans =
      getSavedPlans();

    /*
      Add the new plan without
      overwriting older plans.
    */

    const updatedPlans = [
      ...existingPlans,
      newPlan,
    ];

    localStorage.setItem(
      PLANS_KEY,
      JSON.stringify(updatedPlans)
    );

    /*
      This newly-created plan becomes
      the active plan.
    */

    setActivePlan(newPlan);

    /*
      Every plan has its own progress key.

      This prevents progress from one
      course being carried into another.
    */

    localStorage.setItem(
      `studypilot_completed_tasks_${newPlan.id}`,
      JSON.stringify([])
    );

    /*
      Go to Dashboard.
    */

    navigate("/dashboard");
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="plan-page">

      <div className="plan-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="plan-top">

          <div>

            <div className="plan-brand">
              🚀 StudyPilot AI
            </div>

            <p className="eyebrow">
              YOUR PERSONALIZED PLAN
            </p>

            <h1>
              {plan.title}
            </h1>

            <p className="plan-description">
              {plan.summary}
            </p>

          </div>

          <button
            className="secondary-button"
            onClick={() =>
              navigate("/onboarding")
            }
          >
            Edit Goal
          </button>

        </div>

        {/* =================================================
            PLAN SUMMARY
        ================================================= */}

        <div className="plan-summary">

          <div className="summary-item">

            <span>
              Learning Goal
            </span>

            <strong>
              {data.goal}
            </strong>

          </div>

          <div className="summary-item">

            <span>
              Skill Level
            </span>

            <strong>
              {data.skillLevel}
            </strong>

          </div>

          <div className="summary-item">

            <span>
              Deadline
            </span>

            <strong>
              {formattedDeadline}
            </strong>

          </div>

          <div className="summary-item">

            <span>
              Daily Study Time
            </span>

            <strong>
              {data.studyTime}
            </strong>

          </div>

        </div>

        {/* =================================================
            LEARNING ROADMAP
        ================================================= */}

        <div className="plan-card">

          <div className="plan-card-header">

            <div>

              <p className="card-label">
                LEARNING ROADMAP
              </p>

              <h2>
                Learning milestones
              </h2>

            </div>

            <span className="ai-badge">
              ✦ AI Generated
            </span>

          </div>

          <div className="milestone-list">

            {plan.milestones.map(
              (milestone) => (

                <div
                  className="milestone"
                  key={
                    milestone.order
                  }
                >

                  <div className="milestone-number">
                    {milestone.order}
                  </div>

                  <div>

                    <h3>
                      {milestone.title}
                    </h3>

                    <p>
                      {milestone.description}
                    </p>

                  </div>

                </div>
              )
            )}

          </div>

        </div>

        {/* =================================================
            DAILY MISSIONS
        ================================================= */}

        <div className="plan-card">

          <div className="plan-card-header">

            <div>

              <p className="card-label">
                DAILY MISSIONS
              </p>

              <h2>
                Your learning journey
              </h2>

            </div>

          </div>

          <div className="task-list">

            {plan.tasks.map(
              (task, index) => (

                <div
                  className="plan-task"
                  key={`${task.day}-${index}`}
                >

                  <div className="task-number">
                    {task.day}
                  </div>

                  <div className="task-content">

                    <div className="task-title-row">

                      <h3>
                        {task.title}
                      </h3>

                      <span className="task-type">
                        {task.type}
                      </span>

                    </div>

                    <p>
                      {task.description}
                    </p>

                    <span className="task-duration">
                      ⏱ {task.duration}
                    </span>

                  </div>

                </div>
              )
            )}

          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="plan-actions">

            {!isSavedPlan && (
              <button
                className="secondary-button"
                onClick={
                  generatePlan
                }
              >
                Regenerate Plan
              </button>
            )}

            {!isSavedPlan && (
              <button
                className="primary-button"
                onClick={
                  handleApprove
                }
              >
                🚀 Approve & Save Plan
              </button>
            )}

            {isSavedPlan && (
              <button
                className="primary-button"
                onClick={() =>
                  navigate(
                    "/dashboard"
                  )
                }
              >
                Continue Learning →
              </button>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default Plan;