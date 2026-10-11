const adminService = require('./admin.service');

exports.createShop = async (req, res) => {
    try {
        const { shopName, ownerName, phoneNumber, password } = req.body;
        if (!shopName || !ownerName || !phoneNumber || !password) {
            return res.status(400).json({ error: 'shopName, ownerName, phoneNumber aur password chaaron zaroori hain.' });
        }

        const result = await adminService.createShopByAdmin(req.body, req.authId);
        res.status(201).json({
            message: `Super Admin dwara dukan "${result.shop.shopName}" successfully create aur approve kar di gayi hai!`,
            shop: result.shop
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getPendingShopRequests = async (req, res) => {
    try {
        const pendingShops = await adminService.getPendingShopRequests();
        res.status(200).json({
            count: pendingShops.length,
            pendingShops
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.approveShop = async (req, res) => {
    try {
        const { id } = req.params;
        const approvedShop = await adminService.approveShop(id, req.authId);
        res.status(200).json({
            message: `Dukan "${approvedShop.shopName}" ko kamyabi se APPROVE kar diya gaya hai!`,
            shop: approvedShop
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.rejectShop = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const rejectedShop = await adminService.rejectShop(id, req.authId, reason);
        res.status(200).json({
            message: `Dukan "${rejectedShop.shopName}" ki request REJECT kar di gayi hai.`,
            shop: rejectedShop
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.suspendShop = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const suspendedShop = await adminService.suspendShop(id, req.authId, reason);
        res.status(200).json({
            message: `Dukan "${suspendedShop.shopName}" ko temporarily SUSPEND kar diya gaya hai.`,
            shop: suspendedShop
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllShops = async (req, res) => {
    try {
        const shops = await adminService.getAllShops(req.query);
        res.status(200).json({
            count: shops.length,
            shops
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPlatformStats = async (req, res) => {
    try {
        const stats = await adminService.getPlatformStats();
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createSuperAdmin = async (req, res) => {
    try {
        const { phoneNumber, password, secretSetupKey } = req.body;

        // Security check for initial setup
        const expectedKey = process.env.ADMIN_SETUP_KEY || 'super_secret_admin_setup_key_2026';
        if (secretSetupKey !== expectedKey) {
            return res.status(403).json({ error: 'Galat setup key!' });
        }

        if (!phoneNumber || !password) {
            return res.status(400).json({ error: 'phoneNumber aur password dono zaroori hain.' });
        }

        const admin = await adminService.createSuperAdmin(phoneNumber, password);
        res.status(201).json({
            message: 'Super Admin account successfully create ho gaya!',
            phoneNumber: admin.phoneNumber,
            role: admin.role
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.adminLogin = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;
        if (!phoneNumber || !password) {
            return res.status(400).json({ error: 'Phone Number aur Password dono zaroori hain.' });
        }

        const result = await adminService.adminLogin(phoneNumber, password);
        res.status(200).json({
            message: 'Super Admin Login Kamyab!',
            token: result.token,
            admin: result.admin
        });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

exports.adminForgotPassword = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone Number zaroori hai.' });
        }

        const testOtp = await adminService.adminForgotPassword(phoneNumber);
        res.status(200).json({
            message: 'Super Admin OTP bhej diya gaya hai (Testing ke liye console dekhein).',
            testOtp
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.adminResetPassword = async (req, res) => {
    try {
        const { phoneNumber, otp, newPassword } = req.body;
        if (!phoneNumber || !otp || !newPassword) {
            return res.status(400).json({ error: 'Phone, OTP aur Naya Password sabhi zaroori hain.' });
        }

        await adminService.adminResetPassword(phoneNumber, otp, newPassword);
        res.status(200).json({
            message: 'Super Admin Password successfully update ho gaya!'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
