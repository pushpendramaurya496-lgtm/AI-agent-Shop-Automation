const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Public Shop Registration - Request onboarding on platform (Requires Super Admin approval)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shopName
 *               - ownerName
 *               - phoneNumber
 *               - password
 *             properties:
 *               shopName:
 *                 type: string
 *                 example: "Gupta Kirana Store"
 *               ownerName:
 *                 type: string
 *                 example: "Sunil Gupta"
 *               phoneNumber:
 *                 type: string
 *                 example: "+919876543210"
 *               password:
 *                 type: string
 *                 example: "Gupta@12345"
 *               category:
 *                 type: string
 *                 example: "Kirana / Grocery"
 *               city:
 *                 type: string
 *                 example: "Lucknow"
 *               address:
 *                 type: string
 *                 example: "Shop No. 4, Main Bazar"
 *     responses:
 *       201:
 *         description: Registration request submitted (Approval pending from Super Admin)
 *       400:
 *         description: Validation error or phone already registered
 */
router.post('/signup', authController.signup);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login to dashboard
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request OTP to reset password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post('/reset-password', authController.resetPassword);

module.exports = router;
