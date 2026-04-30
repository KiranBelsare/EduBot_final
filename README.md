# EduBot - AI Study Assistant

An intelligent learning companion powered by AI that helps students understand concepts, create summaries, generate quizzes, and make flashcards.
<img width="1440" height="1020" alt="SCR-20260501-bpcy" src="https://github.com/user-attachments/assets/29f704bc-d4b3-4c0f-8009-3d554ecb93b2" />

## ✨ Features

* 📚 **Explain**: Get clear, detailed explanations of complex topics with definitions, processes, and examples
* 📝 **Summarize**: Create concise bullet-point summaries of your study material
* ❓ **Quiz**: Generate 5 multiple-choice questions with 4 options each to test your knowledge
* 🎴 **Flashcards**: Automatically create study flashcards in Front/Back format for effective learning

## 🚀 Tech Stack

### Frontend
* **React** - Modern UI library for building interactive interfaces
* **TypeScript** - Type-safe JavaScript for better code quality and maintainability
* **Vite** - Lightning-fast build tool and development server
* **Tailwind CSS** - Utility-first CSS framework for responsive design

### Backend & Database
* **Supabase** - Complete backend platform providing:
  - PostgreSQL database for data storage
  - Edge Functions for serverless API endpoints
  - Real-time capabilities
  - Row-level security

### AI/LLM Integration
* **OpenRouter API** - Unified API gateway for accessing multiple AI models
* **Meta Llama 3 8B Instruct** - Open-source language model for generating responses
  - 8 billion parameters
  - Instruction-tuned for following prompts accurately
  - Fast and efficient for educational content

### Deployment
* **Vercel** - Frontend hosting with automatic deployments
* **Supabase Edge Functions** - Globally distributed serverless backend

## 🛠️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/KiranBelsare/EduBot_final.git
cd EduBot_final
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Configure Supabase Edge Function

In your Supabase Dashboard:
1. Go to **Edge Functions** → **Environment Variables**
2. Add the following variable:
   - `OPENROUTER_API_KEY`: Your OpenRouter API key

### 5. Deploy Edge Function (if not already deployed)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Deploy the edge function
supabase functions deploy ai-study
```

### 6. Run development server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure
```
EduBot_final/
├── src/                      # React frontend source code
│   ├── components/          # React components
│   ├── lib/                 # Utility functions and Supabase client
│   └── App.tsx              # Main application component
├── supabase/
│   └── functions/
│       └── ai-study/        # Edge function for AI processing
│           └── index.ts     # Main edge function code
├── .env.example             # Template for environment variables
├── .gitignore               # Files to ignore in git
├── package.json             # Project dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── index.html               # Entry HTML file
```

## 🔑 Environment Variables Reference

### Frontend (.env file)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Backend (Supabase Dashboard → Edge Functions)
```env
OPENROUTER_API_KEY=your-openrouter-api-key
```

## 🎯 How It Works

1. **User Input**: Student enters a topic they want to learn about
2. **Mode Selection**: Choose between Explain, Summarize, Quiz, or Flashcard mode
3. **Request Processing**: Frontend sends request to Supabase Edge Function
4. **AI Generation**: Edge function calls OpenRouter API with custom prompts
5. **Llama 3 Response**: AI model generates educational content
6. **Display Results**: Response is formatted and displayed to the user

## 🌐 API Integration

The project uses OpenRouter's unified API to access Meta's Llama 3 model:
```typescript
POST https://openrouter.ai/api/v1/chat/completions

Headers:
- Authorization: Bearer ${OPENROUTER_API_KEY}
- Content-Type: application/json

Body:
{
  "model": "meta-llama/llama-3-8b-instruct",
  "messages": [{ "role": "user", "content": "..." }]
}
```

## 📚 Available Modes

### 1. Explain Mode
Provides detailed explanations with:
- Clear definitions
- Step-by-step processes
- Real-world examples
- Academic terminology

### 2. Summarize Mode
Creates concise summaries with:
- Bullet-point format
- Key facts and concepts
- Quick reference material
- Essential takeaways

### 3. Quiz Mode
Generates practice questions:
- 5 multiple-choice questions
- 4 options per question
- Correct answers marked
- Tests comprehension

### 4. Flashcard Mode
Creates study flashcards:
- 5 flashcard pairs
- Front: Question or term
- Back: Answer or definition
- Perfect for spaced repetition

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Deploy Edge Functions
```bash
supabase functions deploy ai-study
```

## 🔒 Security Features

- API keys stored securely in environment variables
- CORS headers properly configured
- Input validation on all requests
- Error handling with detailed logging
- Row-level security (if using database)

## 🎓 Learning Outcomes

This project demonstrates:
- Full-stack development with modern tools
- Serverless architecture with edge functions
- AI/LLM API integration
- Prompt engineering techniques
- TypeScript for type safety
- Environment configuration management
- RESTful API design
- Cloud deployment workflows

## 📝 License

MIT License - feel free to use this project for learning or building your own applications!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 👨‍💻 Author

**Kiran Belsare**
- GitHub: [@KiranBelsare](https://github.com/KiranBelsare)

## 🌟 Acknowledgments

- Built with React, TypeScript, and Vite
- Powered by Supabase and OpenRouter
- AI responses by Meta Llama 3
- Deployed on Vercel

---

**Live Demo**: [edu-bot-final.vercel.app](https://edu-bot-final.vercel.app)

**Note**: This is a learning project showcasing modern full-stack development with AI integration. Perfect for students learning React, TypeScript, serverless architecture, and LLM APIs!
