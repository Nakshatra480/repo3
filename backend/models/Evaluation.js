const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  idea: { type: String, required: true },
  scores: {
    problemClarity: Number,
    targetMarket: Number,
    uniqueness: Number,
    scalability: Number,
    revenueModel: Number,
    feasibility: Number,
    competition: Number,
    timing: Number,
    executionComplexity: Number,
    customerDemand: Number,
    innovationLevel: Number,
    riskFactors: Number,
    growthPotential: Number,
    monetizationStrategy: Number,
    longTermSustainability: Number
  },
  overallScore: Number,
  summary: String,
  strengths: [String],
  weaknesses: [String],
  suggestions: [String]
}, { timestamps: true });

module.exports = mongoose.model('Evaluation', evaluationSchema);
