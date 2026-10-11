const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const { verifyToken } = require('../auth/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order Management and WhatsApp Booking API
 */

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create a new customer order
 *     tags: [Orders]
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
 *               - items
 *             properties:
 *               customerPhone:
 *                 type: string
 *                 example: "+919876543210"
 *               customerName:
 *                 type: string
 *                 example: "Rahul Sharma"
 *               deliveryAddress:
 *                 type: string
 *                 example: "Flat 204, Shivam Apartment, Main Road"
 *               source:
 *                 type: string
 *                 enum: [WHATSAPP, MANUAL]
 *                 example: "WHATSAPP"
 *               orderNotes:
 *                 type: string
 *                 example: "Deliver before 6 PM"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - itemName
 *                     - quantity
 *                     - price
 *                   properties:
 *                     productId:
 *                       type: string
 *                       example: "6708a3d1b82f8a1234567890"
 *                     itemName:
 *                       type: string
 *                       example: "Fortune Mustard Oil 1L"
 *                     quantity:
 *                       type: number
 *                       example: 2
 *                     price:
 *                       type: number
 *                       example: 145
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid input or insufficient stock
 */
router.post('/', verifyToken, orderController.createOrder);

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get all orders for the logged-in shop
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, PACKED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED]
 *         description: Optional status filter
 *     responses:
 *       200:
 *         description: List of shop orders
 *       403:
 *         description: Unauthorized
 */
router.get('/', verifyToken, orderController.getAllOrders);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get('/:id', verifyToken, orderController.getOrderById);

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   patch:
 *     summary: Update order status (PENDING, CONFIRMED, PACKED, DELIVERED, CANCELLED)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, PACKED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED]
 *                 example: "PACKED"
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Invalid status
 */
router.patch('/:id/status', verifyToken, orderController.updateOrderStatus);

/**
 * @swagger
 * /api/v1/orders/{id}/payment:
 *   patch:
 *     summary: Update order payment status (UNPAID or PAID)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentStatus
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [UNPAID, PAID]
 *                 example: "PAID"
 *     responses:
 *       200:
 *         description: Payment status updated
 *       400:
 *         description: Invalid status
 */
router.patch('/:id/payment', verifyToken, orderController.updatePaymentStatus);

/**
 * @swagger
 * /api/v1/orders/counter-sale:
 *   post:
 *     summary: POS Walk-in Sale - Create bill, deduct stock & send WhatsApp Invoice to customer
 *     tags: [Orders]
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
 *               - items
 *             properties:
 *               customerPhone:
 *                 type: string
 *                 example: "+919876543210"
 *                 description: Customer WhatsApp mobile number
 *               customerName:
 *                 type: string
 *                 example: "Ramesh Sharma"
 *               paymentMode:
 *                 type: string
 *                 enum: [CASH, UPI, CARD, UDHAAR, ONLINE]
 *                 example: "CASH"
 *               orderNotes:
 *                 type: string
 *                 example: "Counter Walk-in Sale"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - itemName
 *                     - quantity
 *                     - price
 *                   properties:
 *                     itemName:
 *                       type: string
 *                       example: "Fortune Mustard Oil 1L"
 *                     quantity:
 *                       type: number
 *                       example: 1
 *                     price:
 *                       type: number
 *                       example: 145
 *     responses:
 *       201:
 *         description: Bill generated and WhatsApp invoice dispatched
 *       400:
 *         description: Stock issue or validation error
 */
router.post('/counter-sale', verifyToken, orderController.createCounterSale);

/**
 * @swagger
 * /api/v1/orders/{id}/send-invoice:
 *   post:
 *     summary: Re-send WhatsApp digital bill to customer
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order MongoDB ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               overridePhone:
 *                 type: string
 *                 example: "+919876543210"
 *                 description: Optional different phone number if customer changed number
 *     responses:
 *       200:
 *         description: WhatsApp invoice re-sent successfully
 *       404:
 *         description: Order not found
 */
router.post('/:id/send-invoice', verifyToken, orderController.resendInvoice);

/**
 * @swagger
 * /api/v1/orders/counter-sales:
 *   get:
 *     summary: Get all walk-in counter sales (POS bills history)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of counter sales
 */
router.get('/counter-sales', verifyToken, orderController.getCounterSales);

module.exports = router;
