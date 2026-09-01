import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import PageNavigation from "../components/PageNavigation";

/* =========================================================
   TYPES
   ========================================================= */

type Task = {
  id?: string | number;
  title?: string;
  name?: string;
  completed?: boolean;
  isCompleted?: boolean;
  day?: number;
};

type StudyPlan = {
  id?: string | number;

  title?: string;
  name?: string;

  goal?: string;

  skillLevel?: string;
  level?: string;

  deadline?: string;

  studyTime?: string;
  dailyTime?: string;

  description?: string;
  summary?: string;

  createdAt?: string;
  created?: string;

  tasks?: Task[];

  roadmap?: Task[];

  days?: {
    tasks?: Task[];
  }[];
};

/* =========================================================
   STORAGE
   ========================================================= */

const PLANS_KEY =
  "studypilot_plans";

const ACTIVE_PLAN_KEY =
  "studypilot_active_plan_id";

/* =========================================================
   GET NORMALIZED TASKS
   ========================================================= */

const getTasks = (
  plan: StudyPlan
): Task[] => {

  if (
    Array.isArray(
      plan.tasks
    )
  ) {
    return plan.tasks;
  }

  if (
    Array.isArray(
      plan.roadmap
    )
  ) {
    return plan.roadmap;
  }

  if (
    Array.isArray(
      plan.days
    )
  ) {
    return plan.days.flatMap(
      (day, dayIndex) =>
        Array.isArray(
          day.tasks
        )
          ? day.tasks.map(
              (task) => ({
                ...task,
                day:
                  task.day ??
                  dayIndex + 1,
              })
            )
          : []
    );
  }

  return [];
};

/* =========================================================
   EXACT SAME TASK ID LOGIC AS DASHBOARD
   ========================================================= */

const getTaskId = (
  task: Task,
  index: number
) => {

  return `${task.day ?? 0}-${
    index
  }-${
    task.title ||
    task.name ||
    "task"
  }`;

};

/* =========================================================
   DATE
   ========================================================= */

