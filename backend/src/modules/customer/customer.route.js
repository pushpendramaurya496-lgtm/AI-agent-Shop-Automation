const express = require('express');
const router = express.Router();
const customerController = require('./customer.controller');
const { verifyToken } = require('../auth/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer Relationship Management (CRM) & Udhaar Khata Book
 */

/**
 * @swagger
 * /api/v1/customers:
 *   get:
 *     summary: Get all customers with search and spend stats
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by customer name or phone number (e.g., "Ramesh" or "9876")
 *     responses:
 *       200:
 *         description: Successfully fetched customers list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 1
 *                 customers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 *       403:
 *         description: Unauthorized
 */
router.get('/', verifyToken, customerController.getAllCustomers);

/**
 * @swagger
 * /api/v1/customers:
 *   post:
 *     summary: Register or add a new customer manually
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
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
 *                 example: "+919876543210"
 *               name:
 *                 type: string
 *                 example: "Ramesh Kumar"
 *               defaultAddress:
 *                 type: string
 *                 example: "Flat 204, Shivam Apartment, Main Road"
 *     responses:
 *       201:
 *         description: Customer registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Grahak register ho gaya!"
 *                 customer:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Phone number missing or invalid
 */
router.post('/', verifyToken, customerController.createCustomer);

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   get:
 *     summary: Get customer details along with their past order history
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer MongoDB ID
 *     responses:
 *       200:
 *         description: Customer profile and order history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customer:
 *                   $ref: '#/components/schemas/Customer'
 *                 recentOrders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       404:
 *         description: Customer not found
 */
router.get('/:id', verifyToken, customerController.getCustomerById);

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   put:
 *     summary: Update customer information (Name, Default Address, Notes)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer MongoDB ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Ramesh Sharma"
 *               defaultAddress:
 *                 type: string
 *                 example: "House No 12, Main Market, Landmark: Near Shiv Mandir"
 *               notes:
 *                 type: string
 *                 example: "Prefers morning deliveries before 10 AM"
 *     responses:
 *       200:
 *         description: Customer profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Grahak ki profile update ho gayi!"
 *                 customer:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Update failed
 */
router.put('/:id', verifyToken, customerController.updateCustomer);

/**
 * @swagger
 * /api/v1/customers/{id}/balance:
 *   patch:
 *     summary: Update customer Udhaar / Khata balance (+ for udhaar debt, - for payment received)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer MongoDB ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amountChange
 *             properties:
 *               amountChange:
 *                 type: number
 *                 example: 250
 *                 description: Positive number adds debt (+ ₹250). Negative number records cash paid (- ₹250).
 *               note:
 *                 type: string
 *                 example: "Cash received via UPI"
 *     responses:
 *       200:
 *         description: Khata balance updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Khata balance update ho gaya!"
 *                 outstandingBalance:
 *                   type: number
 *                   example: 250
 *                 customer:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Invalid amount
 */
router.patch('/:id/balance', verifyToken, customerController.updateBalance);

module.exports = router;
