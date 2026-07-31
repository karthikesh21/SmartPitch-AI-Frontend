const Groq = require("groq-sdk");

class AIService {
  constructor() {
    this.groq = null;
  }

  getGroq() {
    if (!this.groq) {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        console.warn("⚠️ GROQ_API_KEY environment variable is missing.");
      }
      this.groq = new Groq({ apiKey: apiKey || 'dummy-key-for-init' });
    }
    return this.groq;
  }

  async generatePitch(product, audience, framework = "AIDA") {
    const prompt = this.buildPrompt(product, audience, framework);
    const groq = this.getGroq();
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: this.getSystemPrompt(framework) },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });
    return response.choices[0].message.content;
  }

  async generateColdMailPitch({ productName, productDescription, targetRole, problem, valueProposition }) {
    const system = `You are an elite B2B sales copywriter. Respond with valid JSON ONLY — no markdown, no code blocks, no extra text outside the JSON object.`;

    const user = `Generate 4 sales pitch formats for:
PRODUCT: ${productName}
DESCRIPTION: ${productDescription || ""}
TARGET ROLE: ${targetRole}
PROBLEM SOLVED: ${problem}
VALUE PROP: ${valueProposition || ""}

Return EXACTLY this JSON (no extra text):
{
  "email": {
    "subject": "compelling subject under 50 chars",
    "intro": "personalized 1-2 sentence opener for ${targetRole}",
    "body": "Problem → Solution → Value (3-4 sentences)",
    "cta": "specific low-friction call to action"
  },
  "linkedin": {
    "hook": "bold opening line max 15 words",
    "benefit": "1-3 sentences on tangible benefit for their role",
    "cta": "soft conversational CTA"
  },
  "coldCall": {
    "opening": "warm confident opener using [Name] placeholder",
    "problemId": "open-ended question to surface the problem",
    "pitch": "3-sentence pitch connecting problem to solution",
    "objection": "empathetic 1-line response to not interested",
    "closing": "concrete next step ask"
  },
  "adCopy": {
    "headline": "punchy headline under 8 words",
    "body": "3-4 lines: emotional hook, benefit, urgency",
    "cta": "action button text 3-5 words"
  }
}`;

    try {
      const groq = this.getGroq();
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.75,
        max_tokens: 1200,
        response_format: { type: "json_object" }
      });
      
      return this.parseAIJsonResponse(response.choices[0].message.content);
    } catch (err) {
      console.error("Cold mail AI error:", err);
      throw err;
    }
  }

  parseAIJsonResponse(rawContent) {
    const raw = (rawContent || "").trim()
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/g, "")
      .trim();

    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in AI response");

    const jsonStr = match[0];
    try {
      return JSON.parse(jsonStr);
    } catch (firstErr) {
      try {
        const sanitized = jsonStr.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (m, p1) => {
          return '"' + p1.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"';
        });
        return JSON.parse(sanitized);
      } catch (secondErr) {
        const fallbackClean = jsonStr.replace(/[\u0000-\u001F]+/g, " ");
        return JSON.parse(fallbackClean);
      }
    }
  }

  buildPrompt(product, audience, framework) {
    return `
Generate a sales pitch using ${framework} framework.

PRODUCT:
Name: ${product?.name || "N/A"}
Description: ${product?.description || "N/A"}
Features:
${(product?.features || []).map(f => `- ${f.feature}: ${f.benefit}`).join('\n')}
Problems Solved: ${(product?.problemsSolved || []).join(", ")}
USP: ${(product?.uniqueSellingPoints || []).join(", ")}

AUDIENCE:
Role: ${audience?.targetRole || "Unknown"}
Pain Points: ${(audience?.painPoints || []).join(", ")}
Desired Outcomes: ${(audience?.desiredOutcomes || []).join(", ")}

Generate: 1. Email pitch 2. LinkedIn message 3. Cold call script 4. Ad copy
`;
  }

  getSystemPrompt(framework) {
    return `You are an expert copywriter using ${framework} framework.`;
  }
}

module.exports = new AIService();