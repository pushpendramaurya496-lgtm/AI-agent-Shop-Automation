const orderService = require('./order.service');

exports.createOrder = async (req, res) => {
    try {
        const shopId = req.shopId || req.body.shopId;
        if (!shopId) {
            return res.status(400).json({ error: 'Shop ID zaroori hai.' });
        }

        const order = await orderService.createOrder(shopId, req.body);
        res.status(201).json({
            message: 'Order kamyabi se ban gaya!',
            order
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        if (!req.shopId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const orders = await orderService.getAllOrders(req.shopId, filter);
        res.status(200).json({
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        if (!req.shopId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const order = await orderService.getOrderById(req.shopId, req.params.id);
        res.status(200).json({ order });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        if (!req.shopId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ error: 'New status provide karna zaroori hai.' });
        }

        const updatedOrder = await orderService.updateOrderStatus(req.shopId, req.params.id, status);
        res.status(200).json({
            message: `Order status ab "${status}" ho gaya hai.`,
            order: updatedOrder
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        if (!req.shopId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const { paymentStatus } = req.body;
        if (!paymentStatus) {
            return res.status(400).json({ error: 'Payment status provide karna zaroori hai.' });
        }

        const updatedOrder = await orderService.updatePaymentStatus(req.shopId, req.params.id, paymentStatus);
        res.status(200).json({
            message: `Payment status ab "${paymentStatus}" ho gaya hai.`,
            order: updatedOrder
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Counter POS Sale Create Karna + WhatsApp Invoice Send Karna
 */
exports.createCounterSale = async (req, res) => {
    try {
        if (!req.shopId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const result = await orderService.createCounterSale(req.shopId, req.body);
        res.status(201).json({
            message: 'Counter bill ban gaya aur WhatsApp par invoice bhej diya gaya!',
            invoiceNumber: result.invoiceNumber,
            whatsappSent: result.whatsappSent,
            order: result.order,
            invoiceText: result.invoiceText
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * WhatsApp Invoice dubara bhejna
 */
exports.resendInvoice = async (req, res) => {
    try {
        if (!req.shopId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const { overridePhone } = req.body;
        const result = await orderService.resendWhatsAppInvoice(req.shopId, req.params.id, overridePhone);
        res.status(200).json({
            message: 'WhatsApp invoice dubara bhej diya gaya!',
            ...result
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Sirf Counter Sales ki list dekhna
 */
exports.getCounterSales = async (req, res) => {
    try {
        if (!req.shopId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const sales = await orderService.getCounterSales(req.shopId);
        res.status(200).json({
            count: sales.length,
            sales
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
