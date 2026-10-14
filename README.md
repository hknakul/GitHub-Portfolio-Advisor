<div align="center">

# 🐙 OctoAdvisor AI
### AI-Powered GitHub Portfolio Advisor & Career Readiness Architect

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Built With: Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Language: Vanilla JS](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS: Modern Vanilla](https://img.shields.io/badge/CSS-Modern_Glassmorphism-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

**An intelligent, multi-dimensional developer portfolio analyzer that audits GitHub profiles, scores repository hygiene, identifies critical industry skill gaps, and prepares candidates for technical hiring through an interactive AI chat interface.**

[Features](#-key-features) &bull; [Quick Start](#-quick-start) &bull; [Architecture](#-architecture) &bull; [Screenshots](#-interface-overview) &bull; [Roadmap](#-30-day-transformation-roadmap)

</div>

---

## 🌟 Key Features

- **🌐 Live GitHub Profile & Repo Fetching:** Directly queries GitHub REST API (`/users/{username}` & `/repos`) with rate limit tracking and personal access token (PAT) support for up to 5,000 req/hr.
- **⚡ 4 Pre-loaded High-Fidelity Demo Profiles:** 1-click instant audit switching between diverse roles:
  - `alexrivera-dev` (Mid-level Full-Stack Developer &bull; 78% Readiness)
  - `priya-ml-ai` (Senior AI/ML & LLM Researcher &bull; 86% Readiness)
  - `jordan-codecraft` (Junior Frontend Developer &bull; 59% Readiness, highlighting common beginner traps)
  - `marcus-devops` (Staff DevOps & Platform Engineer &bull; 91% Readiness)
- **📊 5-Dimension Competency Scorecard:**
  - *Documentation & Readability:* README health, demo deployments, open-source licenses, setup instructions.
  - *Code Quality & Architecture:* Language breadth, topic tagging, test suite presence, CI/CD pipelines.
  - *Community & Social Proof:* Stars, forks, follower velocity, open-source engagement.
  - *Career Role Alignment:* Role-specific match percentage against industry standards.
  - *Repository Hygiene:* Stale project ratio, clean repo naming, empty description detection.
- **🎯 Skill Gap & Market Readiness Analyzer:**
  - Supports 6 target engineering tracks: *Full-Stack*, *AI / ML*, *Frontend*, *Backend & Systems*, *DevOps & Cloud*, and *Mobile*.
  - Compares candidate's demonstrated skills with current industry expectations.
  - Generates a **Gap-Bridging Project Blueprint** specifying an optimal capstone project, architecture, and feature roadmap to fill missing skills.
- **💬 Interactive OctoAdvisor AI Chat:**
  - Conversational mentor with deep context of the active profile, scores, and repositories.
  - Dual-mode support: built-in heuristic reasoning engine (100% free, zero configuration) or custom Google Gemini Flash LLM key.
  - Quick-action prompt chips for interview questions, score improvement strategies, and repo critiques.
- **✨ AI Power Tools Suite:**
  - **AI GitHub README Generator:** Builds Shields.io badges, live demo links, architecture tables, and quickstarts with 1-click copy and `.md` download.
  - **Recruiter 6-Second Glance Simulation:** Calculates hiring tier, estimated market compensation band, green flags, and red flags.
  - **Bio & Headline Optimizer:** 4 recruiter-tailored bio options (Punchy, Tech-focused, Problem-solver, Open Source).
  - **30-Day Sprint Action Plan:** Interactive 4-week roadmap with persistent checkbox tracking and Markdown export.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (`v18+` or `v20+`)
- [npm](https://www.npmjs.com/)

### Installation & Local Run

```bash
# 1. Clone the repository
git clone https://github.com/honakul/GitHub-Portfolio-Advisor.git
cd GitHub-Portfolio-Advisor

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Runtime & Build** | Vite 8+ | Ultra-fast HMR and lightweight bundling |
| **Core** | HTML5 & Vanilla ES6+ JavaScript | Zero heavy framework overhead |
| **Styling** | Modern Vanilla CSS | Custom glassmorphism, responsive grid & typography |
| **Markdown Engine** | Marked | Dynamic formatting in AI chat and preview generators |
| **Visual Effects** | Canvas Confetti | Celebratory particle animations for high scores |
| **APIs** | GitHub REST API v3 | User profile & repository metadata ingestion |
| **Optional LLM** | Google Gemini Flash | Generative AI advisor integration |

---

## 📁 Project Directory Structure

```text
GitHub-Portfolio-Advisor/
├── index.html                 # Main application layout, modals & templates
├── package.json               # Scripts and dependencies
├── src/
│   ├── main.js                # App state, event orchestration & rendering
│   ├── style.css              # Cyber-glassmorphism styling system
│   ├── data/
│   │   ├── mockProfiles.js    # Pre-loaded high-fidelity candidate datasets
│   │   └── roleBenchmarks.js  # Role requirements & project blueprints
│   └── services/
│       ├── auditEngine.js     # 5-dimension scoring and recruiter simulation
│       ├── aiAdvisor.js       # Context-aware chat advisor (built-in + Gemini)
│       ├── githubApi.js       # GitHub API client with rate-limiting & PAT
│       └── readmeGenerator.js # GitHub README template engine
└── README.md
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
