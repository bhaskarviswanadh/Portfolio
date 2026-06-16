# 🖥️ bhaskar.dev — Cloud & DevOps Portfolio

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-round&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-round&logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=flat-round&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-round)](LICENSE)

Welcome to my personal portfolio! This is a high-fidelity, interactive, developer-focused web terminal/portfolio designed to showcase my projects, skills, and experience in Cloud Infrastructure, Containerization, and DevOps.

```yaml
apiVersion: career/v1
kind: Portfolio
metadata:
  owner: bhaskar-viswanadh
  role: Cloud & DevOps Engineer
spec:
  status: Active
  experience: Network Operations Intern
  stack: [React, TypeScript, TailwindCSS, Motion]
```

---

## ✨ Features

- **🎮 Command Palette**: Hit `⌘ K` or `Ctrl K` to open the CLI command search overlay and navigate instantly.
- **📄 YAML-Inspired Hero & JSON Contact**: Simulated terminal output featuring responsive, styled config schemas.
- **⚡ Lightning Fast**: Built on React 19 + Vite for sub-millisecond hot module replacement (HMR).
- **🎨 Glassmorphism & Cyberpunk Theme**: Dark mode void background (`#0d0e11`) with sharp teal accents (`#00f2fe`) and smooth animation transitions.
- **📱 Responsive Layout**: Fully responsive across mobile, tablet, and widescreen layouts with dynamic grid allocations.
- **📈 Project Showcases**: Links directly to live code repositories (`idp-project`, `Network-Monitoring-System`).

---

## 🛠️ Tech Stack

- **Frontend Core**: React 19, TypeScript
- **Bundler & Server**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion (`motion/react`)
- **Icons & Fonts**: Google Fonts (Inter, JetBrains Mono)
- **Deployment**: Vercel/Netlify ready

---

## 📂 Project Structure

```bash
Portfolio/
├── public/                 # Static assets (Resume PDF, Favicons, Og-image)
├── src/
│   ├── components/         # Reusable React components
│   │   ├── CommandPalette.tsx   # Cmd+K navigation console
│   │   ├── ExperienceList.tsx   # Kubernetes-style job history
│   │   ├── ProjectGrid.tsx      # Infrastructure/tooling projects
│   │   ├── TechMarquee.tsx      # Infinite scrolling tech stack
│   │   └── Nav.tsx / Hero.tsx   # Main layout headers
│   ├── data.ts             # Centralized source of truth for portfolio content
│   ├── index.css           # Global typography, color variables & tailwind directives
│   ├── main.tsx            # React entrypoint
│   └── App.tsx             # App layout structure
├── index.html              # Main HTML document & SEO optimization
└── package.json            # Dependencies and scripts
```

---

## 🚀 Getting Started

### 📋 Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### ⚙️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bhaskarviswanadh/Portfolio.git
   cd Portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The app will run locally at `http://localhost:5173/`.

### 📦 Production Build

To build the static application assets for production deployment:

```bash
npm run build
```

This compiles the TypeScript files and assets into a production-ready `./dist` bundle.

---

## 👨‍💻 Author

**Bhaskar Viswanadh Devisetti**
- **Email**: viswanathdevisetti789@gmail.com
- **LinkedIn**: [bhaskarviswanadhdevisetti](https://www.linkedin.com/in/bhaskarviswanadhdevisetti/)
- **GitHub**: [@bhaskarviswanadh](https://github.com/bhaskarviswanadh)
