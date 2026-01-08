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

function generateExplanation(content: string): string {
  return `**Understanding Your Topic**\n\n` +
    `Let me break down "${content.substring(0, 50)}..." for you:\n\n` +
    `**What it means:** This concept relates to understanding the fundamental principles and how they apply in real-world scenarios.\n\n` +
    `**Key Points:**\n` +
    `• The main idea revolves around the core concept you're studying\n` +
    `• It connects to broader themes and practical applications\n` +
    `• Understanding this helps build a foundation for more advanced topics\n\n` +
    `**Example:** Consider a practical scenario where this concept applies in everyday life or common situations.\n\n` +
    `**Study Tip:** Try to relate this concept to something you already know. Making connections helps with retention!`;
}

function generateSummary(content: string): string {
  return `**Summary of Your Notes**\n\n` +
    `**Main Points:**\n` +
    `• First key concept from your material\n` +
    `• Second important idea to remember\n` +
    `• Third essential point for understanding\n` +
    `• Fourth critical detail to note\n\n` +
    `**Key Takeaway:** The most important thing to remember is how these concepts connect and build upon each other.\n\n` +
    `**Quick Review:** Focus on understanding the relationships between these ideas rather than memorizing them individually.`;
}

function generateQuiz(content: string): string {
  return `**Practice Quiz**\n\n` +
    `Test your understanding with these questions:\n\n` +
    `**Question 1:** What is the main concept discussed in this topic?\n` +
    `A) First possible answer\n` +
    `B) Second option\n` +
    `C) Third choice\n` +
    `D) Fourth alternative\n` +
    `*Correct Answer: A*\n\n` +
    `**Question 2:** How does this concept apply in practice?\n` +
    `A) Application method one\n` +
    `B) Application method two\n` +
    `C) Application method three\n` +
    `D) Application method four\n` +
    `*Correct Answer: B*\n\n` +
    `**Question 3:** Which statement best describes the key principle?\n` +
    `A) Description one\n` +
    `B) Description two\n` +
    `C) Description three\n` +
    `D) Description four\n` +
    `*Correct Answer: C*`;
}

function generateFlashcards(content: string): string {
  return `**Study Flashcards**\n\n` +
    `Here are flashcards to help you memorize key concepts:\n\n` +
    `**Card 1:**\n` +
    `Front: What is the main concept?\n` +
    `Back: The fundamental principle that forms the basis of this topic.\n\n` +
    `**Card 2:**\n` +
    `Front: Why is this important?\n` +
    `Back: It helps understand how things work and connect to other concepts.\n\n` +
    `**Card 3:**\n` +
    `Front: How do you apply this?\n` +
    `Back: By following the key steps and understanding the underlying principles.\n\n` +
    `**Card 4:**\n` +
    `Front: What's a common example?\n` +
    `Back: A real-world scenario that demonstrates this concept in action.\n\n` +
    `**Card 5:**\n` +
    `Front: What should you remember?\n` +
    `Back: The core idea and how it relates to other topics you're studying.`;
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

    let response: string;

    switch (mode) {
      case 'explain':
        response = generateExplanation(content);
        break;
      case 'summarize':
        response = generateSummary(content);
        break;
      case 'quiz':
        response = generateQuiz(content);
        break;
      case 'flashcard':
        response = generateFlashcards(content);
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Invalid mode" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    return new Response(
      JSON.stringify({ response }),
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


















// import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// declare const Deno: any;

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
// };

// interface RequestBody {
//   mode: 'explain' | 'summarize' | 'quiz' | 'flashcard';
//   content: string;
// }

// async function generateAIResponse(mode: string, content: string): Promise<string> {
//   const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
  
//   if (!ANTHROPIC_API_KEY) {
//     throw new Error('API key not configured');
//   }

//   const prompts = {
//     explain: `You are a helpful study assistant. Explain the following topic in simple, clear terms suitable for students. Use examples where helpful and break down complex ideas:\n\n${content}`,
//     summarize: `You are a study assistant. Summarize the following notes into clear, concise key points. Focus on the most important information:\n\n${content}`,
//     quiz: `You are a quiz generator. Create 5 multiple-choice questions based on this content. Format each question with 4 options (A, B, C, D) and clearly mark the correct answer:\n\n${content}`,
//     flashcard: `You are a flashcard creator. Generate 5 study flashcards from this content. Format each as:\nFront: [Question or term]\nBack: [Answer or definition]\n\nContent:\n${content}`
//   };

//   try {
//     const response = await fetch('https://api.anthropic.com/v1/messages', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'x-api-key': ANTHROPIC_API_KEY,
//         'anthropic-version': '2023-06-01'
//       },
//       body: JSON.stringify({
//         model: 'claude-3-haiku-20240307',
//         max_tokens: 2048,
//         messages: [{
//           role: 'user',
//           content: prompts[mode as keyof typeof prompts]
//         }]
//       })
//     });

//     if (!response.ok) {
//       const error = await response.text();
//       console.error('API Error:', error);
//       throw new Error('AI service unavailable');
//     }

//     const data = await response.json();
//     return data.content[0].text;
//   } catch (error) {
//     console.error('AI Generation Error:', error);
//     throw error;
//   }
// }

// Deno.serve(async (req: Request) => {
//   if (req.method === "OPTIONS") {
//     return new Response(null, {
//       status: 200,
//       headers: corsHeaders,
//     });
//   }

//   try {
//     const { mode, content }: RequestBody = await req.json();

//     if (!mode || !content) {
//       return new Response(
//         JSON.stringify({ error: "Missing mode or content" }),
//         {
//           status: 400,
//           headers: { ...corsHeaders, "Content-Type": "application/json" },
//         }
//       );
//     }

//     const aiResponse = await generateAIResponse(mode, content);

//     return new Response(
//       JSON.stringify({ response: aiResponse }),
//       {
//         status: 200,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       }
//     );
//   } catch (error) {
//     console.error('Function Error:', error);
//     return new Response(
//       JSON.stringify({ 
//         error: "Unable to process request. Please try again.",
//         details: error instanceof Error ? error.message : 'Unknown error'
//       }),
//       {
//         status: 500,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       }
//     );
//   }
// });