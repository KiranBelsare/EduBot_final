import "jsr:@supabase/functions-js/edge-runtime.d.ts";

declare const Deno: any;

/* -------------------- CORS -------------------- */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

/* -------------------- Types -------------------- */
type Mode = "explain" | "summarize" | "quiz" | "flashcard";

interface RequestBody {
  mode: Mode;
  content: string;
}

/* -------------------- Prompt Builder -------------------- */
function buildPrompt(mode: Mode, topic: string): string {
  const base = `
You are an expert academic teacher.

The topic is: "${topic}"

If the topic is ambiguous, assume the MOST COMMON ACADEMIC meaning
(e.g. "current" = electric current in physics).

Rules:
- No generic study advice
- No vague explanations
- Use real academic knowledge
- Be clear, factual, and structured
`;

  switch (mode) {
    case "explain":
      return `
${base}
Explain the topic in detail.
Include definition, process, formulas (if any), and examples.
`;

    case "summarize":
      return `
${base}
Summarize the topic using bullet points.
Include key definitions and processes.
`;

    case "quiz":
      return `
${base}
Create 5 multiple-choice questions.
Each question must have 4 options (A–D).
Clearly mark the correct answer.
`;

    case "flashcard":
      return `
${base}
Create 5 study flashcards.

Format exactly:
Front: ...
Back: ...
`;
  }
}

/* -------------------- Gemini AI -------------------- */
async function generateAIResponse(
  mode: Mode,
  content: string
): Promise<string> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const prompt = buildPrompt(mode, content);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", errorText);
    throw new Error("AI service unavailable");
  }

  const data = await response.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ??
    "No response generated."
  );
}

