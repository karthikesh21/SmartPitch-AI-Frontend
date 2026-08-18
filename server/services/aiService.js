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
      return this.getMockColdMail({ productName, productDescription, targetRole, problem, valueProposition });
    }

    const system = `You are an elite B2B and B2C sales copywriter. Respond with valid JSON ONLY — no markdown, no code blocks, no extra text outside the JSON object. Generate rich, comprehensive, persuasive, and detailed sales copy. Do not provide brief one-liners; expand each section with compelling value propositions, emotional hooks, and concrete details based on the product description.`;

    const user = `Generate 4 detailed, comprehensive sales pitch formats for:
PRODUCT NAME: ${productName}
PRODUCT DESCRIPTION: ${productDescription || ""}
TARGET AUDIENCE / ROLE: ${targetRole || "Potential Client"}
PROBLEM SOLVED: ${problem || "Key challenges in this domain"}
VALUE PROPOSITION: ${valueProposition || productDescription || productName}

Return EXACTLY this JSON (no extra text):
{
  "email": {
    "subject": "compelling, high-converting email subject line",
    "intro": "engaging, highly personalized 2-3 sentence opener tailored to recipient needs",
    "body": "thorough, detailed 2-paragraph sales copy breaking down the problem, the product solution, key features, and tangible value",
    "cta": "clear, low-friction, persuasive call to action asking for a consultation or demo"
  },
  "linkedin": {
    "hook": "attention-grabbing opening line highlighting a common pain point",
    "benefit": "detailed 2-3 sentence value breakdown highlighting why this product/service is superior",
    "cta": "warm, conversational call to action inviting a quick chat or connection"
  },
  "coldCall": {
    "opening": "warm, confident opening dialogue establishing rapport using [Name] placeholder",
    "problemId": "engaging open-ended discovery question to surface key pain points",
    "pitch": "detailed 3-4 sentence pitch connecting their specific problem to your product solution",
    "objection": "empathetic, tactical objection handler for common pushbacks (busy/not interested)",
    "closing": "concrete, high-converting next-step request"
  },
  "adCopy": {
    "headline": "powerful, high-converting headline capturing key benefit",
    "body": "rich, detailed, multi-sentence ad copy with emotional hook, unique selling points, and urgency",
    "cta": "strong action-oriented button copy"
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
        max_tokens: 1500,
        response_format: { type: "json_object" }
      });

      return this.parseAIJsonResponse(response.choices[0].message.content);
    } catch (err) {
      console.warn("Groq cold mail fallback:", err.message);
      return this.getMockColdMail({ productName, productDescription, targetRole, problem, valueProposition });
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

  getMockColdMail({ productName, productDescription, targetRole, problem, valueProposition }) {
    const pName = productName ? String(productName).trim() : "SmartPitch AI";
    const pDesc = productDescription ? String(productDescription).trim() : "premium custom services and tailored solutions";
    const role = targetRole || "valued clients and key decision makers";

    return {
      email: {
        subject: `Exclusive Tailored Solutions: Transform your results with ${pName}`,
        intro: `Hi [Name],\n\nFinding custom-crafted solutions that deliver exceptional quality and perfect results can be a challenge. As someone seeking high-caliber ${pDesc}, having a dedicated, expert partner like ${pName} makes all the difference.`,
        body: `At ${pName}, we specialize in ${pDesc}. Whether you are looking for flawless custom fittings, bespoke solutions, or personalized services, our expert team ensures unparalleled precision, elegance, and satisfaction.\n\nOur client-first process combines premium craftsmanship with modern convenience, guaranteeing a flawless result tailored specifically to your unique preferences. Top clients choose ${pName} for our fast turnaround, meticulous attention to detail, and personalized experience.`,
        cta: `Would you be open to a quick 10-minute consultation or scheduling your first custom session this week?`
      },
      linkedin: {
        hook: `Looking for top-tier custom quality and perfection with ${pName}?`,
        benefit: `We provide specialized ${pDesc} designed to give you flawless fit, premium elegance, and personalized attention to detail for every requirement.`,
        cta: `Let's connect — I'd love to share our exclusive catalog and client offers with you!`
      },
      coldCall: {
        opening: `Hi [Name], this is our team from ${pName}. I noticed you're looking for expert solutions in ${pDesc}. Did I catch you at a good time?`,
        problemId: `How are you currently managing custom requirements or specialized services for your business or personal needs?`,
        pitch: `${pName} delivers high-precision ${pDesc} with guaranteed perfection, fast turnaround times, and door-to-door personalized service so you achieve your absolute best results.`,
        objection: `I completely understand you might already have an existing routine. Can I send over a quick 1-page overview showcasing our work for you to review when you have a moment?`,
        closing: `Awesome! What is the best email address or contact number to send that over to?`
      },
      adCopy: {
        headline: `Experience Perfection and Tailored Quality with ${pName}`,
        body: `Discover premier ${pDesc} tailored specifically to your unique style and needs. At ${pName}, we combine master craftsmanship, top-tier quality, and precision execution to deliver perfection every single time. Don't settle for generic standard offerings when you can experience bespoke quality handcrafted just for you.`,
        cta: `Book Your Custom Session Today →`
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
