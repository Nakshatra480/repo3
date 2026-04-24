const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Evaluation = require('../models/Evaluation');
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.post('/', auth, async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: 'Startup idea is required' });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `You are an expert startup evaluator and venture capitalist. Evaluate the following startup idea across 15 parameters.
Provide your evaluation STRICTLY as a JSON object with no markdown formatting or extra text.
The JSON object must have the exact following structure:
{
  "scores": {
    "problemClarity": <number 1-10>,
    "targetMarket": <number 1-10>,
    "uniqueness": <number 1-10>,
    "scalability": <number 1-10>,
    "revenueModel": <number 1-10>,
    "feasibility": <number 1-10>,
    "competition": <number 1-10>,
    "timing": <number 1-10>,
    "executionComplexity": <number 1-10>,
    "customerDemand": <number 1-10>,
    "innovationLevel": <number 1-10>,
    "riskFactors": <number 1-10>,
    "growthPotential": <number 1-10>,
    "monetizationStrategy": <number 1-10>,
    "longTermSustainability": <number 1-10>
  },
  "overallScore": <number 1-100>,
  "summary": "<A concise paragraph summarizing the evaluation>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "suggestions": ["<suggestion 1>", "<suggestion 2>", ...]
}

Idea to evaluate:
"${idea}"`;

    let evaluationResult;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      // Clean up markdown if any
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      evaluationResult = JSON.parse(text);
      if (!evaluationResult.summary) {
        evaluationResult.summary = evaluationResult.executiveSummary || evaluationResult.overview || "Executive summary generated successfully, but the AI failed to format it properly. Please review the detailed scores below.";
      }
    } catch (apiError) {
      console.error("Gemini API Error:", apiError);
      // Fallback for missing API key or error
      evaluationResult = {
        scores: {
          problemClarity: 7, targetMarket: 8, uniqueness: 6, scalability: 9, revenueModel: 7,
          feasibility: 6, competition: 5, timing: 8, executionComplexity: 7, customerDemand: 8,
          innovationLevel: 7, riskFactors: 6, growthPotential: 9, monetizationStrategy: 7, longTermSustainability: 8
        },
        overallScore: 76,
        summary: "This is a fallback evaluation because the Gemini API key was missing or an error occurred. The idea shows promise but requires further refinement.",
        strengths: ["Good market potential", "Clear target audience"],
        weaknesses: ["High competition", "Execution is complex"],
        suggestions: ["Define monetization clearly", "Develop an MVP fast"]
      };
    }

    const evaluation = new Evaluation({
      userId: req.user._id,
      idea,
      ...evaluationResult
    });

    await evaluation.save();
    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({ _id: req.params.id, userId: req.user._id });
    if (!evaluation) return res.status(404).json({ error: 'Evaluation not found' });
    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Follow-up chat: contextual Q&A based on an existing evaluation
router.post('/:id/chat', auth, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const evaluation = await Evaluation.findOne({ _id: req.params.id, userId: req.user._id });
    if (!evaluation) return res.status(404).json({ error: 'Evaluation not found' });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: { responseMimeType: 'application/json' }
    });

    // Build context from the existing evaluation
    const evaluationContext = `
ORIGINAL STARTUP IDEA: "${evaluation.idea}"
ORIGINAL SCORES (out of 10): ${JSON.stringify(evaluation.scores)}
ORIGINAL OVERALL SCORE: ${evaluation.overallScore}/100
ORIGINAL SUMMARY: ${evaluation.summary}
ORIGINAL STRENGTHS: ${evaluation.strengths.join(' | ')}
ORIGINAL WEAKNESSES: ${evaluation.weaknesses.join(' | ')}
ORIGINAL SUGGESTIONS: ${evaluation.suggestions.join(' | ')}
    `.trim();

    const historyText = history.length > 0
      ? '\n\nCONVERSATION SO FAR:\n' + history.map(h => `${h.role === 'user' ? 'User' : 'VentureAI'}: ${h.content}`).join('\n')
      : '';

    const prompt = `You are VentureAI, an expert startup advisor and venture capitalist. You previously analyzed a startup idea. The user is following up.

CONTEXT:
${evaluationContext}${historyText}

USER MESSAGE: "${message}"

INSTRUCTIONS:
- Determine if the user is asking for a re-evaluation, updated analysis report, or new scores (e.g. "give me updated analysis", "regenerate the report", "re-evaluate with this info", "show me updated scores").
- If YES, they want a structured analysis report: respond ONLY with a JSON object in this exact format (no markdown, no extra text):
{
  "type": "analysis",
  "data": {
    "scores": { "problemClarity": <1-10>, "targetMarket": <1-10>, "uniqueness": <1-10>, "scalability": <1-10>, "revenueModel": <1-10>, "feasibility": <1-10>, "competition": <1-10>, "timing": <1-10>, "executionComplexity": <1-10>, "customerDemand": <1-10>, "innovationLevel": <1-10>, "riskFactors": <1-10>, "growthPotential": <1-10>, "monetizationStrategy": <1-10>, "longTermSustainability": <1-10> },
    "overallScore": <1-100>,
    "summary": "<concise paragraph>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
    "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"]
  }
}
- If NO, they just want a conversational answer: respond ONLY with a JSON object in this format:
{
  "type": "text",
  "reply": "<your conversational answer in plain text, no markdown>"
}

Respond with ONLY the JSON object, nothing else:`;

    let result;
    try {
      const geminiResult = await model.generateContent(prompt);
      const response = await geminiResult.response;
      let text = response.text().trim();

      // Strip markdown code fences
      text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

      // Extract just the JSON object even if Gemini added surrounding text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      
      result = JSON.parse(jsonMatch[0]);

      // Validate structure
      if (!result.type) result = { type: 'text', reply: text };

    } catch (apiError) {
      console.error('Gemini chat parse error:', apiError.message);
      result = { type: 'text', reply: "I'm sorry, I couldn't process your question right now. Please try again." };
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
