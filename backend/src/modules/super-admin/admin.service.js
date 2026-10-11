const Shop = require('../shop/shop.model');
const Auth = require('../auth/auth.model');
const Order = require('../order/order.model');
const Inventory = require('../inventory/inventory.model');
const bcrypt = require('bcrypt');

/**
 * 0. Super Admin dwara Seedhi Nayi Dukan Add Karna (Already Approved)
 */
exports.createShopByAdmin = async (shopData, adminAuthId) => {
    const { phoneNumber, password, shopName, ownerName, category, city, address, plan, whatsappPhoneNumberId } = shopData;

    const existingAuth = await Auth.findOne({ phoneNumber });
    if (existingAuth) {
        throw new Error('Yeh phone number pehle se register hai.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAuth = new Auth({
        phoneNumber,
        password: hashedPassword,
        role: 'shop_owner'
    });
    await newAuth.save();

    const newShop = new Shop({
        authId: newAuth._id,
        shopName,
        ownerName,
        category: category || 'Kirana / Grocery',
        city: city || '',
        address: address || '',
        plan: plan || 'free',
        whatsappPhoneNumberId: whatsappPhoneNumberId || '',
        approvalStatus: 'APPROVED', // Super Admin ne khud banayi hai toh turant APPROVED!
        approvedAt: new Date(),
        approvedBy: adminAuthId
    });
    await newShop.save();

    return {
        authId: newAuth._id,
        shopId: newShop._id,
        shop: newShop
    };
};

/**
 * 1. Nayi Dukanon ki Pending Arziyan (Shop Requests) nikalna
 */
exports.getPendingShopRequests = async () => {
    return await Shop.find({ approvalStatus: 'PENDING' })
        .populate('authId', 'phoneNumber createdAt')
        .sort({ createdAt: -1 });
};

/**
 * 2. Dukan ko APPROVE karna (Hari Jhandi dikhana)
 * Sath hi dukan ke WhatsApp par congratulatory sandesh bhejta hai!
 */
exports.approveShop = async (shopId, adminAuthId) => {
    const shop = await Shop.findById(shopId).populate('authId', 'phoneNumber');
    if (!shop) {
        throw new Error('Dukan nahi mili.');
    }

    if (shop.approvalStatus === 'APPROVED') {
        throw new Error('Yeh dukan pehle se approved hai.');
    }

    shop.approvalStatus = 'APPROVED';
    shop.approvedAt = new Date();
    shop.approvedBy = adminAuthId;
    shop.rejectionReason = '';
    await shop.save();

    // Dukandar ke phone par WhatsApp welcome sandesh bhejna
    const ownerPhone = shop.authId && shop.authId.phoneNumber;
    if (ownerPhone) {
        try {
            const whatsappService = require('../whatsapp/whatsapp.service');
            const welcomeMsg = `🎉 *Mubarak ho ${shop.ownerName} ji!* 🙏\n\nAapki dukan *"${shop.shopName}"* hamare platform par Super Admin dwara *APPROVE* kar di gayi hai!\n\nAb aapka WhatsApp AI E-Commerce panel taiyar hai:\n📱 Login Mobile: ${ownerPhone}\n🌐 Login Link: http://localhost:3000/api-docs\n\nAbhi login karein aur apni dukan ka samaan add karna shuru karein!`;
            
            const activePhoneId = shop.whatsappPhoneNumberId || '100000000000000';
            await whatsappService.sendTextMessage(activePhoneId, ownerPhone, welcomeMsg);
        } catch (waErr) {
            console.error('WhatsApp notification error on approval:', waErr.message);
        }
    }

    return shop;
};

/**
 * 3. Dukan ki Request REJECT karna
 */
exports.rejectShop = async (shopId, adminAuthId, reason) => {
    const shop = await Shop.findById(shopId);
    if (!shop) {
        throw new Error('Dukan nahi mili.');
    }

    shop.approvalStatus = 'REJECTED';
    shop.rejectionReason = reason || 'Verification criteria meet nahi hua.';
    await shop.save();

    return shop;
};

/**
 * 4. Kisi dukan ko TEMPORARILY SUSPEND / BLOCK karna
 */
exports.suspendShop = async (shopId, adminAuthId, reason) => {
    const shop = await Shop.findById(shopId);
    if (!shop) {
        throw new Error('Dukan nahi mili.');
    }

    shop.approvalStatus = 'SUSPENDED';
    shop.rejectionReason = reason || 'Subscription unpaid ya policy violation.';
    await shop.save();

    return shop;
};

