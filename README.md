# EduBot - AI Study Assistant

An intelligent learning companion powered by AI that helps students understand concepts, create summaries, generate quizzes, and make flashcards.

## Features

- 📚 **Explain**: Get clear explanations of complex topics
- 📝 **Summarize**: Create concise summaries of your notes
- ❓ **Quiz**: Generate practice questions
- 🎴 **Flashcards**: Create study flashcards automatically

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI**: Anthropic Claude API
- **Styling**: Tailwind CSS

## Setup

1. Clone the repository
```bash
git clone https://github.com/KiranBelsare/EduBot_final.git
cd EduBot_final
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create .env file with your Supabase credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run development server
```bash
npm run dev
```

## Environment Variables

Add these to Supabase Dashboard → Edge Functions → Environment Variables:
- `ANTHROPIC_API_KEY`: Your Anthropic Claude API key

## Deployment

Deploy to Vercel, Netlify, or any static hosting service.

## License

MIT
