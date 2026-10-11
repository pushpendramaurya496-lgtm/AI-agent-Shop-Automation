const express = require('express');
const router = express.Router();
const inventoryController = require('./inventory.controller');
const { verifyToken } = require('../auth/auth.middleware');

// In saare routes par 'verifyToken' laga hai, yaani bina login koi kuch nahi kar sakta!

/**
 * @swagger
 * /api/v1/inventory:
 *   get:
 *     summary: Get all items for the logged-in shop
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of items
 */
router.get('/', verifyToken, inventoryController.getAllItems);

/**
 * @swagger
 * /api/v1/inventory:
 *   post:
 *     summary: Add a new item to the shop
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemName:
 *                 type: string
 *               price:
 *                 type: number
 *               stockQuantity:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item added successfully
 */
router.post('/', verifyToken, inventoryController.addItem);

/**
 * @swagger
 * /api/v1/inventory/{id}:
 *   put:
 *     summary: Update an item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *               stockQuantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Item updated successfully
 */
router.put('/:id', verifyToken, inventoryController.updateItem);

/**
 * @swagger
 * /api/v1/inventory/{id}:
 *   delete:
 *     summary: Delete an item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item deleted successfully
 */
router.delete('/:id', verifyToken, inventoryController.deleteItem);

module.exports = router;
