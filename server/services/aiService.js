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
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return this.getMockPitch(product, audience, framework);
    }
    try {
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
    } catch (err) {
      console.warn("Groq pitch generation fallback:", err.message);
      return this.getMockPitch(product, audience, framework);
    }
  }

  async generateColdMailPitch({ productName, productDescription, targetRole, problem, valueProposition }) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return this.getMockColdMail({ productName, targetRole, problem, valueProposition });
    }

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
      console.warn("Groq cold mail fallback:", err.message);
      return this.getMockColdMail({ productName, targetRole, problem, valueProposition });
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
      const sanitized = jsonStr.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (m, p1) => {
        return '"' + p1.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"';
      });
      return JSON.parse(sanitized);
    }
  }

  getMockPitch(product, audience, framework) {
    const pName = product?.name || "SmartPitch AI";
    const role = audience?.targetRole || "Decision Maker";
    return `### 🚀 Sales Pitch for ${pName} (${framework} Framework)

**Target Audience:** ${role}

**Attention:** Are you tired of manual sales outreach that yields low response rates? Discover how ${pName} transforms your workflow.

**Interest:** Our platform automates high-converting pitches tailored specifically for ${role}s, delivering personalized messaging in seconds.

**Desire:** Join top sales professionals achieving 3x higher response rates and saving over 10 hours every week.

**Action:** Get started today and claim your free AI pitch generation credits!`;
  }

  getMockColdMail({ productName, targetRole, problem, valueProposition }) {
    const pName = productName || "SmartPitch AI";
    const role = targetRole || "Sales Lead";
    return {
      email: {
        subject: `Transform your sales pipeline with ${pName}`,
        intro: `Hi [Name], as a ${role}, solving ${problem || 'outreach friction'} is crucial to hit your quarterly growth goals.`,
        body: `${pName} simplifies pitch generation, enabling teams to personalize cold emails, LinkedIn messages, and call scripts in seconds. ${valueProposition || 'Boost conversions effortlessly.'}`,
        cta: `Would you be open to a quick 5-minute demo this Thursday?`
      },
      linkedin: {
        hook: `Struggling to scale outbound outreach as a ${role}?`,
        benefit: `${pName} delivers hyper-personalized sales messages designed specifically for your industry targets.`,
        cta: `Let's connect — happy to send over a sample pitch!`
      },
      coldCall: {
        opening: `Hi [Name], this is Karthik calling regarding ${pName}. Did I catch you at a bad time?`,
        problemId: `How are you currently handling ${problem || 'outreach workflows'} for your team?`,
        pitch: `${pName} automates high-converting sales scripts in under 10 seconds, freeing up your reps to focus on closing.`,
        objection: `I completely understand you're busy. Can I email a 1-minute summary for you to review later?`,
        closing: `Great, what is the best email to send that to?`
      },
      adCopy: {
        headline: `Supercharge Your Sales Pitches with AI`,
        body: `Stop wasting hours drafting cold emails. ${pName} creates high-converting B2B pitches tailored to any role instantly.`,
        cta: `Start Free Trial Now`
      }
    };
  }

  buildPrompt(product, audience, framework) {
    return `
Generate a sales pitch using ${framework} framework.

PRODUCT:
Name: ${product?.name || "N/A"}
Description: ${product?.description || "N/A"}

AUDIENCE:
Role: ${audience?.targetRole || "Unknown"}

Generate: 1. Email pitch 2. LinkedIn message 3. Cold call script 4. Ad copy
`;
  }

  getSystemPrompt(framework) {
    return `You are an expert copywriter using ${framework} framework.`;
  }
}

module.exports = new AIService();
