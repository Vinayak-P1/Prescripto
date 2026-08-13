import express from 'express';
import { analyzeSymptoms, chatWithBot, getDashboardInsights, analyzeReport } from '../controllers/aiController.js';
import authUser from '../middlewares/authUser.js';
import authAdmin from '../middlewares/authAdmin.js';

const aiRouter = express.Router();

// Module 1: Symptom Checker (public - no auth needed for better UX, but can add auth)
aiRouter.post('/analyze-symptoms', analyzeSymptoms);

// Module 2: Chatbot (public)
aiRouter.post('/chat', chatWithBot);

// Module 3: Admin Analytics with AI Insights (requires admin auth)
aiRouter.get('/dashboard-insights', authAdmin, getDashboardInsights);

// Module 4: Report Analyzer (requires user auth)
aiRouter.post('/analyze-report', analyzeReport);

export default aiRouter;
