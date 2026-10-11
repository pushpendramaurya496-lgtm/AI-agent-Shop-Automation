const Shop = require('../shop/shop.model');
const aiAgentService = require('../ai-agent/ai-agent.service');

/**
 * Meta WhatsApp Cloud API ko message bhejna
 * @param {string} phoneNumberId - Shop's Meta WhatsApp Phone Number ID
 * @param {string} recipientPhone - Customer's WhatsApp phone number
 * @param {string} messageText - Text message to send
 */
exports.sendTextMessage = async (phoneNumberId, recipientPhone, messageText) => {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!accessToken || accessToken === 'your_meta_system_user_access_token_here') {
        console.log(`[WHATSAPP SIMULATION] Message to ${recipientPhone} via PhoneId ${phoneNumberId}: "${messageText}"`);
        return { simulated: true, recipient: recipientPhone, message: messageText };
    }

    try {
        const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: recipientPhone,
                type: 'text',
                text: { preview_url: false, body: messageText }
            })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('WhatsApp Send Message Error:', error);
        throw error;
    }
};

/**
 * Meta se aane wale incoming message payload ko process karna
 * @param {object} payload - Webhook payload sent by Meta
 */
exports.handleIncomingMessage = async (payload) => {
    try {
        const entry = payload.entry && payload.entry[0];
        const changes = entry && entry.changes && entry.changes[0];
        const value = changes && changes.value;

        if (!value || !value.messages || value.messages.length === 0) {
            // Status update (delivered, read) payload ho sakta hai, use ignore karein
            return { ignored: true };
        }

        const incomingMsg = value.messages[0];
        const from = incomingMsg.from; // Customer ka phone number
        const phoneNumberId = value.metadata && value.metadata.phone_number_id; // Dukan ka Meta Phone Number ID

        // Sirf text messages process karein abhi
        let userText = '';
        if (incomingMsg.type === 'text') {
            userText = incomingMsg.text.body;
        } else {
            userText = 'Customer ne non-text message bheja (Photo ya Audio).';
        }

        // 1. Dukan pehchanein (Multi-tenant check)
        let shop = null;
        if (phoneNumberId) {
            shop = await Shop.findOne({ whatsappPhoneNumberId: phoneNumberId });
        }

        // Agar shop specific ID se nahi mili, toh pehli active shop le lein (Local dev / single shop testing)
        if (!shop) {
            shop = await Shop.findOne().sort({ createdAt: 1 });
        }

        if (!shop) {
            console.error('Koi dukan database me maujood nahi hai.');
            return { error: 'No shop found' };
        }

        // 2. AI Munshi se process karwayen
        const replyText = await aiAgentService.processCustomerMessage(shop._id, from, userText);

        // 3. Agar AI enabled hai aur reply bana hai, toh WhatsApp par send karein
        if (replyText) {
            const activePhoneId = phoneNumberId || shop.whatsappPhoneNumberId || '100000000000000';
            await exports.sendTextMessage(activePhoneId, from, replyText);
        }

        return { success: true, from, reply: replyText };
    } catch (error) {
        console.error('Error handling incoming WhatsApp message:', error);
        return { error: error.message };
    }
};
