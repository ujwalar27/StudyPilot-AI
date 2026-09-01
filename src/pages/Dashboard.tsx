import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import Piko from "../components/Piko";
import PageNavigation from "../components/PageNavigation";

/* =========================================================
   TYPES
   ========================================================= */

type Task = {
  day: number;
  title: string;
  description: string;
  duration: string;
  type: string;
  milestone: string;
  id?: string | number;
  completed?: boolean;
  isCompleted?: boolean;
};

type Milestone = {
  title: string;
  description: string;
  order: number;
};

type SavedPlan = {
  id: string;
  goal: string;
  skillLevel: string;
  deadline: string;
  studyTime: string;
  title: string;
  summary: string;
  milestones: Milestone[];
  tasks: Task[];
  createdAt: string;
};

type TaskEntry = Task & {
  originalIndex: number;
};

/* =========================================================
   STORAGE KEYS
   ========================================================= */

const PLANS_KEY = "studypilot_plans";
const ACTIVE_PLAN_KEY = "studypilot_active_plan_id";
const OLD_PLAN_KEY = "studypilot_plan";

/* =========================================================
   TASK ID
   IMPORTANT:
   CurrentPlans.tsx uses the exact same logic.
   ========================================================= */

const getTaskId = (
  task: Task,
  index: number
) => {
  return `${task.day}-${index}-${task.title}`;
};

/* =========================================================
   READ PLANS
   ========================================================= */

const readPlans = (): SavedPlan[] => {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(PLANS_KEY) || "[]"
    );

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
};

