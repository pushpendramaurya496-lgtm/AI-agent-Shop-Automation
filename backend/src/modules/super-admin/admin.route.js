const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { verifyToken } = require('../auth/auth.middleware');
const { verifySuperAdmin } = require('./admin.middleware');

/**
 * @swagger
 * tags:
 *   name: Super Admin
 *   description: Platform Governance, Shop Onboarding Approvals & Master Analytics
 */

/**
 * @swagger
 * /api/v1/admin/setup:
 *   post:
 *     summary: Initial setup to create a Super Admin account
 *     tags: [Super Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - password
 *               - secretSetupKey
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+919999999999"
 *               password:
 *                 type: string
 *                 example: "Admin@12345"
 *               secretSetupKey:
 *                 type: string
 *                 example: "super_secret_admin_setup_key_2026"
 *     responses:
 *       201:
 *         description: Super admin account created
 *       403:
 *         description: Invalid setup key
 */
router.post('/setup', adminController.createSuperAdmin);

/**
 * @swagger
 * /api/v1/admin/login:
 *   post:
 *     summary: Super Admin Login - Authenticate and obtain JWT token for admin control
 *     tags: [Super Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - password
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+919999999999"
 *               password:
 *                 type: string
 *                 example: "Admin@12345"
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token with super_admin role
 *       401:
 *         description: Invalid credentials or not a super admin
 */
router.post('/login', adminController.adminLogin);

/**
 * @swagger
 * /api/v1/admin/forgot-password:
 *   post:
 *     summary: Super Admin Forgot Password - Send OTP to admin mobile
 *     tags: [Super Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+919999999999"
 *     responses:
 *       200:
 *         description: OTP generated
 *       400:
 *         description: Super admin account not found
 */
router.post('/forgot-password', adminController.adminForgotPassword);

/**
 * @swagger
 * /api/v1/admin/reset-password:
 *   post:
 *     summary: Super Admin Reset Password - Verify OTP and update password
 *     tags: [Super Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - otp
 *               - newPassword
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+919999999999"
 *               otp:
 *                 type: string
 *                 example: "1234"
 *               newPassword:
 *                 type: string
 *                 example: "NewAdminPass@2026"
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/reset-password', adminController.adminResetPassword);

/**
 * @swagger
 * /api/v1/admin/pending-shops:
 *   get:
 *     summary: View all pending shop registration applications awaiting approval
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending shops
 *       403:
 *         description: Forbidden (Not a super admin)
 */
router.get('/pending-shops', verifyToken, verifySuperAdmin, adminController.getPendingShopRequests);

/**
 * @swagger
 * /api/v1/admin/shops/{id}/approve:
 *   patch:
 *     summary: APPROVE a pending shop (Unlocks shop login & sends WhatsApp welcome)
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop MongoDB ID
 *     responses:
 *       200:
 *         description: Shop approved successfully
 *       400:
 *         description: Shop already approved or invalid ID
 */
router.patch('/shops/:id/approve', verifyToken, verifySuperAdmin, adminController.approveShop);

/**
 * @swagger
 * /api/v1/admin/shops/{id}/reject:
 *   patch:
 *     summary: REJECT a shop registration application
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop MongoDB ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Invalid phone number or document verification failed"
 *     responses:
 *       200:
 *         description: Shop registration rejected
 */
router.patch('/shops/:id/reject', verifyToken, verifySuperAdmin, adminController.rejectShop);

/**
 * @swagger
 * /api/v1/admin/shops/{id}/suspend:
 *   patch:
 *     summary: SUSPEND an active shop (Temporarily blocks shop login and AI)
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shop MongoDB ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Monthly subscription payment overdue"
 *     responses:
 *       200:
 *         description: Shop suspended
 */
router.patch('/shops/:id/suspend', verifyToken, verifySuperAdmin, adminController.suspendShop);

/**
 * @swagger
 * /api/v1/admin/shops:
 *   get:
 *     summary: List all shops on the platform with filters (Search, Status)
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, SUSPENDED]
 *         description: Filter by approval status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by shop name, owner name, or city
 *     responses:
 *       200:
 *         description: List of all shops
 */
router.get('/shops', verifyToken, verifySuperAdmin, adminController.getAllShops);

/**
 * @swagger
 * /api/v1/admin/shops:
 *   post:
 *     summary: Super Admin Direct Onboarding - Create a pre-approved shop directly
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
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
 *                 example: "Sharma Sweets & Dairy"
 *               ownerName:
 *                 type: string
 *                 example: "Ramesh Sharma"
 *               phoneNumber:
 *                 type: string
 *                 example: "+919812345678"
 *               password:
 *                 type: string
 *                 example: "Sharma@123"
 *               category:
 *                 type: string
 *                 example: "Dairy & Sweets"
 *               city:
 *                 type: string
 *                 example: "Varanasi"
 *               address:
 *                 type: string
 *                 example: "Godowlia Chowk"
 *               plan:
 *                 type: string
 *                 enum: [free, basic, premium]
 *                 example: "basic"
 *               whatsappPhoneNumberId:
 *                 type: string
 *                 example: "109847192837482"
 *     responses:
 *       201:
 *         description: Shop created and pre-approved directly by Super Admin
 *       400:
 *         description: Phone number already exists or validation error
 *       403:
 *         description: Forbidden (Not a Super Admin)
 */
router.post('/shops', verifyToken, verifySuperAdmin, adminController.createShop);

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get platform-wide master analytics (Total shops, total orders, revenue)
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Master platform stats
 */
router.get('/stats', verifyToken, verifySuperAdmin, adminController.getPlatformStats);

module.exports = router;
