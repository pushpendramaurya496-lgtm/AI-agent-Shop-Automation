const express = require('express');
const router = express.Router();

const authRoutes = require('../modules/auth/auth.route');
const shopRoutes = require('../modules/shop/shop.route');
const inventoryRoutes = require('../modules/inventory/inventory.route');
const orderRoutes = require('../modules/order/order.route');
const aiAgentRoutes = require('../modules/ai-agent/ai-agent.route');
const whatsappRoutes = require('../modules/whatsapp/whatsapp.route');
const customerRoutes = require('../modules/customer/customer.route');

// Yahan saare modules ke routes ek sath jode jayenge
router.use('/auth', authRoutes);
router.use('/shops', shopRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/orders', orderRoutes);
router.use('/ai-agent', aiAgentRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/customers', customerRoutes);

module.exports = router;