const formatDate = (
  value?: string
) => {

  if (!value) {
    return "—";
  }

  const date =
    new Date(
      value.includes("T")
        ? value
        : `${value}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

/* =========================================================
   GET SAVED PROGRESS
   ========================================================= */

const getSavedProgress = (
  plan: StudyPlan
) => {

  const tasks =
    getTasks(plan);

  const total =
    tasks.length;

  if (!plan.id) {
    return {
      completed: 0,
      total,
      percentage: 0,
    };
  }

  try {

    const stored =
      JSON.parse(
        localStorage.getItem(
          `studypilot_completed_tasks_${plan.id}`
        ) || "[]"
      );

    const completedIds =
      Array.isArray(stored)
        ? stored
        : [];

    /*
     * Count only tasks that belong
     * to THIS plan.
     */

    const completed =
      tasks.filter(
        (
          task,
          index
        ) => {

          /*
           * Support existing
           * completed flags.
           */

          if (
            task.completed ||
            task.isCompleted
          ) {
            return true;
          }

          /*
           * Support explicit task IDs
           * if they are used.
           */

          if (
            task.id !==
            undefined &&
            completedIds.some(
              (id) =>
                String(id) ===
                String(task.id)
            )
          ) {
            return true;
          }

          /*
           * Main progress logic.
           * Must match Dashboard.
           */

          return completedIds.some(
            (id) =>
              String(id) ===
              getTaskId(
                task,
                index
              )
          );
        }
      ).length;

    return {

      completed,

      total,

      percentage:
        total > 0
          ? Math.min(
              100,
              Math.round(
                (completed /
                  total) *
                  100
              )
            )
          : 0,

    };

  } catch {

    return {

      completed: 0,

      total,

      percentage: 0,

    };

  }

};

/* =========================================================
   CURRENT PLANS
   ========================================================= */

function CurrentPlans() {

  const navigate =
    useNavigate();

  const [plans, setPlans] =
    useState<
      StudyPlan[]
    >([]);

  const [activeId, setActiveId] =
    useState<
      string | null
    >(null);

  /* =========================================================
     LOAD PLANS
     ========================================================= */

  const loadPlans = () => {

    try {

      const parsed =
        JSON.parse(
          localStorage.getItem(
            PLANS_KEY
          ) || "[]"
        );

      const savedPlans =
        Array.isArray(parsed)
          ? parsed
          : [];

      setPlans(
        savedPlans
      );

      setActiveId(
        localStorage.getItem(
          ACTIVE_PLAN_KEY
        )
      );

    } catch {

      setPlans([]);

      setActiveId(null);

    }

  };

  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(() => {

    loadPlans();

    const refresh =
      () => loadPlans();

    window.addEventListener(
      "focus",
      refresh
    );

    window.addEventListener(
      "storage",
      refresh
    );

    return () => {

      window.removeEventListener(
        "focus",
        refresh
      );

      window.removeEventListener(
        "storage",
        refresh
      );

    };

  }, []);

  /* =========================================================
     OPEN PLAN
     ========================================================= */

  const handleOpenPlan = (
    plan: StudyPlan
  ) => {

    if (!plan.id) {
      return;
    }

    const id =
      String(plan.id);

    /*
     * Make THIS plan the active plan.
     */

    localStorage.setItem(
      ACTIVE_PLAN_KEY,
      id
    );

    /*
     * Backwards compatibility.
     */

    localStorage.setItem(
      "studypilot_plan",
      JSON.stringify(plan)
    );

    /*
     * Update UI immediately.
     */

    setActiveId(id);

    /*
     * Send plan ID to Dashboard.
     * Dashboard will load the exact plan.
     */

    navigate(
      "/dashboard",
      {
        state: {
          planId: id,
        },
      }
    );

  };

  /* =========================================================
     REMOVE PLAN
     ========================================================= */

  const handleRemove = (
    plan: StudyPlan
  ) => {

    const confirmed =
      window.confirm(
        "Remove this study plan? Your saved progress for this plan will also be removed."
      );

    if (!confirmed) {
      return;
    }

    const updated =
      plans.filter(
        (item) =>
          String(item.id) !==
          String(plan.id)
      );

    localStorage.setItem(
      PLANS_KEY,
      JSON.stringify(
        updated
      )
    );

    /*
     * Delete ONLY this plan's progress.
     */

    if (plan.id) {

      localStorage.removeItem(
        `studypilot_completed_tasks_${plan.id}`
      );

    }

    /*
     * If the removed plan was active,
     * select another available plan.
     */

    const wasActive =
      String(activeId) ===
      String(plan.id);

    if (wasActive) {

      if (updated.length > 0) {

        const nextPlan =
          updated[
            updated.length - 1
          ];

        if (nextPlan.id) {

          localStorage.setItem(
            ACTIVE_PLAN_KEY,
            String(
              nextPlan.id
            )
          );

          localStorage.setItem(
            "studypilot_plan",
            JSON.stringify(
              nextPlan
            )
          );

          setActiveId(
            String(
              nextPlan.id
            )
          );

        }

      } else {

        localStorage.removeItem(
          ACTIVE_PLAN_KEY
        );

        localStorage.removeItem(
          "studypilot_plan"
        );

        setActiveId(null);

      }

    }

    setPlans(
      updated
    );

  };

  /* =========================================================
     AVERAGE PROGRESS
     ========================================================= */

  const averageProgress =
    plans.length > 0
      ? Math.round(
          plans.reduce(
            (
              sum,
              plan
            ) =>
              sum +
              getSavedProgress(
                plan
              ).percentage,
            0
          ) /
          plans.length
        )
      : 0;

  /* =========================================================
     ACTIVE PLAN
     ========================================================= */

  const activePlan =
    plans.find(
      (plan) =>
        String(plan.id) ===
        String(activeId)
    );

  /* =========================================================
     PAGE
     ========================================================= */

  return (

    <div className="current-plans-page">

      <PageNavigation />

      <div className="current-plans-container">

        {/* =================================================
            HEADER
            ================================================= */}

        <header className="current-plans-header">

          <div className="current-plans-heading">

            <p className="section-tag">
              YOUR LEARNING LIBRARY
            </p>

            <h1>
              Current Plans
            </h1>

            <p>
              All your learning journeys,
              organized in one place.
            </p>

          </div>

          <div className="current-plans-actions">

            <button
              className="secondary-button"
              onClick={() =>
                navigate("/")
              }
            >
              ← Home
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                navigate(
                  "/dashboard"
                )
              }
            >
              Dashboard
            </button>

            <button
              className="primary-button"
              onClick={() =>
                navigate(
                  "/onboarding"
                )
              }
            >
              + Create New Plan
            </button>

          </div>

        </header>

        {/* =================================================
            EMPTY STATE
            ================================================= */}

        {plans.length === 0 ? (

          <section className="plans-empty-state">

            <div className="empty-mascot">
              🚀
            </div>

            <p className="section-tag">
              YOUR LEARNING LIBRARY
            </p>

            <h2>
              No study plans yet
            </h2>

            <p>
              Create your first
              personalized study plan
              and start your learning
              journey with Piko.
            </p>

            <button
              className="primary-button"
              onClick={() =>
                navigate(
                  "/onboarding"
                )
              }
            >
              🚀 Create My First Plan
            </button>

          </section>

        ) : (

          <>

            {/* =================================================
                OVERVIEW
                ================================================= */}

            <section className="plans-overview">

              <div className="overview-card">

                <span>
                  TOTAL PLANS
                </span>

                <strong>
                  {plans.length}
                </strong>

                <small>
                  saved journeys
                </small>

              </div>

              <div className="overview-card">

                <span>
                  AVERAGE PROGRESS
                </span>

                <strong>
                  {averageProgress}%
                </strong>

                <div className="overview-progress">

                  <div
                    style={{
                      width:
                        `${averageProgress}%`,
                    }}
                  />

                </div>

              </div>

              <div className="overview-card">

                <span>
                  ACTIVE PLAN
                </span>

                <strong className="overview-active">
                  🚀
                </strong>

                <small>
                  {activePlan?.goal ||
                    "Choose a plan to continue"}
                </small>

              </div>

            </section>

            {/* =================================================
                PLAN LIST
                ================================================= */}

            <div className="current-plans-list">

              {plans.map(
                (
                  plan,
                  index
                ) => {

                  const progress =
                    getSavedProgress(
                      plan
                    );

                  const title =
                    plan.title ||
                    plan.name ||
                    `${plan.goal || "Learning"} Study Plan`;

                  const goal =
                    plan.goal ||
                    "Personalized learning journey";

                  const level =
                    plan.skillLevel ||
                    plan.level ||
                    "Beginner";

                  const dailyTime =
                    plan.studyTime ||
                    plan.dailyTime ||
                    "1 hour";

                  const description =
                    plan.description ||
                    plan.summary ||
                    `A personalized ${goal} study plan built around your goals, skill level, deadline, and available study time.`;

                  const isActive =
                    String(
                      plan.id
                    ) ===
                    String(
                      activeId
                    );

                  return (

                    <article
                      className={`current-plan-card ${
                        isActive
                          ? "active-plan-card"
                          : ""
                      }`}
                      key={
                        String(
                          plan.id ??
                          `${title}-${index}`
                        )
                      }
                    >

                      {/* =================================================
                          PLAN HEADER
                          ================================================= */}

                      <div className="current-plan-main">

                        <div className="current-plan-icon">
                          🚀
                        </div>

                        <div className="current-plan-heading">

                          <div className="plan-title-line">

                            <p className="current-plan-label">
                              PLAN {index + 1}
                            </p>

                            {isActive && (
                              <span className="active-plan-badge">
                                ACTIVE
                              </span>
                            )}

                          </div>

                          <h2>
                            {title}
                          </h2>

                          <p className="current-plan-description">
                            {description}
                          </p>

                        </div>

                      </div>

                      {/* =================================================
                          DETAILS
                          ================================================= */}

                      <div className="current-plan-details">

                        <div className="plan-detail-box">

                          <span>
                            GOAL
                          </span>

                          <strong>
                            {goal}
                          </strong>

                        </div>

                        <div className="plan-detail-box">

                          <span>
                            LEVEL
                          </span>

                          <strong>
                            {level}
                          </strong>

                        </div>

                        <div className="plan-detail-box">

                          <span>
                            DEADLINE
                          </span>

                          <strong>
                            {formatDate(
                              plan.deadline
                            )}
                          </strong>

                        </div>

                        <div className="plan-detail-box">

                          <span>
                            DAILY TIME
                          </span>

                          <strong>
                            {dailyTime}
                          </strong>

                        </div>

                      </div>

                      {/* =================================================
                          PROGRESS
                          ================================================= */}

                      <div className="current-plan-progress-section">

                        <div className="current-plan-progress-heading">

                          <span>
                            COURSE PROGRESS
                          </span>

                          <strong>

                            <b>
                              {progress.percentage}%
                            </b>

                            {" · "}

                            {progress.completed}/
                            {progress.total}

                            {" tasks completed"}

                          </strong>

                        </div>

                        <div
                          className="current-plan-progress"
                          aria-label={`Plan progress: ${progress.percentage}%`}
                        >

                          <div
                            className="current-plan-progress-fill"
                            style={{
                              width:
                                `${progress.percentage}%`,
                            }}
                          />

                        </div>

                      </div>

                      {/* =================================================
                          FOOTER
                          ================================================= */}

                      <div className="current-plan-footer">

                        <span className="current-plan-created">

                          Created{" "}

                          {formatDate(
                            plan.createdAt ||
                            plan.created
                          )}

                        </span>

                        <div className="current-plan-footer-actions">

                          <button
                            className="current-plan-remove"
                            onClick={() =>
                              handleRemove(
                                plan
                              )
                            }
                          >
                            Remove
                          </button>

                          <button
                            className="current-plan-open"
                            onClick={() =>
                              handleOpenPlan(
                                plan
                              )
                            }
                          >

                            {isActive
                              ? "Continue Plan →"
                              : "Open Plan →"}

                          </button>

                        </div>

                      </div>

                    </article>

                  );

                }
              )}

            </div>

          </>

        )}

      </div>

    </div>

  );
}

export default CurrentPlans;