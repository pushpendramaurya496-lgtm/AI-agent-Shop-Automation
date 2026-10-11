const shopService = require('./shop.service');

exports.getProfile = async (req, res) => {
    try {
        if (!req.shopId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const shop = await shopService.getShopProfile(req.shopId);
        res.status(200).json({ shop });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        if (!req.shopId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const updatedShop = await shopService.updateShopProfile(req.shopId, req.body);
        res.status(200).json({
            message: 'Dukan ki settings update ho gayi hain!',
            shop: updatedShop
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.connectWhatsApp = async (req, res) => {
    try {
        if (!req.shopId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const { whatsappPhoneNumberId } = req.body;
        if (!whatsappPhoneNumberId) {
            return res.status(400).json({ error: 'whatsappPhoneNumberId provide karna zaroori hai.' });
        }

        const updatedShop = await shopService.updateWhatsAppSettings(req.shopId, whatsappPhoneNumberId);
        res.status(200).json({
            message: 'WhatsApp Phone ID dukan ke sath jod di gayi hai!',
            shop: updatedShop
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getPublicInfo = async (req, res) => {
    try {
        const { shopId } = req.params;
        const shop = await shopService.getPublicShopInfo(shopId);
        res.status(200).json({ shop });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};
