const aiAgentService = require('./ai-agent.service');

exports.chatWithAgent = async (req, res) => {
    try {
        if (!req.shopId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const { customerPhone, message } = req.body;
        if (!customerPhone || !message) {
            return res.status(400).json({ error: 'customerPhone aur message dono provide karna zaroori hai.' });
        }

        const reply = await aiAgentService.processCustomerMessage(req.shopId, customerPhone, message);
        res.status(200).json({
            success: true,
            customerPhone,
            message,
            reply
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        if (!req.shopId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const { customerPhone } = req.params;
        const history = await aiAgentService.getCustomerChatHistory(req.shopId, customerPhone);
        res.status(200).json({
            history: history ? history.messages : []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.toggleAiStatus = async (req, res) => {
    try {
        if (!req.shopId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const { aiEnabled } = req.body;
        if (aiEnabled === undefined) {
            return res.status(400).json({ error: 'aiEnabled (true ya false) provide karna zaroori hai.' });
        }

        const updatedShop = await aiAgentService.toggleAiStatus(req.shopId, Boolean(aiEnabled));
        res.status(200).json({
            message: `AI Munshi ab ${updatedShop.aiEnabled ? 'ACTIVE (Chalu)' : 'PAUSED (Band)'} hai.`,
            aiEnabled: updatedShop.aiEnabled
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
