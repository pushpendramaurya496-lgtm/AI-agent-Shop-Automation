const express = require('express');
const router = express.Router();
const shopController = require('./shop.controller');
const { verifyToken } = require('../auth/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Shop
 *   description: Shop Settings, Profile, Delivery Rules & WhatsApp Configuration
 */

/**
 * @swagger
 * /api/v1/shops/profile:
 *   get:
 *     summary: Get profile and settings of the logged-in shop
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved shop profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shop:
 *                   $ref: '#/components/schemas/Shop'
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Shop not found
 */
router.get('/profile', verifyToken, shopController.getProfile);

/**
 * @swagger
 * /api/v1/shops/profile:
 *   put:
 *     summary: Update shop settings (Address, Timings, UPI, Delivery rules)
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shopName:
 *                 type: string
 *                 example: "Gupta Kirana & General Store"
 *               ownerName:
 *                 type: string
 *                 example: "Sunil Gupta"
 *               address:
 *                 type: string
 *                 example: "Shop No. 4, Main Bazar, Lucknow"
 *               openingTime:
 *                 type: string
 *                 example: "08:00 AM"
 *               closingTime:
 *                 type: string
 *                 example: "10:00 PM"
 *               upiId:
 *                 type: string
 *                 example: "guptakirana@okaxis"
 *               deliveryRadiusKm:
 *                 type: number
 *                 example: 5
 *               minimumOrderAmount:
 *                 type: number
 *                 example: 100
 *               deliveryCharges:
 *                 type: number
 *                 example: 20
 *               aiPersonality:
 *                 type: string
 *                 example: "Namaste! Main Gupta Kirana ka digital sahayak hoon."
 *     responses:
 *       200:
 *         description: Shop profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dukan ki settings update ho gayi hain!"
 *                 shop:
 *                   $ref: '#/components/schemas/Shop'
 *       400:
 *         description: Validation or update error
 */
router.put('/profile', verifyToken, shopController.updateProfile);

/**
 * @swagger
 * /api/v1/shops/connect-whatsapp:
 *   post:
 *     summary: Connect Meta WhatsApp Phone Number ID to this shop
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - whatsappPhoneNumberId
 *             properties:
 *               whatsappPhoneNumberId:
 *                 type: string
 *                 example: "105938472910482"
 *                 description: "Phone Number ID obtained from Meta WhatsApp Developer Dashboard"
 *     responses:
 *       200:
 *         description: WhatsApp Phone ID successfully linked to shop
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "WhatsApp Phone ID dukan ke sath jod di gayi hai!"
 *                 shop:
 *                   $ref: '#/components/schemas/Shop'
 *       400:
 *         description: Phone ID missing or already claimed by another shop
 */
router.post('/connect-whatsapp', verifyToken, shopController.connectWhatsApp);

/**
 * @swagger
 * /api/v1/shops/public/{shopId}:
 *   get:
 *     summary: Get public information about a shop (timings, address, upi) without logging in
 *     tags: [Shop]
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop MongoDB ID
 *     responses:
 *       200:
 *         description: Public shop details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shop:
 *                   type: object
 *                   properties:
 *                     _id: { type: string, example: "6708a3d1b82f8a1234567890" }
 *                     shopName: { type: string, example: "Gupta Kirana & General Store" }
 *                     ownerName: { type: string, example: "Sunil Gupta" }
 *                     address: { type: string, example: "Shop No. 4, Main Bazar, Lucknow" }
 *                     openingTime: { type: string, example: "08:00 AM" }
 *                     closingTime: { type: string, example: "10:00 PM" }
 *                     upiId: { type: string, example: "guptakirana@okaxis" }
 *                     deliveryRadiusKm: { type: number, example: 5 }
 *                     minimumOrderAmount: { type: number, example: 100 }
 *                     deliveryCharges: { type: number, example: 20 }
 *       404:
 *         description: Shop not found
 */
router.get('/public/:shopId', shopController.getPublicInfo);

module.exports = router;
