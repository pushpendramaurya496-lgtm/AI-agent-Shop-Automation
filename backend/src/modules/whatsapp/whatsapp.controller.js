const whatsappService = require('./whatsapp.service');
const Shop = require('../shop/shop.model');

/**
 * Meta Webhook Verification Handshake (GET /webhook)
 * Meta is endpoint par verify_token check karta hai
 */
exports.verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'shop_home_verify_secret_token_123';

    if (mode && token) {
        if (mode === 'subscribe' && token === expectedToken) {
            console.log('WhatsApp Webhook successfully verified with Meta!');
            return res.status(200).send(challenge);
        } else {
            return res.sendStatus(403);
        }
    }

    return res.status(400).send('Invalid verification request');
};

/**
 * Inbound Webhook Event Handler (POST /webhook)
 * Jab bhi WhatsApp par customer message bhejega, Meta is endpoint par data bhejega
 */
exports.receiveWebhook = async (req, res) => {
    // Meta ko turant 200 OK bhejte hain taaki woh timeout na kare
    res.status(200).send('EVENT_RECEIVED');

    // Background me message process karein
    try {
        await whatsappService.handleIncomingMessage(req.body);
    } catch (error) {
        console.error('Webhook processing error:', error);
    }
};

/**
 * Dukandar ka direct customer ko WhatsApp message bhejna (Manual Chat)
 */
exports.sendDirectMessage = async (req, res) => {
    try {
        if (!req.shopId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const { recipientPhone, messageText } = req.body;
        if (!recipientPhone || !messageText) {
            return res.status(400).json({ error: 'recipientPhone aur messageText dono zaroori hain.' });
        }

        const shop = await Shop.findById(req.shopId);
        const phoneNumberId = (shop && shop.whatsappPhoneNumberId) ? shop.whatsappPhoneNumberId : '100000000000000';

        const result = await whatsappService.sendTextMessage(phoneNumberId, recipientPhone, messageText);
        res.status(200).json({
            message: 'WhatsApp message bhej diya gaya hai!',
            result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
