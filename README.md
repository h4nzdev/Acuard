# Acuard | Smart Academic Integrity LMS

Acuard is an advanced Learning Management System (LMS) designed to uphold academic integrity in the digital age. Unlike traditional systems that rely solely on text similarity, Acuard utilizes behavioral biometrics, writing style analysis, and AI-driven monitoring to ensure the authenticity of student work.

## 🚀 Overview

Acuard monitors student behavior during assessments in real-time to detect suspicious activity such as AI assistance, external collaboration, or copy-pasting. The goal is to provide instructors with intelligence-backed insights while maintaining a fair and transparent environment for students.

## 👥 System Roles

### Instructor
- **Assessment Management**: Create and configure quizzes, essays, and questionnaires.
- **Granular Policy Control**: Define copy-paste rules (Disallowed, Monitored, Fully Allowed) per activity.
- **Live Monitoring Feed**: Oversight of active sessions with real-time risk status.
- **Incident Reports**: Access detailed behavioral logs, incident timelines, and biometric variances.
- **Smart Import**: Use AI OCR to automatically generate questions from photos of physical assessment papers.

### Student
- **Identity Baseline**: Establish a unique "Writing Fingerprint" through an initial biometric assessment.
- **Secure Assessments**: Take exams in a focused environment with active proctoring.
- **Honesty Profile**: Monitor personal honesty scores, streaks, and institutional ranking.
- **Performance Analytics**: View detailed grade breakdowns alongside integrity verification.

## ✨ Core Features

### 1. Behavioral Biometrics
- **Typing Cadence**: Tracks words per minute (WPM) and rhythm consistency.
- **Syntactic Fingerprinting**: Analyzes sentence structure and vocabulary patterns against the student's baseline.
- **AI Authorship Match**: Visual radial progress indicator showing the likelihood of human ownership for text-based responses.

### 2. Real-Time Monitoring Engine
- **Tab Tracking**: Logs every instance a student switches browser focus or leaves the assessment window.
- **Copy-Paste Detection**: Monitors unauthorized content insertion based on instructor policies.
- **Proctoring Feed**: Optional camera-based attention tracking to ensure the student remains present.

### 3. Automated Enforcement
- **Warning System**: Real-time toast notifications for policy violations.
- **Auto-Lock Mechanism**: Automatically terminates sessions after 3 violations (configurable) to protect exam integrity.
- **Unlock Capability**: Instructors can manually restore student access after reviewing flags.

### 4. Integrity Gamification
- **Honesty Score**: A dynamic rating that improves with clean assessment completions.
- **Honest Streak**: Rewards consistent ethical behavior.
- **Institutional Leaderboard**: Recognizes students who maintain the highest standards of integrity.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Shadcn UI
- **AI & ML**: Genkit (for writing analysis and risk prediction)
- **Analytics**: Recharts
- **Icons**: Lucide React
- **Storage**: LocalStorage (Prototype Persistence)

## 🛡 Academic Integrity Agreement

Acuard is built on the principle of mutual trust. By using this platform, students agree to focus exclusively on their work, maintain their biometric baseline honestly, and respect the integrity policies set by their institution.

---
*© 2026 Acuard LMS. Protecting the value of credentials.*