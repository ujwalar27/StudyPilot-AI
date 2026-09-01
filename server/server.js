import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error(
    "ERROR: GEMINI_API_KEY is missing from .env"
  );
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey,
});

/* =========================================
   HEALTH CHECK
========================================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "StudyPilot AI server is running.",
  });
});

/* =========================================
   WAIT
========================================= */

const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/* =========================================
   GEMINI GENERATION
========================================= */

async function generatePlanWithModel(
  model,
  prompt,
  responseSchema
) {
  console.log(
    `Trying Gemini model: ${model}`
  );

  const response =
    await ai.models.generateContent({
      model: model,
      contents: prompt,

      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

  return response;
}

/* =========================================
   GENERATE PLAN
========================================= */

app.post(
  "/api/generate-plan",
  async (req, res) => {
    try {
      const {
        goal,
        skillLevel,
        deadline,
        studyTime,
      } = req.body;

      /* =====================================
         VALIDATION
      ===================================== */

      if (
        !goal ||
        !skillLevel ||
        !deadline ||
        !studyTime
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Goal, skill level, deadline, and study time are required.",
        });
      }

      /* =====================================
         CALCULATE DAYS
      ===================================== */

      const today = new Date();

      const targetDate = new Date(
        `${deadline}T23:59:59`
      );

      const difference =
        targetDate.getTime() -
        today.getTime();

      const calculatedDays = Math.ceil(
        difference /
          (1000 * 60 * 60 * 24)
      );

      const days = Math.max(
        1,
        Math.min(calculatedDays, 30)
      );

      /* =====================================
         PROMPT
      ===================================== */

      const prompt = `
You are StudyPilot AI.

Create a personalized study plan for a college student.

STUDENT INFORMATION

Learning goal:
${goal}

Current skill level:
${skillLevel}

Target deadline:
${deadline}

Available study time:
${studyTime} per day

Available planning period:
${days} days

PRODUCT PURPOSE

StudyPilot AI converts a broad learning goal into a
realistic sequence of learning milestones and actionable
daily tasks.

REQUIREMENTS

1. Start from the student's current skill level.
2. Progress logically from fundamentals to practical application.
3. Create clear learning milestones.
4. Create actionable daily tasks.
5. Include learning, practice, and review.
6. Keep tasks realistic for the available daily study time.
7. Avoid vague tasks.
8. Use day numbers starting at 1.
9. Every task must belong to a milestone.
10. Include practical exercises where appropriate.
11. Include review activities near the end.
12. Do not overload the student.
13. Keep descriptions concise.
14. Generate a maximum of ${days} days.
15. The user will review the plan before saving it.

TASK TYPES

Use:
Learn
Practice
Review
Project

Return only the requested JSON structure.
`;

      /* =====================================
         RESPONSE SCHEMA
      ===================================== */

      const responseSchema = {
        type: Type.OBJECT,

        properties: {
          title: {
            type: Type.STRING,
          },

          summary: {
            type: Type.STRING,
          },

          milestones: {
            type: Type.ARRAY,

            items: {
              type: Type.OBJECT,

              properties: {
                title: {
                  type: Type.STRING,
                },

                description: {
                  type: Type.STRING,
                },

                order: {
                  type: Type.INTEGER,
                },
              },

              required: [
                "title",
                "description",
                "order",
              ],
            },
          },

          tasks: {
            type: Type.ARRAY,

            items: {
              type: Type.OBJECT,

              properties: {
                day: {
                  type: Type.INTEGER,
                },

                title: {
                  type: Type.STRING,
                },

                description: {
                  type: Type.STRING,
                },

                duration: {
                  type: Type.STRING,
                },

                type: {
                  type: Type.STRING,
                },

                milestone: {
                  type: Type.STRING,
                },
              },

              required: [
                "day",
                "title",
                "description",
                "duration",
                "type",
                "milestone",
              ],
            },
          },
        },

        required: [
          "title",
          "summary",
          "milestones",
          "tasks",
        ],
      };

      /* =====================================
         PRIMARY MODEL
         GEMINI 3.6 FLASH
      ===================================== */

      let response;

      try {
        response =
          await generatePlanWithModel(
            "gemini-3.6-flash",
            prompt,
            responseSchema
          );

        console.log(
          "Gemini 3.6 Flash succeeded."
        );
      } catch (primaryError) {
        console.error(
          "Gemini 3.6 Flash failed:"
        );

        console.error(
          primaryError?.message ||
            primaryError
        );

        /*
         * Retry once for temporary errors.
         */

        if (
          primaryError?.status === 503 ||
          primaryError?.status === 429
        ) {
          console.log(
            "Temporary Gemini error. Retrying in 2 seconds..."
          );

          await wait(2000);

          try {
            response =
              await generatePlanWithModel(
                "gemini-3.6-flash",
                prompt,
                responseSchema
              );

            console.log(
              "Gemini 3.6 Flash retry succeeded."
            );
          } catch (retryError) {
            console.error(
              "Gemini 3.6 Flash retry failed."
            );

            console.error(
              retryError?.message ||
                retryError
            );
          }
        }
      }

      /* =====================================
         FALLBACK MODEL
         GEMINI 3.5 FLASH-LITE
      ===================================== */

      if (!response) {
        console.log(
          "Trying fallback model: gemini-3.5-flash-lite"
        );

        try {
          response =
            await generatePlanWithModel(
              "gemini-3.5-flash-lite",
              prompt,
              responseSchema
            );

          console.log(
            "Gemini 3.5 Flash-Lite succeeded."
          );
        } catch (fallbackError) {
          console.error(
            "Gemini fallback failed:"
          );

          console.error(
            fallbackError?.message ||
              fallbackError
          );

          throw fallbackError;
        }
      }

      /* =====================================
         READ RESPONSE
      ===================================== */

      const text = response.text;

      if (!text) {
        throw new Error(
          "Gemini returned an empty response."
        );
      }

      /* =====================================
         PARSE JSON
      ===================================== */

      let plan;

      try {
        plan = JSON.parse(text);
      } catch (parseError) {
        console.error(
          "Gemini returned invalid JSON:"
        );

        console.error(text);

        throw new Error(
          "Gemini returned an invalid study plan format."
        );
      }

      /* =====================================
         VALIDATE PLAN
      ===================================== */

      if (
        !plan.title ||
        !plan.summary ||
        !Array.isArray(
          plan.milestones
        ) ||
        !Array.isArray(plan.tasks)
      ) {
        throw new Error(
          "Generated plan is missing required information."
        );
      }

      console.log(
        "Study plan generated successfully."
      );

      /* =====================================
         SEND TO FRONTEND
      ===================================== */

      return res.json({
        success: true,
        plan: plan,
      });
    } catch (error) {
      console.error(
        "Study plan generation error:"
      );

      console.error(error);

      return res.status(500).json({
        success: false,

        message:
          error?.message ||
          "Unable to generate the study plan.",
      });
    }
  }
);

/* =========================================
   START SERVER
========================================= */

app.listen(PORT, () => {
  console.log(
    `StudyPilot AI server running at http://localhost:${PORT}`
  );
});