/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [plan, setPlan] =
    useState<SavedPlan | null>(null);

  const [completedTasks, setCompletedTasks] =
    useState<string[]>([]);

  const [loaded, setLoaded] =
    useState(false);

  /* =========================================================
     LOAD ACTIVE / REQUESTED PLAN
     ========================================================= */

  const loadDashboard = () => {
    try {
      const plans = readPlans();

      /*
       * If Current Plans / Insights sends a planId,
       * use that plan first.
       */

      const requestedPlanId =
        location.state?.planId;

      const storedActiveId =
        localStorage.getItem(
          ACTIVE_PLAN_KEY
        );

      const activeId =
        requestedPlanId ||
        storedActiveId;

      let active: SavedPlan | null =
        activeId
          ? plans.find(
              (item) =>
                String(item.id) ===
                String(activeId)
            ) || null
          : null;

      /*
       * If no active plan exists,
       * use the newest saved plan.
       */

      if (!active && plans.length) {
        active =
          plans[plans.length - 1];
      }

      /*
       * Backwards compatibility.
       */

      if (!active) {
        const old =
          localStorage.getItem(
            OLD_PLAN_KEY
          );

        if (old) {
          try {
            active =
              JSON.parse(
                old
              ) as SavedPlan;
          } catch {
            active = null;
          }
        }
      }

      /*
       * Make the selected plan the
       * actual active plan.
       */

      if (active?.id) {
        localStorage.setItem(
          ACTIVE_PLAN_KEY,
          String(active.id)
        );
      }

      setPlan(active);

      /*
       * Load progress ONLY for this plan.
       */

      if (active?.id) {
        const saved =
          localStorage.getItem(
            `studypilot_completed_tasks_${active.id}`
          );

        try {
          const parsed =
            saved
              ? JSON.parse(saved)
              : [];

          setCompletedTasks(
            Array.isArray(parsed)
              ? parsed
              : []
          );
        } catch {
          setCompletedTasks([]);
        }
      } else {
        setCompletedTasks([]);
      }
    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );

      setPlan(null);
      setCompletedTasks([]);
    } finally {
      setLoaded(true);
    }
  };

  /* =========================================================
     INITIAL LOAD + REFRESH
     ========================================================= */

  useEffect(() => {
    loadDashboard();

    const refresh = () =>
      loadDashboard();

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

    /*
     * location.state is intentionally included
     * so opening another plan refreshes Dashboard.
     */

  }, [location.state]);

  /* =========================================================
     SAVE PROGRESS
     ========================================================= */

  useEffect(() => {
    if (
      !loaded ||
      !plan?.id
    ) {
      return;
    }

    localStorage.setItem(
      `studypilot_completed_tasks_${plan.id}`,
      JSON.stringify(
        completedTasks
      )
    );
  }, [
    completedTasks,
    plan,
    loaded,
  ]);

  /* =========================================================
     COURSE PROGRESS
     ========================================================= */

  const totalTasks =
    plan?.tasks?.length || 0;

  /*
   * Only count completed IDs that
   * actually belong to this plan.
   */

  const completedCount =
    plan?.tasks
      ? plan.tasks.filter(
          (task, index) =>
            completedTasks.includes(
              getTaskId(
                task,
                index
              )
            )
        ).length
      : 0;

  const progress =
    totalTasks > 0
      ? Math.min(
          100,
          Math.round(
            (completedCount /
              totalTasks) *
              100
          )
        )
      : 0;

  /* =========================================================
     XP
     ========================================================= */

  const xp =
    completedCount * 20;

  const level =
    Math.floor(
      xp / 100
    ) + 1;

  const xpToNext =
    xp % 100;

  const finished =
    totalTasks > 0 &&
    completedCount >=
      totalTasks;

  /* =========================================================
     GROUP TASKS BY DAY
     ========================================================= */

  const groupedTasks =
    useMemo(() => {
      const groups: Record<
        number,
        TaskEntry[]
      > = {};

      if (!plan?.tasks) {
        return groups;
      }

      plan.tasks.forEach(
        (
          task,
          index
        ) => {
          if (!groups[task.day]) {
            groups[task.day] = [];
          }

          groups[task.day].push({
            ...task,
            originalIndex:
              index,
          });
        }
      );

      return groups;
    }, [plan]);

  /* =========================================================
     TOGGLE TASK
     ========================================================= */

  const toggleTask = (
    task: TaskEntry
  ) => {
    const id =
      getTaskId(
        task,
        task.originalIndex
      );

    setCompletedTasks(
      (current) =>
        current.includes(id)
          ? current.filter(
              (item) =>
                item !== id
            )
          : [
              ...current,
              id,
            ]
    );
  };

  /* =========================================================
     DATE
     ========================================================= */

  const formatDate = (
    value: string
  ) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(
        `${value}T00:00:00`
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
     EMPTY STATE
     ========================================================= */

  if (!plan) {
    return (
      <div className="empty-page">
        <div className="empty-card">

          <Piko
            size="large"
            message="Your first learning mission is waiting."
          />

          <p className="eyebrow">
            STUDYPILOT AI
          </p>

          <h1>
            No active study plan
          </h1>

          <p>
            Create a learning plan
            and start your journey
            with Piko.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              navigate(
                "/onboarding"
              )
            }
          >
            🚀 Create Study Plan
          </button>

        </div>
      </div>
    );
  }

  /* =========================================================
     DAYS
     ========================================================= */

  const days =
    Object.keys(
      groupedTasks
    )
      .map(Number)
      .sort(
        (a, b) =>
          a - b
      );

  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <div className="dashboard-page">

      <PageNavigation />

      <div className="dashboard-container">

        {/* =================================================
            HEADER
            ================================================= */}

        <header className="dashboard-header">

          <div className="dashboard-heading-wrap">

            <button
              className="auth-logo dashboard-logo"
              onClick={() =>
                navigate("/")
              }
            >
              🚀 StudyPilot AI
            </button>

            <p className="eyebrow">
              YOUR LEARNING COMMAND CENTER
            </p>

            <h1>
              Keep making progress.
            </h1>

            <p className="dashboard-subtitle">
              Every mission completed
              moves you closer to
              mastering {plan.goal}.
            </p>

          </div>

          <div className="dashboard-actions">

            <button
              className="secondary-button"
              onClick={() =>
                navigate(
                  "/current-plans"
                )
              }
            >
              Current Plans
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
            PLAYER BAR
            ================================================= */}

        <section className="player-bar">

          <div className="player-avatar">
            🚀
          </div>

          <div className="player-info">

            <strong>
              Learning Explorer
            </strong>

            <span>
              Level {level}
            </span>

          </div>

          <div className="level-progress">

            <div className="level-progress-top">

              <span>
                XP
              </span>

              <strong>
                {xpToNext} / 100
              </strong>

            </div>

            <div className="level-progress-track">

              <div
                className="level-progress-fill"
                style={{
                  width:
                    `${xpToNext}%`,
                }}
              />

            </div>

          </div>

          <div className="player-stat">

            <span>
              🔥
            </span>

            <strong>
              {completedCount}
            </strong>

            <small>
              missions
            </small>

          </div>

          <div className="player-stat">

            <span>
              🎯
            </span>

            <strong>
              {progress}%
            </strong>

            <small>
              progress
            </small>

          </div>

        </section>

        {/* =================================================
            MAIN GRID
            ================================================= */}

        <div className="dashboard-grid">

          <main className="dashboard-main">

            {/* =================================================
                CURRENT MISSION
                ================================================= */}

            <section className="dashboard-card goal-card">

              <div className="goal-top">

                <div>

                  <p className="card-label">
                    CURRENT MISSION
                  </p>

                  <h2>
                    {plan.goal}
                  </h2>

                  <p className="goal-description">
                    {finished
                      ? "You completed this learning journey!"
                      : "Complete today's missions and earn XP to level up."}
                  </p>

                </div>

                <strong className="goal-percent">
                  {progress}%
                </strong>

              </div>

              <div className="progress-bar large-progress">

                <div
                  className="progress-fill"
                  style={{
                    width:
                      `${progress}%`,
                  }}
                />

              </div>

              <div className="goal-tags">

                <span>
                  🎓 {plan.skillLevel}
                </span>

                <span>
                  📅 {formatDate(
                    plan.deadline
                  )}
                </span>

                <span>
                  ⏱ {plan.studyTime} daily
                </span>

              </div>

            </section>

            {/* =================================================
                LEARNING ROADMAP
                ================================================= */}

            <section className="dashboard-card roadmap-card">

              <div className="roadmap-header">

                <div>

                  <p className="card-label">
                    YOUR JOURNEY
                  </p>

                  <h2>
                    Learning roadmap
                  </h2>

                  <p>
                    Follow the path
                    one mission at a time.
                  </p>

                </div>

                <div className="roadmap-progress-info">

                  <strong>
                    {progress}%
                  </strong>

                  <span>
                    {completedCount} /{" "}
                    {totalTasks} missions
                  </span>

                </div>

              </div>

              <div className="roadmap-progress-bar">

                <div
                  className="roadmap-progress-fill"
                  style={{
                    width:
                      `${progress}%`,
                  }}
                />

              </div>

              <div className="roadmap-days">

                {days.map(
                  (day) => {

                    const tasks =
                      groupedTasks[
                        day
                      ];

                    const dayCompleted =
                      tasks.filter(
                        (task) =>
                          completedTasks.includes(
                            getTaskId(
                              task,
                              task.originalIndex
                            )
                          )
                      ).length;

                    const dayProgress =
                      tasks.length
                        ? Math.round(
                            (dayCompleted /
                              tasks.length) *
                              100
                          )
                        : 0;

                    return (

                      <section
                        className="day-section"
                        key={day}
                      >

                        <div className="day-header">

                          <div
                            className={`day-number-large ${
                              dayProgress ===
                              100
                                ? "complete"
                                : ""
                            }`}
                          >
                            {dayProgress ===
                            100
                              ? "✓"
                              : day}
                          </div>

                          <div className="day-heading">

                            <div className="day-title-row">

                              <span className="day-label">
                                DAY {day}
                              </span>

                              {dayProgress ===
                                100 && (
                                <span className="completed-badge">
                                  COMPLETED
                                </span>
                              )}

                            </div>

                            <h3>

                              {day === 1
                                ? "Start the journey"
                                : day ===
                                  days[
                                    days.length -
                                      1
                                  ]
                                  ? "Finish strong"
                                  : "Continue your journey"}

                            </h3>

                          </div>

                          <span className="day-count">
                            {dayCompleted}/
                            {tasks.length}
                          </span>

                        </div>

                        <div className="day-tasks">

                          {tasks.map(
                            (task) => {

                              const taskId =
                                getTaskId(
                                  task,
                                  task.originalIndex
                                );

                              const completed =
                                completedTasks.includes(
                                  taskId
                                );

                              return (

                                <div
                                  className={`dashboard-task ${
                                    completed
                                      ? "completed-task"
                                      : ""
                                  }`}
                                  key={taskId}
                                >

                                  <button
                                    className={`task-checkbox ${
                                      completed
                                        ? "checked"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      toggleTask(
                                        task
                                      )
                                    }
                                    aria-label={
                                      completed
                                        ? `Mark ${task.title} incomplete`
                                        : `Mark ${task.title} complete`
                                    }
                                  >
                                    {completed
                                      ? "✓"
                                      : ""}
                                  </button>

                                  <div className="dashboard-task-content">

                                    <div className="dashboard-task-title">

                                      <h4>
                                        {task.title}
                                      </h4>

                                      <span className="task-type">
                                        {task.type}
                                      </span>

                                    </div>

                                    <p>
                                      {task.description}
                                    </p>

                                    <div className="task-meta">

                                      <span>
                                        ◷{" "}
                                        {task.duration}
                                      </span>

                                      <span>
                                        {task.milestone}
                                      </span>

                                      {completed && (
                                        <span className="task-completed-text">
                                          ✓ Completed · +20 XP
                                        </span>
                                      )}

                                    </div>

                                  </div>

                                </div>

                              );
                            }
                          )}

                        </div>

                      </section>

                    );
                  }
                )}

              </div>

            </section>

            {/* =================================================
                COMPLETION
                ================================================= */}

            {finished && (

              <section className="mission-complete-card">

                <div className="completion-icon">
                  🏆
                </div>

                <div>

                  <p className="card-label">
                    JOURNEY COMPLETE
                  </p>

                  <h2>
                    You did it!
                  </h2>

                  <p>
                    You completed all{" "}
                    {totalTasks} missions
                    and earned {xp} XP.
                  </p>

                </div>

                <button
                  className="primary-button"
                  onClick={() =>
                    navigate(
                      "/onboarding"
                    )
                  }
                >
                  Start Another Plan
                </button>

              </section>

            )}

          </main>

          {/* =================================================
              SIDEBAR
              ================================================= */}

          <aside className="dashboard-sidebar">

            <div className="stat-card">

              <span className="stat-label">
                LEVEL
              </span>

              <strong className="stat-big">
                {level}
              </strong>

              <p>
                Learning Explorer
              </p>

              <small>
                {xpToNext} / 100 XP
                to next level
              </small>

            </div>

            <div className="stat-card">

              <span className="stat-label">
                XP EARNED
              </span>

              <strong className="stat-big">
                {xp}
              </strong>

              <p>
                Keep completing
                missions.
              </p>

            </div>

            <div className="stat-card">

              <span className="stat-label">
                STUDY HABIT
              </span>

              <strong className="stat-big">
                {plan.studyTime}
              </strong>

              <p>
                Your planned daily
                study time.
              </p>

            </div>

            <div className="stat-card">

              <span className="stat-label">
                PROGRESS
              </span>

              <strong className="stat-big">
                {completedCount}/
                {totalTasks}
              </strong>

              <p>
                missions completed
              </p>

            </div>

            <div className="guide-card">

              <Piko
                size="small"
                message={
                  finished
                    ? "Mission complete! 🎉"
                    : progress >= 50
                      ? "You're on a roll. Keep going!"
                      : "Small steps make big progress."
                }
              />

            </div>

          </aside>

        </div>

        <footer className="dashboard-footer">

          <span>
            StudyPilot AI · Learn smarter,
            one mission at a time.
          </span>

          <span>
            Progress is saved automatically.
          </span>

        </footer>

      </div>

    </div>
  );
}

export default Dashboard;