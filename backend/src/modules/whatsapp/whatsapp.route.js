const express = require('express');
const router = express.Router();
const whatsappController = require('./whatsapp.controller');
const { verifyToken } = require('../auth/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: WhatsApp
 *   description: Meta WhatsApp Cloud API Webhook and Outbound Messaging
 */

/**
 * @swagger
 * /api/v1/whatsapp/webhook:
 *   get:
 *     summary: Meta WhatsApp Webhook verification handshake
 *     tags: [WhatsApp]
 *     parameters:
 *       - in: query
 *         name: hub.mode
 *         schema:
 *           type: string
 *         example: "subscribe"
 *       - in: query
 *         name: hub.verify_token
 *         schema:
 *           type: string
 *         example: "shop_home_verify_secret_token_123"
 *       - in: query
 *         name: hub.challenge
 *         schema:
 *           type: string
 *         example: "1158201444"
 *     responses:
 *       200:
 *         description: Webhook verified successfully (Returns challenge)
 *       403:
 *         description: Verification failed
 */
router.get('/webhook', whatsappController.verifyWebhook);

/**
 * @swagger
 * /api/v1/whatsapp/webhook:
 *   post:
 *     summary: Receive incoming WhatsApp messages from Meta
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Meta standard WhatsApp Webhook payload
 *     responses:
 *       200:
 *         description: Event received
 */
router.post('/webhook', whatsappController.receiveWebhook);

/**
 * @swagger
 * /api/v1/whatsapp/send:
 *   post:
 *     summary: Send direct WhatsApp message to a customer (Shopkeeper dashboard)
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientPhone
 *               - messageText
 *             properties:
 *               recipientPhone:
 *                 type: string
 *                 example: "+919876543210"
 *               messageText:
 *                 type: string
 *                 example: "Aapka order pack ho gaya hai aur nikal chuka hai!"
 *     responses:
 *       200:
 *         description: Message sent successfully
 */
router.post('/send', verifyToken, whatsappController.sendDirectMessage);

module.exports = router;
