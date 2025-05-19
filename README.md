# Coding Progress Tracker

A Next.js + Supabase app to track your coding progress. This app allows you to create coding projects and log your daily progress for each project.

## Overview

- **Home Page**: Lists all your projects and provides a form to create a new project.
- **Project Detail Page**: Displays all progress logs for a selected project and allows you to add new logs.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)

## Supabase Schema

### Tables

1. **projects**
   - `id` (UUID, primary key)
   - `title` (text)
   - `created_at` (timestamp)

2. **progress_logs**
   - `id` (UUID, primary key)
   - `project_id` (UUID, foreign key referencing `projects.id`)
   - `content` (text)
   - `created_at` (timestamp)

## Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

- **Home Page**: Navigate to `/` to view all projects and create new ones.
- **Project Detail Page**: Click on a project to view its progress logs and add new logs.

## Additional Features

- **Timeline View**: (Optional) A chronological view of progress logs.
- **Analytics**: (Optional) Basic analytics like the number of logs per project.

## License

MIT