/**
 * 5. Platform ki Saari Dukanon ki List (Filters support)
 */
exports.getAllShops = async (filters = {}) => {
    const query = {};

    if (filters.status) {
        query.approvalStatus = filters.status;
    }

    if (filters.search) {
        const regex = new RegExp(filters.search.trim(), 'i');
        query.$or = [
            { shopName: regex },
            { ownerName: regex },
            { city: regex }
        ];
    }

    return await Shop.find(query)
        .populate('authId', 'phoneNumber role')
        .sort({ createdAt: -1 });
};

/**
 * 6. Pure Platform ka Master Analytics & Stats
 */
exports.getPlatformStats = async () => {
    const [
        totalShops,
        approvedShops,
        pendingShops,
        rejectedShops,
        totalOrders,
        totalProducts
    ] = await Promise.all([
        Shop.countDocuments(),
        Shop.countDocuments({ approvalStatus: 'APPROVED' }),
        Shop.countDocuments({ approvalStatus: 'PENDING' }),
        Shop.countDocuments({ approvalStatus: 'REJECTED' }),
        Order.countDocuments(),
        Inventory.countDocuments()
    ]);

    // Total GMV (Gross Merchandise Value)
    const salesAggregation = await Order.aggregate([
        { $match: { paymentStatus: 'PAID' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalPlatformRevenue = salesAggregation[0] ? salesAggregation[0].totalRevenue : 0;

    return {
        shops: {
            total: totalShops,
            approved: approvedShops,
            pendingRequests: pendingShops,
            rejected: rejectedShops
        },
        business: {
            totalOrders,
            totalPlatformRevenue,
            totalProductsCatalogue: totalProducts
        }
    };
};

/**
 * 7. Pehla Super Admin Account Banana (Setup / Seed)
 */
exports.createSuperAdmin = async (phoneNumber, password) => {
    const existing = await Auth.findOne({ phoneNumber });
    if (existing) {
        // Agar pehle se hai toh role super_admin kar dein
        existing.role = 'super_admin';
        existing.password = await bcrypt.hash(password, 10);
        await existing.save();
        return existing;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const superAdmin = new Auth({
        phoneNumber,
        password: hashedPassword,
        role: 'super_admin'
    });
    return await superAdmin.save();
};

/**
 * 8. Super Admin Direct Login Service
 */
exports.adminLogin = async (phoneNumber, password) => {
    const auth = await Auth.findOne({ phoneNumber });
    if (!auth) {
        throw new Error('Phone number ya password galat hai.');
    }

    // Role check: Only super_admin or admin can use this endpoint
    if (auth.role !== 'super_admin' && auth.role !== 'admin') {
        throw new Error('Access Denied! Yeh portal sirf Super Admin ke liye hai.');
    }

    const isMatch = await bcrypt.compare(password, auth.password);
    if (!isMatch) {
        throw new Error('Phone number ya password galat hai.');
    }

    const jsonwebtoken = require('jsonwebtoken');
    const payload = { authId: auth._id, role: auth.role };
    const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    return {
        admin: {
            authId: auth._id,
            phoneNumber: auth.phoneNumber,
            role: auth.role
        },
        token
    };
};

/**
 * 9. Super Admin Forgot Password (OTP)
 */
exports.adminForgotPassword = async (phoneNumber) => {
    const auth = await Auth.findOne({ phoneNumber });
    if (!auth || (auth.role !== 'super_admin' && auth.role !== 'admin')) {
        throw new Error('Is number se koi Super Admin account nahi mila.');
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    auth.resetPasswordOTP = otp;
    auth.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await auth.save();

    console.log(`\n👑 SUPER ADMIN OTP: ${auth.phoneNumber} par OTP hai: ${otp}\n`);
    return otp;
};

/**
 * 10. Super Admin Reset Password
 */
exports.adminResetPassword = async (phoneNumber, otp, newPassword) => {
    const auth = await Auth.findOne({
        phoneNumber,
        resetPasswordOTP: otp,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!auth || (auth.role !== 'super_admin' && auth.role !== 'admin')) {
        throw new Error('OTP galat hai ya expire ho chuka hai.');
    }

    auth.password = await bcrypt.hash(newPassword, 10);
    auth.resetPasswordOTP = null;
    auth.resetPasswordExpires = null;
    await auth.save();

    return true;
};
