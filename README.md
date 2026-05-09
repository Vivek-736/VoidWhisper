<div align="center">
  <img src="./public/icon.png" alt="Void Whisper Logo" width="120" height="120" />
  <h1>🌌 VOID WHISPER</h1>
  <p><strong>The Future of AI-Powered System Architecture</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Trigger.dev](https://img.shields.io/badge/Trigger.dev-v3-orange?style=for-the-badge)](https://trigger.dev/)
  [![Liveblocks](https://img.shields.io/badge/Liveblocks-Realtime-purple?style=for-the-badge)](https://liveblocks.io/)
</div>

---

## ✨ Overview

**Void Whisper** is an advanced, AI-driven system architecture designer that transforms your concepts into production-ready blueprints. Built for modern engineering teams, it combines real-time collaborative whiteboarding with a powerful AI agent that understands, designs, and documents your system architecture in seconds.

Whether you're brainstorming a new microservices mesh or documenting a complex cloud infrastructure, Void Whisper provides the tools to visualize, iterate, and generate technical specifications seamlessly.

## 🚀 Key Features

### 🤖 AI Design Agent
- **Prompt-to-Architecture**: Simply describe your system requirements, and our AI agent will generate a complete interactive graph with nodes, edges, and data schemas.
- **Ghost AI Presence**: Watch the AI work in real-time. A dedicated "Ghost" cursor moves across the canvas as it thinks and places components, providing a truly collaborative experience between human and machine.
- **Real-time Status Feed**: Stay informed with a granular activity feed showing exactly what the AI is analyzing and generating at every step.

### 👥 Real-time Collaboration
- **Multi-user Canvas**: Powered by **Liveblocks**, experience zero-latency collaborative editing with live cursors, presence indicators, and synchronized state across all participants.
- **Integrated Team Chat**: Discuss designs in real-time with your team directly within the workspace.

### 📄 Automated Technical Specs
- **Instant Documentation**: Generate comprehensive Markdown technical specifications directly from your canvas designs.
- **Smart Context**: The AI uses both your visual architecture and chat history to produce highly relevant, detailed documentation.
- **Spec Management**: List, preview, and download generated specifications securely.

### 🏗️ Advanced Editor
- **React Flow Integration**: A highly responsive, customizable canvas with support for diverse node shapes, colors, and interactive connections.
- **Auto-save & Persistence**: Your designs are backed by **Vercel Blob** and **Prisma**, ensuring your work is always saved and accessible.

## 🛠️ Technical Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Lucide React
- **Real-time**: Liveblocks (Storage, Presence, Feeds)
- **Background Tasks**: Trigger.dev v3 (Durable AI Workflows)
- **AI Engine**: Google Gemini (via AI SDK)
- **Database**: Prisma (PostgreSQL)
- **Storage**: Vercel Blob
- **Authentication**: Clerk

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- A PostgreSQL database
- API Keys for: Clerk, Liveblocks, Trigger.dev, and Google AI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vivek-736/void-whisper.git
   cd void-whisper
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment variables**
   Copy `.env.example` to `.env` and fill in your credentials.
   ```bash
   cp .env.example .env
   ```

4. **Initialize the database**
   ```bash
   bun prisma generate
   bun prisma db push
   ```

5. **Start the development server**
   ```bash
   bun dev
   ```

6. **Start Trigger.dev worker** (in a separate terminal)
   ```bash
   npx trigger.dev@latest dev
   ```

## 📐 System Architecture

Void Whisper utilizes a modern distributed architecture:
- **Client**: Handles the interactive React Flow canvas and real-time Liveblocks synchronization.
- **API (Next.js)**: Manages authentication, project metadata, and triggers background AI tasks.
- **Workers (Trigger.dev)**: Executes long-running AI agents that use LLMs to mutate the canvas state and generate documentation.
- **Storage**: Persists heavy JSON canvas data and Markdown specs in Vercel Blob for high performance.

---

<div align="center">
  Built with ❤️ by Vivek
</div>