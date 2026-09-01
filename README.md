# 🚀 StudyPilot AI

## AI-Powered Personalized Learning Planner

StudyPilot AI is a personalized learning platform that helps users turn their learning goals into structured and achievable study plans.

Users provide their learning goal, current skill level, target deadline, and available study time. The application generates a personalized learning roadmap and allows users to track tasks, monitor progress, manage multiple learning plans, and view learning insights.

---

## 🎯 Problem Statement

Many learners know what they want to learn but struggle to create a realistic learning schedule and consistently track their progress.

StudyPilot AI addresses this problem by combining AI-powered study-plan generation with task tracking, progress monitoring, gamification, and learning analytics in one application.

---

## 💡 Solution

StudyPilot AI transforms a learning goal into a structured learning journey.

The application:

1. Collects the learner's goal and preferences.
2. Generates a personalized study plan using AI.
3. Organizes the plan into milestones and daily tasks.
4. Allows learners to mark individual tasks as completed.
5. Calculates course progress automatically.
6. Supports multiple study plans.
7. Provides learning analytics and insights.
8. Uses gamification elements such as XP and streaks to encourage consistency.

---

## ✨ Key Features

### 🤖 AI-Powered Study Planning

Generates personalized learning plans based on:

- Learning goal
- Current skill level
- Target deadline
- Available daily study time

### 🗺️ Personalized Learning Roadmap

Breaks the learning journey into structured milestones and actionable daily tasks.

### 📚 Multiple Study Plans

Users can create and manage multiple learning plans instead of being limited to a single learning journey.

### ✅ Task-Level Progress Tracking

Users can mark individual tasks as completed and monitor their progress throughout the course.

### 📊 Learning Progress

Course progress is automatically calculated from completed tasks and displayed through visual progress indicators.

### 🎮 Gamification

The application uses gamification elements such as:

- XP
- Learning streaks
- Progress milestones
- Achievements

These features are designed to encourage consistency and make learning more engaging.

### 📈 Learning Insights

The analytics section provides learning metrics such as:

- Plans created
- Tasks completed
- Average course progress
- Current streak
- Total XP
- Most active subject
- Learning activity

### 🧭 User-Friendly Navigation

The application provides clear navigation between:

- Home
- Dashboard
- Current Plans
- Insights

### 📱 Responsive Interface

The interface is designed to provide a consistent experience across desktop and smaller screen sizes.

---

## 🔄 How StudyPilot AI Works

```text
User enters learning goal
          ↓
Selects skill level
          ↓
Selects target deadline
          ↓
Selects available study time
          ↓
AI generates personalized plan
          ↓
Learning roadmap is created
          ↓
User completes daily tasks
          ↓
Progress is automatically updated
          ↓
XP and streaks are tracked
          ↓
Learning insights are generated

---

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript
- Vite
- CSS

### Backend
- Node.js
- Express.js
- REST API

### AI
- Google Gemini API
- Prompt Engineering
- Structured AI Responses

### Data & Authentication
- Firebase
- Firestore
- LocalStorage

### Development & Deployment
- Git
- GitHub
- Render

---

## 🏗️ Product Architecture

```text
                         ┌──────────────────────┐
                         │        USER          │
                         │ Learning Preferences │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   REACT FRONTEND     │
                         │  TypeScript + Vite   │
                         └──────────┬───────────┘
                                    │
                              REST API Request
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   NODE.JS + EXPRESS  │
                         │       BACKEND        │
                         └──────────┬───────────┘
                                    │
                              AI Generation
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    GOOGLE GEMINI     │
                         │      AI MODEL        │
                         └──────────┬───────────┘
                                    │
                             Structured Plan
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    STUDYPILOT AI     │
                         │   LEARNING ROADMAP   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ PROGRESS & INSIGHTS  │
                         │ XP • Tasks • Streaks │
                         │     • Analytics      │
                         └──────────────────────┘



### 3. 🎯 Product Decisions

This is especially useful **for your Business Analyst/APM resume**, because it demonstrates product thinking—not just coding.

```markdown
---

## 🎯 Product Decisions

StudyPilot AI was designed around several key product decisions:

### Goal-First Onboarding
Collect the learner's goal, skill level, deadline, and available study time before generating a learning plan.

### Task-Level Progress
Calculate course progress from completed tasks rather than requiring users to manually enter a percentage.

### Multiple Learning Journeys
Allow users to create and manage multiple study plans for different learning goals.

### Structured AI Output
Generate structured learning content that can be organized into milestones and actionable daily tasks.

### Progress-Focused Dashboard
Bring the learner's current mission, progress, XP, study habit, and roadmap into a single dashboard.

### Learning Analytics
Convert plan and task activity into simple metrics that help learners understand their overall progress.


---

## 📸 Application Screenshots

### 🏠 Dashboard

<img width="1854" height="894" alt="image" src="https://github.com/user-attachments/assets/ba4c5414-ec3b-41e5-b505-5dcd79899689" />

### 🗺️ AI-Generated Study Plan

<img width="1349" height="848" alt="image" src="https://github.com/user-attachments/assets/c025758b-4b1f-48e5-8519-5d89b5afea16" />

<img width="1488" height="870" alt="image" src="https://github.com/user-attachments/assets/4109f4ff-de80-43cc-b34f-914ed9ffd8ca" />

### 📚 Current Plans

<img width="1426" height="869" alt="image" src="https://github.com/user-attachments/assets/232caa40-2b9c-462e-ba43-972a805cdd65" />

### 📈 Learning Insights
<img width="1396" height="861" alt="image" src="https://github.com/user-attachments/assets/b160d776-9ff5-4393-a206-1772de2d4e24" />

<img width="1544" height="789" alt="image" src="https://github.com/user-attachments/assets/35c2c74a-c348-4166-9c98-e655690cf0ee" />


---

## 🚀 Deployment

StudyPilot AI uses a separate frontend and backend architecture.

- The frontend is built with React, TypeScript, and Vite.
- The backend is built with Node.js and Express.js.
- The backend communicates with the Google Gemini API for AI-powered study-plan generation.
- The backend is deployed using Render.
- Environment variables are used to protect API credentials.


---

## 🧪 Local Development

### 1. Clone the repository

```bash
git clone https://github.com/ujwalar27/StudyPilot-AI.git

cd StudyPilot-AI/app

npm install

GEMINI_API_KEY= ****
VITE_API_URL=http://localhost:5000

npm run dev
npm run build


### 7. 📁 Project Structure

```markdown
---

## 📁 Project Structure

```text
StudyPilot-AI/
└── app/
    ├── public/
    ├── server/
    │   └── server.js
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── firebase/
    │   └── pages/
    │       ├── CurrentPlans.tsx
    │       ├── Dashboard.tsx
    │       ├── Insights.tsx
    │       ├── Login.tsx
    │       ├── Onboarding.tsx
    │       ├── Plan.tsx
    │       └── Signup.tsx
    ├── package.json
    ├── package-lock.json
    ├── vite.config.ts
    └── README.md


### 8. 🔮 Future Improvements

```markdown
---

## 🔮 Future Improvements

Potential future improvements include:

- Calendar integration
- Study reminders and notifications
- Adaptive study plans based on learner performance
- Personalized AI recommendations
- More advanced learning analytics
- Expanded achievement and badge system
- Cross-device learning synchronization


---

## 👩‍💻 Author

### Ujwala R

Information Science & Engineering Graduate interested in:

- Business Analysis
- Product Management
- Data Analytics
- AI-powered products

**Project:** StudyPilot AI — AI-Powered Personalized Learning Planner

**GitHub:** https://github.com/ujwalar27/StudyPilot-AI




