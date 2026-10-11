const Shop = require('./shop.model');

/**
 * Logged-in dukandar ki dukan ki puri detail nikalna
 */
exports.getShopProfile = async (shopId) => {
    const shop = await Shop.findById(shopId);
    if (!shop) {
        throw new Error('Dukan nahi mili.');
    }
    return shop;
};

/**
 * Dukan ki Profile aur Business Settings update karna
 */
exports.updateShopProfile = async (shopId, updateData) => {
    // Sensitive fields ko chhedne se rokna
    const safeData = { ...updateData };
    delete safeData._id;
    delete safeData.authId;

    const updatedShop = await Shop.findByIdAndUpdate(
        shopId,
        { $set: safeData },
        { new: true, runValidators: true }
    );

    if (!updatedShop) {
        throw new Error('Dukan nahi mili.');
    }

    return updatedShop;
};

/**
 * WhatsApp Meta Phone ID connect karna
 */
exports.updateWhatsAppSettings = async (shopId, whatsappPhoneNumberId) => {
    if (!whatsappPhoneNumberId) {
        throw new Error('WhatsApp Phone Number ID zaroori hai.');
    }

    // Check if another shop is already using this phone ID
    const existing = await Shop.findOne({
        whatsappPhoneNumberId,
        _id: { $ne: shopId }
    });

    if (existing) {
        throw new Error('Yeh WhatsApp Phone ID pehle se kisi aur dukan ke sath judi hui hai.');
    }

    const updatedShop = await Shop.findByIdAndUpdate(
        shopId,
        { $set: { whatsappPhoneNumberId } },
        { new: true }
    );

    return updatedShop;
};

/**
 * Grahak / Public ke liye dukan ki basic info
 */
exports.getPublicShopInfo = async (shopId) => {
    const shop = await Shop.findById(shopId).select('shopName ownerName address openingTime closingTime upiId deliveryRadiusKm minimumOrderAmount deliveryCharges');
    if (!shop) {
        throw new Error('Dukan nahi mili.');
    }
    return shop;
};
