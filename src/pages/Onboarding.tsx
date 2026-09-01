import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Piko from "../components/Piko";

function Onboarding() {
  const navigate = useNavigate();

  const [goal, setGoal] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [deadline, setDeadline] = useState("");
  const [studyTime, setStudyTime] = useState("");

  const [error, setError] = useState("");

  const handleContinue = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    // Validate learning goal
    if (!goal.trim()) {
      setError("Please enter what you want to learn.");
      return;
    }

    // Validate skill level
    if (!skillLevel) {
      setError("Please select your current skill level.");
      return;
    }

    // Validate deadline
    if (!deadline) {
      setError("Please select a target deadline.");
      return;
    }

    // Validate study time
    if (!studyTime) {
      setError("Please select your available study time.");
      return;
    }

    // Navigate to AI-generated plan
    navigate("/plan", {
      state: {
        goal: goal.trim(),
        skillLevel,
        deadline,
        studyTime,
      },
    });
  };

  return (
    <div className="onboarding-page">

      <div className="onboarding-card">

        {/* =====================================================
            HEADER / HOME BUTTON
            ===================================================== */}

        <div className="onboarding-top">

          <button
            type="button"
            className="auth-logo"
            onClick={() => navigate("/")}
          >
            🚀 StudyPilot AI
          </button>

        </div>


        {/* =====================================================
            PIKO
            ===================================================== */}

        <div className="onboarding-piko-wrapper">

          <Piko
            size="medium"
            message="Tell me your goal and I'll map out the journey."
            className="piko-onboarding"
          />

        </div>


        {/* =====================================================
            STEP INDICATOR
            ===================================================== */}

        <div className="stepper">

          <div className="stepper-step active">
            1
          </div>

          <div className="stepper-line"></div>

          <div className="stepper-step">
            2
          </div>

          <div className="stepper-line"></div>

          <div className="stepper-step">
            3
          </div>

        </div>


        {/* =====================================================
            PAGE INTRO
            ===================================================== */}

        <div className="onboarding-header">

          <p className="eyebrow">
            LET'S GET STARTED
          </p>

          <h1>
            Tell us what you want to learn.
          </h1>

          <p>
            We'll use this information to create a study plan
            that fits your goal and schedule.
          </p>

        </div>


        {/* =====================================================
            ERROR MESSAGE
            ===================================================== */}

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}


        {/* =====================================================
            ONBOARDING FORM
            ===================================================== */}

        <form
          className="onboarding-form"
          onSubmit={handleContinue}
        >

          {/* LEARNING GOAL */}

          <div className="form-group">

            <label htmlFor="goal">
              What do you want to learn?
            </label>

            <input
              id="goal"
              type="text"
              placeholder="e.g. SQL, Python, Digital Marketing"
              value={goal}
              onChange={(event) =>
                setGoal(event.target.value)
              }
            />

          </div>


          {/* SKILL LEVEL */}

          <div className="form-group">

            <label htmlFor="skillLevel">
              What is your current skill level?
            </label>

            <select
              id="skillLevel"
              value={skillLevel}
              onChange={(event) =>
                setSkillLevel(event.target.value)
              }
            >

              <option value="">
                Select your skill level
              </option>

              <option value="Beginner">
                Beginner
              </option>

              <option value="Intermediate">
                Intermediate
              </option>

              <option value="Advanced">
                Advanced
              </option>

            </select>

          </div>


          {/* DEADLINE */}

          <div className="form-group">

            <label htmlFor="deadline">
              What is your target deadline?
            </label>

            <input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(event) =>
                setDeadline(event.target.value)
              }
            />

          </div>


          {/* STUDY TIME */}

          <div className="form-group">

            <label htmlFor="studyTime">
              How much time can you study each day?
            </label>

            <select
              id="studyTime"
              value={studyTime}
              onChange={(event) =>
                setStudyTime(event.target.value)
              }
            >

              <option value="">
                Select available time
              </option>

              <option value="30 minutes">
                30 minutes
              </option>

              <option value="1 hour">
                1 hour
              </option>

              <option value="1.5 hours">
                1.5 hours
              </option>

              <option value="2 hours">
                2 hours
              </option>

              <option value="3+ hours">
                3+ hours
              </option>

            </select>

          </div>


          {/* =====================================================
              GENERATE PLAN BUTTON
              ===================================================== */}

          <button
            className="primary-button full-button"
            type="submit"
          >
            Generate My Study Plan →
          </button>

        </form>


        {/* =====================================================
            BOTTOM NAVIGATION
            ===================================================== */}

        <div className="onboarding-footer">

          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>

        </div>

      </div>

    </div>
  );
}

export default Onboarding;