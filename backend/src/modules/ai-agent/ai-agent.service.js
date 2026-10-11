const ChatSession = require('./ai-agent.model');
const Inventory = require('../inventory/inventory.model');
const Shop = require('../shop/shop.model');
const orderService = require('../order/order.service');

// OpenAI Tool Definitions (Function Calling)
const agentTools = [
    {
        type: 'function',
        function: {
            name: 'check_stock_and_price',
            description: 'Check if an item is available in the shop inventory, its price and remaining stock quantity.',
            parameters: {
                type: 'object',
                properties: {
                    searchQuery: {
                        type: 'string',
                        description: 'The name or keyword of the item (e.g., "chini", "maggi", "tel", "bread")'
                    }
                },
                required: ['searchQuery']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'place_order',
            description: 'Book and place a new customer order when the customer confirms they want to purchase and provides their address or asks for delivery.',
            parameters: {
                type: 'object',
                properties: {
                    items: {
                        type: 'array',
                        description: 'List of items to order',
                        items: {
                            type: 'object',
                            properties: {
                                itemName: { type: 'string', description: 'Name of the item' },
                                quantity: { type: 'number', description: 'Number of units' }
                            },
                            required: ['itemName', 'quantity']
                        }
                    },
                    deliveryAddress: {
                        type: 'string',
                        description: 'Delivery address provided by the customer or "Dukan se pickup"'
                    },
                    customerName: {
                        type: 'string',
                        description: 'Name of the customer if mentioned'
                    }
                },
                required: ['items']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_shop_info',
            description: 'Get details about this shop such as owner name, address, and timings.',
            parameters: {
                type: 'object',
                properties: {}
            }
        }
    }
];

/**
 * Execute Tool Functions locally against MongoDB
 */
async function executeAgentTool(toolName, args, shopId, customerPhone) {
    if (toolName === 'check_stock_and_price') {
        const query = args.searchQuery ? args.searchQuery.trim() : '';
        const items = await Inventory.find({
            shopId,
            itemName: { $regex: new RegExp(query, 'i') }
        }).limit(5);

        if (!items || items.length === 0) {
            return JSON.stringify({
                found: false,
                message: `Dukan me "${query}" naam ka koi item nahi mila.`
            });
        }

        const formatted = items.map(i => ({
            itemId: i._id,
            name: i.itemName,
            price: i.price,
            stock: i.stockQuantity,
            inStock: i.stockQuantity > 0,
            category: i.category || 'General'
        }));

        return JSON.stringify({ found: true, items: formatted });
    }

    if (toolName === 'place_order') {
        try {
            const createdOrder = await orderService.createOrder(shopId, {
                customerPhone,
                customerName: args.customerName || 'WhatsApp Customer',
                deliveryAddress: args.deliveryAddress || 'Dukan se pickup',
                items: args.items,
                source: 'WHATSAPP'
            });

            return JSON.stringify({
                success: true,
                orderId: createdOrder._id,
                totalAmount: createdOrder.totalAmount,
                items: createdOrder.items.map(i => `${i.itemName} x ${i.quantity} (₹${i.subtotal})`),
                status: createdOrder.status,
                deliveryAddress: createdOrder.deliveryAddress
            });
        } catch (err) {
            return JSON.stringify({
                success: false,
                error: err.message
            });
        }
    }

    if (toolName === 'get_shop_info') {
        const shop = await Shop.findById(shopId);
        return JSON.stringify({
            shopName: shop ? shop.shopName : 'Hamari Dukan',
            ownerName: shop ? shop.ownerName : 'Dukandar',
            address: shop && shop.address ? shop.address : 'Main Market'
        });
    }

    return JSON.stringify({ error: `Unknown tool: ${toolName}` });
}

/**
 * Fallback Rule-Based Agent (Jab tak OpenAI API key .env me na ho, tab bhi testing kaam karegi!)
 */
async function fallbackRuleBasedResponse(shop, customerPhone, userText) {
    const textLower = userText.toLowerCase().trim();

    // Check if greeting
    if (textLower === 'hi' || textLower === 'hello' || textLower === 'namaste' || textLower === 'pranam') {
        return `Namaste! 🙏 Main ${shop.shopName} ka digital sahayak hoon. Aapko kya samaan chahiye? Jaise: Tel, Chini, Maggi, Aata ityadi.`;
    }

    // Check if ordering
    if (textLower.includes('pack kar') || textLower.includes('order kar') || textLower.includes('bhej do')) {
        return `Order book karne ke liye kripya samaan ka naam, quantity aur apna delivery pata (address) likhein. Jaise: "2 Maggi aur 1 Tel, Flat 204".`;
    }

    // Check inventory by searching words
    const words = textLower.replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 2);
    for (const word of words) {
        const found = await Inventory.find({
            shopId: shop._id,
            itemName: { $regex: new RegExp(word, 'i') }
        });

        if (found && found.length > 0) {
            const list = found.map(i => `• ${i.itemName}: ₹${i.price} (${i.stockQuantity > 0 ? `Stock: ${i.stockQuantity}` : 'Out of stock'})`).join('\n');
            return `Haanji! ${shop.shopName} me yeh samaan uplabdh hai:\n\n${list}\n\nKya aapka order pack karein?`;
        }
    }

    return `Shukriya! Aapka message mil gaya hai. Dukan ka samaan check karne ke liye item ka naam likhein ya sidha order dein.`;
}

/**
 * Process Inbound Customer Message through AI Munshi
 * @param {string} shopId - Shop ObjectId
 * @param {string} customerPhone - Customer phone number
 * @param {string} incomingMessage - Text message received
 * @returns {Promise<string>} AI assistant reply
 */
exports.processCustomerMessage = async (shopId, customerPhone, incomingMessage) => {
    const shop = await Shop.findById(shopId);
    if (!shop) {
        throw new Error('Shop nahi mili.');
    }

    // Agar dukandar ne AI band kar rakha ho (Manual takeover)
    if (shop.aiEnabled === false) {
        return null; // Server message bhejega nahi, dukandar khud reply karega
    }

    // 1. Get or create conversation session
    let session = await ChatSession.findOne({ shopId, customerPhone });
    if (!session) {
        session = new ChatSession({
            shopId,
            customerPhone,
            messages: []
        });
    }

    // Add current user message
    session.messages.push({
        role: 'user',
        content: incomingMessage,
        createdAt: new Date()
    });

    const apiKey = process.env.OPENAI_API_KEY;

    // Agar OpenAI API key abhi set nahi hai, toh smart fallback responder chalayein
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
        const reply = await fallbackRuleBasedResponse(shop, customerPhone, incomingMessage);
        session.messages.push({
            role: 'assistant',
            content: reply,
            createdAt: new Date()
        });
        session.lastActive = new Date();
        await session.save();
        return reply;
    }

    // 2. Build conversation history for OpenAI (Keep last 10 messages for context)
    const recentMessages = session.messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
    }));

    const systemPrompt = `Aap ek polite aur helpful Indian local shop ke digital sahayak (munshi) hain jinka naam "${shop.shopName} Sahayak" hai.
Dukan ka naam: "${shop.shopName}".
Dukandar ka naam: "${shop.ownerName}".
Dukan ka pata: "${shop.address || 'Local Market'}".

Aapke niyam:
1. Bhasha: Natural Hinglish (Hindi written in Roman/English alphabet) ya Hindi jo customer ko pasand ho.
2. Tone: Bohat meethi, vinamra aur respectful (use "Ji", "Haanji", "Bhaiya", "Madam").
3. Jab customer kisi samaan ya rate ke baare me puche, hamesha "check_stock_and_price" tool use karke verify karo. Andaze se rate ya stock mat batao!
4. Agar item dukan me available hai, toh rate aur stock batao aur pucho ki kya order pack kar dein.
5. Agar customer confirm kare ki "pack kar do" ya "bhej do" aur delivery address bataye, toh "place_order" tool se order lagao.
6. Order lagne ke turant baad customer ko order summary aur total amount batao.`;

    const payloadMessages = [
        { role: 'system', content: systemPrompt },
        ...recentMessages
    ];

    try {
        // First Call to OpenAI
        let response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: payloadMessages,
                tools: agentTools,
                tool_choice: 'auto',
                temperature: 0.6
            })
        });

        let data = await response.json();
        if (!data.choices || data.choices.length === 0) {
            throw new Error(data.error ? data.error.message : 'OpenAI response failed');
        }

        let choice = data.choices[0];

        // 3. Handle Tool Calls if any
        if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
            payloadMessages.push(choice.message);

            for (const toolCall of choice.message.tool_calls) {
                const funcName = toolCall.function.name;
                const funcArgs = JSON.parse(toolCall.function.arguments || '{}');

                const toolResult = await executeAgentTool(funcName, funcArgs, shopId, customerPhone);

                payloadMessages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    name: funcName,
                    content: toolResult
                });
            }

            // Second Call to OpenAI with tool outputs
            const secondResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: payloadMessages,
                    temperature: 0.6
                })
            });

            const secondData = await secondResponse.json();
            choice = secondData.choices[0];
        }

        const finalReply = choice.message.content || 'Ji, aapka sandesh mil gaya hai.';

        // Save assistant reply to memory
        session.messages.push({
            role: 'assistant',
            content: finalReply,
            createdAt: new Date()
        });
        session.lastActive = new Date();
        await session.save();

        return finalReply;
    } catch (error) {
        console.error('AI Agent Error:', error);
        // Fallback in case of network or API error
        return await fallbackRuleBasedResponse(shop, customerPhone, incomingMessage);
    }
};

/**
 * Get chat history for shopkeeper dashboard
 */
exports.getCustomerChatHistory = async (shopId, customerPhone) => {
    return await ChatSession.findOne({ shopId, customerPhone });
};

/**
 * Toggle AI Auto-Pilot on or off for a shop
 */
exports.toggleAiStatus = async (shopId, enabled) => {
    return await Shop.findByIdAndUpdate(
        shopId,
        { $set: { aiEnabled: enabled } },
        { new: true }
    );
};
