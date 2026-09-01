import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

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

const PLANS_KEY = "studypilot_plans";
const ACTIVE_PLAN_KEY = "studypilot_active_plan_id";

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

const setActivePlan = (plan: SavedPlan) => {
  localStorage.setItem(ACTIVE_PLAN_KEY, plan.id);
  // Keep the old key for backwards compatibility with older data.
  localStorage.setItem("studypilot_plan", JSON.stringify(plan));
};

function Plan() {
  const navigate = useNavigate();
  const location = useLocation();

  const data = location.state as PlanData | null;

  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * If a previously saved plan was opened from Current Plans,
   * display that plan instead of generating a new one.
   */
  const existingPlan = location.state as SavedPlan | null;

  const isSavedPlan =
    existingPlan &&
    "id" in existingPlan &&
    "tasks" in existingPlan &&
    "milestones" in existingPlan;

  const generatePlan = async () => {
    if (!data) {
      setError("No learning goal was provided.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/generate-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            goal: data.goal,
            skillLevel: data.skillLevel,
            deadline: data.deadline,
            studyTime: data.studyTime,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to generate study plan."
        );
      }

      setPlan(result.plan);
    } catch (err) {
      console.error("Plan generation error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate study plan."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    /*
     * Existing plans must become the active plan immediately.
     * This is important when the user switches from Python to SQL
     * (or any other saved plan).
     */
    if (isSavedPlan) {
      setActivePlan(existingPlan);

      setPlan({
        title: existingPlan.title,
        summary: existingPlan.summary,
        milestones: existingPlan.milestones,
        tasks: existingPlan.tasks,
      });

      setLoading(false);
      return;
    }

    generatePlan();
  }, []);

  if (!data) {
    return (
      <div className="empty-page">
        <div className="empty-card">

          <div className="mascot mascot-small">
            🚀
          </div>

          <h1>No study goal found</h1>

          <p>
            Please create your learning goal before generating
            a study plan.
          </p>

          <button
            className="primary-button"
            onClick={() => navigate("/onboarding")}
          >
            Create Learning Goal
          </button>

        </div>
      </div>
    );
  }

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
            StudyPilot is designing a learning journey
            around your goal.
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
              onClick={() => navigate("/onboarding")}
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

  if (!plan) {
    return null;
  }

  const formattedDeadline = new Date(
    data.deadline + "T00:00:00"
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  /*
   * IMPORTANT:
   * Save the plan to an ARRAY instead of replacing
   * "studypilot_plan".
   */
  const handleApprove = () => {
    const newPlan: SavedPlan = {
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`,

      goal: data.goal,
      skillLevel: data.skillLevel,
      deadline: data.deadline,
      studyTime: data.studyTime,

      title: plan.title,
      summary: plan.summary,
      milestones: plan.milestones,
      tasks: plan.tasks,

      createdAt: new Date().toISOString(),
    };

    /*
     * Get ALL previously saved plans.
     */
    const existingPlans = getSavedPlans();

    /*
     * Add the new plan without overwriting older plans.
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
     * This newly-created plan is now the active plan.
     */
    setActivePlan(newPlan);

    /*
     * Each plan has its own progress key, so creating a new plan
     * never deletes or carries over another plan's progress.
     */
    localStorage.setItem(
      `studypilot_completed_tasks_${newPlan.id}`,
      JSON.stringify([])
    );

    /*
     * Go to dashboard.
     */
    navigate("/dashboard");
  };

  return (
    <div className="plan-page">

      <div className="plan-container">

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
            onClick={() => navigate("/onboarding")}
          >
            Edit Goal
          </button>

        </div>

        <div className="plan-summary">

          <div className="summary-item">
            <span>Learning Goal</span>
            <strong>{data.goal}</strong>
          </div>

          <div className="summary-item">
            <span>Skill Level</span>
            <strong>{data.skillLevel}</strong>
          </div>

          <div className="summary-item">
            <span>Deadline</span>
            <strong>{formattedDeadline}</strong>
          </div>

          <div className="summary-item">
            <span>Daily Study Time</span>
            <strong>{data.studyTime}</strong>
          </div>

        </div>

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
                  key={milestone.order}
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

          <div className="plan-actions">

            {!isSavedPlan && (
              <button
                className="secondary-button"
                onClick={generatePlan}
              >
                Regenerate Plan
              </button>
            )}

            {!isSavedPlan && (
              <button
                className="primary-button"
                onClick={handleApprove}
              >
                🚀 Approve & Save Plan
              </button>
            )}

            {isSavedPlan && (
              <button
                className="primary-button"
                onClick={() => navigate("/dashboard")}
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