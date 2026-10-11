const express = require('express');
const router = express.Router();
const aiAgentController = require('./ai-agent.controller');
const { verifyToken } = require('../auth/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: AI Agent
 *   description: AI Munshi (Automated Sales Assistant & Conversation Management)
 */

/**
 * @swagger
 * /api/v1/ai-agent/chat:
 *   post:
 *     summary: Chat with the AI Munshi (Simulate WhatsApp conversation)
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerPhone
 *               - message
 *             properties:
 *               customerPhone:
 *                 type: string
 *                 example: "+919876543210"
 *               message:
 *                 type: string
 *                 example: "Bhaiya 2 packet Maggi aur 1 packet Fortune Tel hai kya?"
 *     responses:
 *       200:
 *         description: AI Munshi response with inventory check or order booking
 *       400:
 *         description: Missing fields
 */
router.post('/chat', verifyToken, aiAgentController.chatWithAgent);

/**
 * @swagger
 * /api/v1/ai-agent/history/{customerPhone}:
 *   get:
 *     summary: Get conversation history with a customer
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerPhone
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer phone number
 *     responses:
 *       200:
 *         description: Conversation history
 */
router.get('/history/:customerPhone', verifyToken, aiAgentController.getChatHistory);

/**
 * @swagger
 * /api/v1/ai-agent/toggle:
 *   patch:
 *     summary: Enable or disable AI Munshi (Turn on/off auto-replies)
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - aiEnabled
 *             properties:
 *               aiEnabled:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: AI status updated
 */
router.patch('/toggle', verifyToken, aiAgentController.toggleAiStatus);

module.exports = router;