/* -------------------- Server -------------------- */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { mode, content } = (await req.json()) as RequestBody;

    if (!mode || !content) {
      return new Response(
        JSON.stringify({ error: "Missing mode or content" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const response = await generateAIResponse(mode, content.trim());

    return new Response(JSON.stringify({ response }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Function Error:", error);
    return new Response(
      JSON.stringify({
        error: "Unable to process request",
        details: error instanceof Error ? error.message : "Unknown error",
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

// function generateExplanation(content: string): string {
//   return `**Understanding Your Topic**\n\n` +
//     `Let me break down "${content.substring(0, 50)}..." for you:\n\n` +
//     `**What it means:** This concept relates to understanding the fundamental principles and how they apply in real-world scenarios.\n\n` +
//     `**Key Points:**\n` +
//     `• The main idea revolves around the core concept you're studying\n` +
//     `• It connects to broader themes and practical applications\n` +
//     `• Understanding this helps build a foundation for more advanced topics\n\n` +
//     `**Example:** Consider a practical scenario where this concept applies in everyday life or common situations.\n\n` +
//     `**Study Tip:** Try to relate this concept to something you already know. Making connections helps with retention!`;
// }

// function generateSummary(content: string): string {
//   return `**Summary of Your Notes**\n\n` +
//     `**Main Points:**\n` +
//     `• First key concept from your material\n` +
//     `• Second important idea to remember\n` +
//     `• Third essential point for understanding\n` +
//     `• Fourth critical detail to note\n\n` +
//     `**Key Takeaway:** The most important thing to remember is how these concepts connect and build upon each other.\n\n` +
//     `**Quick Review:** Focus on understanding the relationships between these ideas rather than memorizing them individually.`;
// }

// function generateQuiz(content: string): string {
//   return `**Practice Quiz**\n\n` +
//     `Test your understanding with these questions:\n\n` +
//     `**Question 1:** What is the main concept discussed in this topic?\n` +
//     `A) First possible answer\n` +
//     `B) Second option\n` +
//     `C) Third choice\n` +
//     `D) Fourth alternative\n` +
//     `*Correct Answer: A*\n\n` +
//     `**Question 2:** How does this concept apply in practice?\n` +
//     `A) Application method one\n` +
//     `B) Application method two\n` +
//     `C) Application method three\n` +
//     `D) Application method four\n` +
//     `*Correct Answer: B*\n\n` +
//     `**Question 3:** Which statement best describes the key principle?\n` +
//     `A) Description one\n` +
//     `B) Description two\n` +
//     `C) Description three\n` +
//     `D) Description four\n` +
//     `*Correct Answer: C*`;
// }

// function generateFlashcards(content: string): string {
//   return `**Study Flashcards**\n\n` +
//     `Here are flashcards to help you memorize key concepts:\n\n` +
//     `**Card 1:**\n` +
//     `Front: What is the main concept?\n` +
//     `Back: The fundamental principle that forms the basis of this topic.\n\n` +
//     `**Card 2:**\n` +
//     `Front: Why is this important?\n` +
//     `Back: It helps understand how things work and connect to other concepts.\n\n` +
//     `**Card 3:**\n` +
//     `Front: How do you apply this?\n` +
//     `Back: By following the key steps and understanding the underlying principles.\n\n` +
//     `**Card 4:**\n` +
//     `Front: What's a common example?\n` +
//     `Back: A real-world scenario that demonstrates this concept in action.\n\n` +
//     `**Card 5:**\n` +
//     `Front: What should you remember?\n` +
//     `Back: The core idea and how it relates to other topics you're studying.`;
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

//     let response: string;

//     switch (mode) {
//       case 'explain':
//         response = generateExplanation(content);
//         break;
//       case 'summarize':
//         response = generateSummary(content);
//         break;
//       case 'quiz':
//         response = generateQuiz(content);
//         break;
//       case 'flashcard':
//         response = generateFlashcards(content);
//         break;
//       default:
//         return new Response(
//           JSON.stringify({ error: "Invalid mode" }),
//           {
//             status: 400,
//             headers: { ...corsHeaders, "Content-Type": "application/json" },
//           }
//         );
//     }

//     return new Response(
//       JSON.stringify({ response }),
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






// //anthropic (not gemini)
// import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// declare const Deno: any;

// /* -------------------- CORS -------------------- */
// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "POST, OPTIONS",
//   "Access-Control-Allow-Headers":
//     "Content-Type, Authorization, X-Client-Info, Apikey",
// };

// /* -------------------- Types -------------------- */
// type Mode = "explain" | "summarize" | "quiz" | "flashcard";

// interface RequestBody {
//   mode: Mode;
//   content: string;
// }

// /* -------------------- AI Logic -------------------- */
// async function generateAIResponse(
//   mode: Mode,
//   content: string
// ): Promise<string> {
//   const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
//   if (!ANTHROPIC_API_KEY) {
//     throw new Error("ANTHROPIC_API_KEY not configured");
//   }

//   const prompts: Record<Mode, string> = {
//     explain: `
// You are an expert academic teacher.

// The topic is: "${content}"

// If the topic is ambiguous, assume the MOST COMMON ACADEMIC meaning
// (e.g. "current" = electric current in physics, "cell" = biological cell).

// Rules:
// - NEVER give generic study advice
// - NEVER be vague
// - Start with a precise definition
// - Explain the concept or process step-by-step
// - Use correct academic terminology
// - Include formulas, processes, or mechanisms when applicable
// - Give real-world or scientific examples

// Explain clearly and accurately.
// `,

//     summarize: `
// You are an expert academic note-taker.

// The topic is: "${content}"

// If ambiguous, assume the most common academic meaning.

// Rules:
// - Use real definitions and factual points
// - Include important processes or mechanisms
// - Use bullet points
// - Avoid generic language or advice

// Produce a concise, factual summary.
// `,

//     quiz: `
// You are an expert academic examiner.

// The topic is: "${content}"

// If ambiguous, assume the most common academic meaning.

// Rules:
// - Create 5 multiple-choice questions
// - Each question must test real knowledge
// - Provide 4 options (A, B, C, D)
// - Clearly indicate the correct answer
// - Cover definitions, processes, and applications
// `,

//     flashcard: `
// You are an expert academic tutor.

// The topic is: "${content}"

// If ambiguous, assume the most common academic meaning.

// Rules:
// - Create 5 topic-specific flashcards
// - Use real terminology and facts
// - No generic learning advice

// Format EXACTLY as:
// Front: ...
// Back: ...
// `,
//   };

//   const response = await fetch("https://api.anthropic.com/v1/messages", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "x-api-key": ANTHROPIC_API_KEY,
//       "anthropic-version": "2023-06-01",
//     },
//     body: JSON.stringify({
//       model: "claude-3-haiku-20240307",
//       // Optional upgrade later:
//       // model: "claude-3-5-sonnet-20240620",
//       max_tokens: 2048,
//       messages: [
//         {
//           role: "user",
//           content: prompts[mode],
//         },
//       ],
//     }),
//   });

//   if (!response.ok) {
//     const errorText = await response.text();
//     console.error("Anthropic API error:", errorText);
//     throw new Error("AI service unavailable");
//   }

//   const data = await response.json();
//   return data.content?.[0]?.text ?? "No response generated.";
// }

// /* -------------------- Server -------------------- */
// Deno.serve(async (req: Request) => {
//   if (req.method === "OPTIONS") {
//     return new Response(null, { status: 200, headers: corsHeaders });
//   }

//   try {
//     const body = (await req.json()) as Partial<RequestBody>;
//     const { mode, content } = body;

//     if (
//       !mode ||
//       !content ||
//       !["explain", "summarize", "quiz", "flashcard"].includes(mode)
//     ) {
//       return new Response(
//         JSON.stringify({ error: "Invalid or missing mode/content" }),
//         {
//           status: 400,
//           headers: { ...corsHeaders, "Content-Type": "application/json" },
//         }
//       );
//     }

//     const aiResponse = await generateAIResponse(mode, content.trim());

//     return new Response(JSON.stringify({ response: aiResponse }), {
//       status: 200,
//       headers: { ...corsHeaders, "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Function Error:", error);
//     return new Response(
//       JSON.stringify({
//         error: "Unable to process request. Please try again.",
//         details: error instanceof Error ? error.message : "Unknown error",
//       }),
//       {
//         status: 500,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       }
//     );
//   }
// });