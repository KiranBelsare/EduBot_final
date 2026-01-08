import "jsr:@supabase/functions-js/edge-runtime.d.ts";

declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  mode: 'explain' | 'summarize' | 'quiz' | 'flashcard';
  content: string;
}

async function generateAIResponse(mode: string, content: string): Promise<string> {
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
  
  if (!ANTHROPIC_API_KEY) {
    throw new Error('API key not configured');
  }

  const prompts = {
    explain: `You are a helpful study assistant. Explain the following topic in simple, clear terms suitable for students. Use examples where helpful and break down complex ideas:\n\n${content}`,
    summarize: `You are a study assistant. Summarize the following notes into clear, concise key points. Focus on the most important information:\n\n${content}`,
    quiz: `You are a quiz generator. Create 5 multiple-choice questions based on this content. Format each question with 4 options (A, B, C, D) and clearly mark the correct answer:\n\n${content}`,
    flashcard: `You are a flashcard creator. Generate 5 study flashcards from this content. Format each as:\nFront: [Question or term]\nBack: [Answer or definition]\n\nContent:\n${content}`
  };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: prompts[mode as keyof typeof prompts]
        }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('API Error:', error);
      throw new Error('AI service unavailable');
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { mode, content }: RequestBody = await req.json();

    if (!mode || !content) {
      return new Response(
        JSON.stringify({ error: "Missing mode or content" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiResponse = await generateAIResponse(mode, content);

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Function Error:', error);
    return new Response(
      JSON.stringify({ 
        error: "Unable to process request. Please try again.",
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});