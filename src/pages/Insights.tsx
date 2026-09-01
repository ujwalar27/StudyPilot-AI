import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageNavigation from "../components/PageNavigation";

/* =========================================================
   TYPES
   ========================================================= */

type Task = {
  id?: string;
  day?: number;
  title?: string;
  description?: string;
  duration?: string;
  type?: string;
  milestone?: string;
};

type Day = {
  day?: number;
  title?: string;
  date?: string;
  tasks?: Task[];
};

type StudyPlan = {
  id: string;
  goal?: string;
  title?: string;
  name?: string;
  days?: Day[];
  tasks?: Task[];
  createdAt?: string;
};

/* =========================================================
   STORAGE
   ========================================================= */

function getSavedPlans(): StudyPlan[] {
  try {
    const raw = localStorage.getItem("studypilot_plans");

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/* =========================================================
   GET PLAN TASKS
   ========================================================= */

function getPlanTasks(plan: StudyPlan): Task[] {
  /*
    If the plan already stores tasks directly,
    use those tasks exactly as they are.
  */

  if (Array.isArray(plan.tasks)) {
    return plan.tasks;
  }

  /*
    If the plan stores tasks inside days,
    preserve the day number on every task.

    This is important because the Dashboard's
    completion ID uses task.day.
  */

  if (Array.isArray(plan.days)) {
    return plan.days.flatMap((day) =>
      Array.isArray(day.tasks)
        ? day.tasks.map((task) => ({
            ...task,
            day:
              task.day !== undefined
                ? task.day
                : day.day,
          }))
        : []
    );
  }

  return [];
}

/* =========================================================
   GET COMPLETED TASK IDS
   ========================================================= */

function getCompletedTaskIds(plan: StudyPlan): string[] {
  try {
    const raw = localStorage.getItem(
      `studypilot_completed_tasks_${plan.id}`
    );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/* =========================================================
   TASK ID

   IMPORTANT:
   This must match the ID used by Dashboard
   when saving completed tasks.

   Dashboard format:

   ${task.day}-${index}-${task.title}

   Do NOT use task.id here.
   ========================================================= */

function getTaskId(
  task: Task,
  index: number
): string {
  return `${task.day ?? ""}-${index}-${task.title || "task"}`;
}

/* =========================================================
   COMPLETED TASK COUNT
   ========================================================= */

function getCompletedCount(
  plan: StudyPlan
): number {
  const tasks = getPlanTasks(plan);

  if (tasks.length === 0) {
    return 0;
  }

  const completedIds = new Set(
    getCompletedTaskIds(plan)
  );

  return tasks.filter((task, index) =>
    completedIds.has(
      getTaskId(task, index)
    )
  ).length;
}

/* =========================================================
   INSIGHTS
   ========================================================= */

function Insights() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState<StudyPlan[]>([]);

  /* =======================================================
     LOAD PLANS
     ======================================================= */

  useEffect(() => {
    const loadPlans = () => {
      setPlans(getSavedPlans());
    };

    loadPlans();

    /*
      Refresh when the page becomes active again.
      This helps when a user completes a task on Dashboard
      and then comes back to Insights.
    */

    window.addEventListener(
      "focus",
      loadPlans
    );

    window.addEventListener(
      "pageshow",
      loadPlans
    );

    window.addEventListener(
      "storage",
      loadPlans
    );

    return () => {
      window.removeEventListener(
        "focus",
        loadPlans
      );

      window.removeEventListener(
        "pageshow",
        loadPlans
      );

      window.removeEventListener(
        "storage",
        loadPlans
      );
    };
  }, []);

  /* =======================================================
     CALCULATE ALL STATISTICS
     ======================================================= */

  const stats = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;

    const planStats = plans.map((plan) => {
      const tasks = getPlanTasks(plan);

      const completed = getCompletedCount(
        plan
      );

      const progress =
        tasks.length > 0
          ? Math.round(
              (completed / tasks.length) *
                100
            )
          : 0;

      totalTasks += tasks.length;
      completedTasks += completed;

      return {
        plan,
        total: tasks.length,
        completed,
        progress,
      };
    });

    /*
      Average progress is the average of each
      individual plan's progress.
    */

    const averageProgress =
      planStats.length > 0
        ? Math.round(
            planStats.reduce(
              (sum, item) =>
                sum + item.progress,
              0
            ) / planStats.length
          )
        : 0;

    /*
      Strongest journey:
      First prioritize completed tasks.
      If tied, prioritize progress percentage.
    */

    const strongestPlan =
      planStats.length > 0
        ? [...planStats].sort(
            (a, b) => {
              if (
                b.completed !==
                a.completed
              ) {
                return (
                  b.completed -
                  a.completed
                );
              }

              return (
                b.progress -
                a.progress
              );
            }
          )[0]
        : null;

    return {
      totalPlans: plans.length,
      totalTasks,
      completedTasks,
      averageProgress,
      strongestPlan,
      planStats,
    };
  }, [plans]);

  /* =======================================================
     ACTIVITY

     We do NOT invent activity data.

     Your current localStorage completion records contain
     completed task IDs, but they do not contain the date
     each task was completed.

     Therefore a real Mon-Sun activity chart cannot be
     calculated accurately yet.

     We keep the chart clean and honest until timestamps
     are added to the completion records.
     ======================================================= */

  const activity = useMemo(() => {
    return [
      {
        day: "Mon",
        value: 0,
      },
      {
        day: "Tue",
        value: 0,
      },
      {
        day: "Wed",
        value: 0,
      },
      {
        day: "Thu",
        value: 0,
      },
      {
        day: "Fri",
        value: 0,
      },
      {
        day: "Sat",
        value: 0,
      },
      {
        day: "Sun",
        value: 0,
      },
    ];
  }, []);

  const maxActivity = Math.max(
    ...activity.map(
      (item) => item.value
    ),
    1
  );

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="insights-page">

      <div className="insights-container">

        {/* =================================================
            NAVIGATION
            ================================================= */}

        <PageNavigation />

        {/* =================================================
            HEADER
            ================================================= */}

        <header className="insights-header">

          <div>

            <p className="section-tag">
              YOUR LEARNING DATA
            </p>

            <h1>
              Your Learning Insights
            </h1>

            <p>
              See how your learning journeys
              are progressing and where your
              effort is making the biggest
              impact.
            </p>

          </div>

        </header>

        {/* =================================================
            OVERVIEW STATISTICS
            ================================================= */}

        <section className="insights-overview">

          {/* PLANS */}

          <div className="insight-stat-card">

            <span>
              PLANS CREATED
            </span>

            <strong>
              {stats.totalPlans}
            </strong>

            <small>
              Learning journeys
            </small>

          </div>

          {/* COMPLETED TASKS */}

          <div className="insight-stat-card">

            <span>
              TASKS COMPLETED
            </span>

            <strong>
              {stats.completedTasks}
            </strong>

            <small>
              Across all plans
            </small>

          </div>

          {/* AVERAGE PROGRESS */}

          <div className="insight-stat-card">

            <span>
              AVERAGE PROGRESS
            </span>

            <strong>
              {stats.averageProgress}%
            </strong>

            <small>
              Across your plans
            </small>

          </div>

          {/* TOTAL TASKS */}

          <div className="insight-stat-card">

            <span>
              TOTAL TASKS
            </span>

            <strong>
              {stats.totalTasks}
            </strong>

            <small>
              Available missions
            </small>

          </div>

        </section>

        {/* =================================================
            MAIN GRID
            ================================================= */}

        <div className="insights-grid">

          {/* =================================================
              ACTIVITY
              ================================================= */}

          <section className="insights-card activity-card">

            <div className="insights-card-header">

              <div>

                <p className="section-tag">
                  ACTIVITY
                </p>

                <h2>
                  Learning Activity
                </h2>

                <p>
                  Your learning momentum.
                </p>

              </div>

              <div className="activity-icon">
                📈
              </div>

            </div>

            <div className="activity-chart">

              {activity.map((item) => {

                const height =
                  item.value > 0
                    ? Math.max(
                        12,
                        (item.value /
                          maxActivity) *
                          100
                      )
                    : 0;

                return (
                  <div
                    className="activity-column"
                    key={item.day}
                  >

                    <div className="activity-bar-area">

                      <div
                        className="activity-bar"
                        style={{
                          height:
                            `${height}%`,
                        }}
                      />

                    </div>

                    <span>
                      {item.day}
                    </span>

                  </div>
                );
              })}

            </div>

            <div className="activity-summary">

              <span>
                <strong>
                  {stats.completedTasks}
                </strong>{" "}
                tasks completed
              </span>

              <span>
                Keep building momentum 🚀
              </span>

            </div>

          </section>

          {/* =================================================
              STRONGEST JOURNEY
              ================================================= */}

          <section className="insights-card strongest-card">

            <div className="insights-card-header">

              <div>

                <p className="section-tag">
                  TOP JOURNEY
                </p>

                <h2>
                  Strongest Journey
                </h2>

              </div>

              <div className="strongest-icon">
                🏆
              </div>

            </div>

            {stats.strongestPlan ? (

              <div className="strongest-content">

                <div className="strongest-plan-icon">
                  🚀
                </div>

                <h3>
                  {stats.strongestPlan.plan.goal ||
                    stats.strongestPlan.plan.title ||
                    stats.strongestPlan.plan.name ||
                    "Learning Journey"}
                </h3>

                <p>
                  You have completed{" "}
                  <strong>
                    {
                      stats.strongestPlan
                        .completed
                    }
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {
                      stats.strongestPlan
                        .total
                    }
                  </strong>{" "}
                  tasks.
                </p>

                <div className="strongest-progress-header">

                  <span>
                    Progress
                  </span>

                  <strong>
                    {
                      stats.strongestPlan
                        .progress
                    }%
                  </strong>

                </div>

                <div className="strongest-progress">

                  <div
                    style={{
                      width:
                        `${stats.strongestPlan.progress}%`,
                    }}
                  />

                </div>

                <button
                  type="button"
                  className="secondary-button strongest-button"
                  onClick={() =>
                    navigate(
                      "/dashboard",
                      {
                        state: {
                          planId:
                            stats
                              .strongestPlan
                              ?.plan.id,
                        },
                      }
                    )
                  }
                >
                  Continue Journey →
                </button>

              </div>

            ) : (

              <div className="insights-empty">

                <div>
                  🐣
                </div>

                <h3>
                  Your journey starts here
                </h3>

                <p>
                  Create your first study plan
                  and your learning insights
                  will appear here.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() =>
                    navigate(
                      "/onboarding"
                    )
                  }
                >
                  Create Study Plan
                </button>

              </div>

            )}

          </section>

        </div>

        {/* =================================================
            PLAN BREAKDOWN
            ================================================= */}

        <section className="insights-card plan-breakdown">

          <div className="insights-card-header">

            <div>

              <p className="section-tag">
                PLAN PERFORMANCE
              </p>

              <h2>
                Your Learning Journeys
              </h2>

              <p>
                Compare progress across your
                active study plans.
              </p>

            </div>

          </div>

          {plans.length > 0 ? (

            <div className="insights-plan-list">

              {stats.planStats.map(
                (item) => {

                  const {
                    plan,
                    total,
                    completed,
                    progress,
                  } = item;

                  const title =
                    plan.goal ||
                    plan.title ||
                    plan.name ||
                    "Learning Journey";

                  return (

                    <div
                      className="insights-plan-row"
                      key={plan.id}
                    >

                      {/* PLAN NAME */}

                      <div className="insights-plan-name">

                        <div className="insights-plan-avatar">
                          🚀
                        </div>

                        <div>

                          <strong>
                            {title}
                          </strong>

                          <small>
                            {completed}{" "}
                            of {total}{" "}
                            tasks completed
                          </small>

                        </div>

                      </div>

                      {/* PROGRESS */}

                      <div className="insights-plan-progress">

                        <div className="insights-plan-progress-top">

                          <span>
                            Progress
                          </span>

                          <strong>
                            {progress}%
                          </strong>

                        </div>

                        <div className="insights-plan-track">

                          <div
                            style={{
                              width:
                                `${progress}%`,
                            }}
                          />

                        </div>

                      </div>

                      {/* OPEN */}

                      <button
                        type="button"
                        className="insights-open-button"
                        onClick={() =>
                          navigate(
                            "/dashboard",
                            {
                              state: {
                                planId:
                                  plan.id,
                              },
                            }
                          )
                        }
                      >
                        Open
                      </button>

                    </div>

                  );
                }
              )}

            </div>

          ) : (

            <div className="insights-no-plans">

              <span>
                📚
              </span>

              <p>
                No study plans yet.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  navigate(
                    "/onboarding"
                  )
                }
              >
                Create Your First Plan
              </button>

            </div>

          )}

        </section>

        {/* =================================================
            INSIGHT BANNER
            ================================================= */}

        {plans.length > 0 && (

          <section className="learning-insight-banner">

            <div className="learning-insight-icon">
              💡
            </div>

            <div>

              <p className="section-tag">
                STUDYPILOT INSIGHT
              </p>

              <h2>

                {stats.averageProgress >=
                75
                  ? "You're close to the finish line!"
                  : stats.averageProgress >=
                    40
                  ? "You're building strong momentum."
                  : stats.averageProgress > 0
                  ? "You're making progress. Keep going."
                  : "Your learning journey is ready to begin."}

              </h2>

              <p>

                {stats.completedTasks >
                0
                  ? `You've completed ${
                      stats.completedTasks
                    } task${
                      stats.completedTasks ===
                      1
                        ? ""
                        : "s"
                    } across your learning journeys.`
                  : "Complete your first mission to start building your learning momentum."}

              </p>

            </div>

          </section>

        )}

        {/* =================================================
            FOOTER
            ================================================= */}

        <footer className="insights-footer">

          <span>
            StudyPilot AI
          </span>

          <span>
            Learn smarter. Stay consistent. 🚀
          </span>

        </footer>

      </div>

    </div>
  );
}

export default Insights;