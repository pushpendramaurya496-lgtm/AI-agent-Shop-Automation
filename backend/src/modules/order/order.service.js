const Order = require('./order.model');
const Inventory = require('../inventory/inventory.model');

/**
 * Naya Order Banana (WhatsApp AI ya Dashboard dono se use ho sakta hai)
 * Stock automatic check hota hai aur inventory se minus ho jata hai!
 */
exports.createOrder = async (shopId, orderData) => {
    const { customerPhone, customerName, deliveryAddress, items, source, orderNotes } = orderData;

    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Order me kam se kam ek item hona zaroori hai.');
    }

    if (!customerPhone) {
        throw new Error('Customer ka phone number zaroori hai.');
    }

    let calculatedTotal = 0;
    const processedItems = [];

    // Har item ka stock check karein aur verify karein
    for (const item of items) {
        let product = null;

        if (item.productId) {
            product = await Inventory.findOne({ _id: item.productId, shopId });
        } else if (item.itemName) {
            // Agar AI ne sirf naam bheja hai toh naam se search karein
            product = await Inventory.findOne({
                shopId,
                itemName: { $regex: new RegExp(`^${item.itemName.trim()}$`, 'i') }
            });
        }

        const quantity = Number(item.quantity) || 1;
        let price = Number(item.price);

        if (product) {
            // Price agar user ne nahi bheja toh inventory wala rate lein
            if (!price && price !== 0) {
                price = product.price;
            }

            // Stock check karein
            if (product.stockQuantity < quantity) {
                throw new Error(`Item "${product.itemName}" ka stock kam hai. Dukan me sirf ${product.stockQuantity} bacha hai.`);
            }

            // Inventory se stock minus karein
            product.stockQuantity -= quantity;
            await product.save();

            processedItems.push({
                productId: product._id,
                itemName: product.itemName,
                quantity,
                price,
                subtotal: price * quantity
            });
        } else {
            // Agar inventory me item nahi mila toh jo data bheja hai use lein
            if (price === undefined || price === null) {
                throw new Error(`Item "${item.itemName}" ka price batana zaroori hai.`);
            }

            processedItems.push({
                itemName: item.itemName,
                quantity,
                price,
                subtotal: price * quantity
            });
        }

        calculatedTotal += (price * quantity);
    }

    const newOrder = new Order({
        shopId,
        customerPhone,
        customerName: customerName || 'Customer',
        deliveryAddress: deliveryAddress || 'Dukan se pickup',
        items: processedItems,
        totalAmount: calculatedTotal,
        source: source || 'WHATSAPP',
        orderNotes: orderNotes || '',
        status: 'PENDING',
        paymentStatus: 'UNPAID'
    });

    const savedOrder = await newOrder.save();

    // Customer ki diary/CRM me bhi order record karein
    try {
        const customerService = require('../customer/customer.service');
        await customerService.recordCustomerOrder(shopId, customerPhone, calculatedTotal, deliveryAddress);
    } catch (custErr) {
        console.error('Failed to update customer stats:', custErr.message);
    }

    return savedOrder;
};

/**
 * Dukan ke saare orders dekhna (Filter by status support)
 */
exports.getAllOrders = async (shopId, filter = {}) => {
    const query = { shopId };
    if (filter.status) {
        query.status = filter.status;
    }
    return await Order.find(query).sort({ createdAt: -1 });
};

/**
 * Ek specific order ki detail nikalna
 */
exports.getOrderById = async (shopId, orderId) => {
    const order = await Order.findOne({ _id: orderId, shopId });
    if (!order) {
        throw new Error('Order nahi mila.');
    }
    return order;
};

/**
 * Order Status update karna (jaise: PENDING -> PACKED -> DELIVERED ya CANCELLED)
 * Agar order CANCEL hota hai toh stock wapas Inventory me jud jayega!
 */
exports.updateOrderStatus = async (shopId, orderId, newStatus) => {
    const validStatuses = ['PENDING', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(newStatus)) {
        throw new Error(`Galat status! Valid status: ${validStatuses.join(', ')}`);
    }

    const order = await Order.findOne({ _id: orderId, shopId });
    if (!order) {
        throw new Error('Order nahi mila.');
    }

    // Agar pehle cancel nahi tha aur ab cancel ho raha hai, toh stock wapas lauta dein
    if (newStatus === 'CANCELLED' && order.status !== 'CANCELLED') {
        for (const item of order.items) {
            if (item.productId) {
                await Inventory.findOneAndUpdate(
                    { _id: item.productId, shopId },
                    { $inc: { stockQuantity: item.quantity } }
                );
            }
        }
    }

    order.status = newStatus;
    return await order.save();
};

/**
 * Payment status update karna (UNPAID -> PAID)
 */
exports.updatePaymentStatus = async (shopId, orderId, paymentStatus) => {
    if (!['UNPAID', 'PAID'].includes(paymentStatus)) {
        throw new Error('Payment status sirf UNPAID ya PAID ho sakta hai.');
    }

    const order = await Order.findOneAndUpdate(
        { _id: orderId, shopId },
        { $set: { paymentStatus } },
        { new: true }
    );

    if (!order) {
        throw new Error('Order nahi mila.');
    }

    return order;
};

/**
 * Sundar WhatsApp Invoice Receipt Text Format Karna
 */
function formatWhatsAppInvoice(shop, order) {
    const shopName = shop ? shop.shopName : 'Hamari Dukan';
    const shopAddress = shop && shop.address ? `📍 ${shop.address}\n` : '';
    const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    const itemsList = order.items.map(item => 
        `• ${item.itemName} (${item.quantity} qty) : ₹${item.subtotal}`
    ).join('\n');

    return `🧾 *${shopName.toUpperCase()}*
${shopAddress}---------------------------------------
Namaste ${order.customerName || 'Grahak'} ji! 🙏
Aapki khareedari ke liye shukriya!

📋 *Bill No:* #${order.invoiceNumber || order._id.toString().slice(-6)}
📅 *Date:* ${dateStr}

*Samaan Details:*
${itemsList}

---------------------------------------
💰 *KUL BILL (Total): ₹${order.totalAmount}*
💳 *Payment Mode:* ${order.paymentMode || 'CASH'} (${order.paymentStatus})
---------------------------------------

💡 *Zaroori Tip:*
Yeh hamari dukan ka official WhatsApp number hai! Is number ko *"${shopName}"* ke naam se save kar lijiye.

Ab aap ghar baithe isi chat par:
✅ Kisi bhi samaan ka bhav (rate) puch sakte hain.
✅ Dukan me stock check kar sakte hain.
✅ Aur ghar baithe sidha order de sakte hain!

Aapka din shubh ho! 😊`;
}

exports.formatWhatsAppInvoice = formatWhatsAppInvoice;

/**
 * Dukan ke Counter par Walk-in Sale karna + Auto WhatsApp Invoice Bhejna
 */
exports.createCounterSale = async (shopId, saleData) => {
    const { customerPhone, customerName, items, paymentMode, orderNotes } = saleData;

    if (!customerPhone) {
        throw new Error('Customer ka WhatsApp phone number zaroori hai.');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Kam se kam ek item hona zaroori hai.');
    }

    const Shop = require('../shop/shop.model');
    const shop = await Shop.findById(shopId);

    // Invoice number banayein (Jaise: INV-849201)
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    // Order create karein
    const order = await exports.createOrder(shopId, {
        customerPhone,
        customerName: customerName || 'Walk-in Customer',
        deliveryAddress: 'Dukan Counter (Walk-in)',
        items,
        source: 'COUNTER',
        orderNotes: orderNotes || 'Counter POS Sale'
    });

    // Counter sale ko turant DELIVERED aur PAID mark karein
    order.status = 'DELIVERED';
    order.paymentStatus = 'PAID';
    order.paymentMode = paymentMode || 'CASH';
    order.invoiceNumber = invoiceNumber;
    await order.save();

    // WhatsApp Invoice text taiyar karein
    const invoiceText = formatWhatsAppInvoice(shop, order);

    // Customer ke WhatsApp par invoice bhein
    let whatsappResult = null;
    try {
        const whatsappService = require('../whatsapp/whatsapp.service');
        const phoneId = (shop && shop.whatsappPhoneNumberId) ? shop.whatsappPhoneNumberId : '100000000000000';
        whatsappResult = await whatsappService.sendTextMessage(phoneId, customerPhone, invoiceText);
    } catch (waErr) {
        console.error('WhatsApp invoice send error:', waErr.message);
    }

    return {
        order,
        invoiceNumber,
        invoiceText,
        whatsappSent: Boolean(whatsappResult)
    };
};

/**
 * Kisi bhi order ka WhatsApp Bill dubara bhejna
 */
exports.resendWhatsAppInvoice = async (shopId, orderId, overridePhone) => {
    const Shop = require('../shop/shop.model');
    const shop = await Shop.findById(shopId);

    const order = await Order.findOne({ _id: orderId, shopId });
    if (!order) {
        throw new Error('Order nahi mila.');
    }

    const targetPhone = overridePhone || order.customerPhone;
    if (!targetPhone) {
        throw new Error('WhatsApp phone number nahi mila.');
    }

    const invoiceText = formatWhatsAppInvoice(shop, order);
    const whatsappService = require('../whatsapp/whatsapp.service');
    const phoneId = (shop && shop.whatsappPhoneNumberId) ? shop.whatsappPhoneNumberId : '100000000000000';
    const result = await whatsappService.sendTextMessage(phoneId, targetPhone, invoiceText);

    return {
        success: true,
        sentTo: targetPhone,
        invoiceText,
        result
    };
};

/**
 * Sirf Counter par hui bikri (POS Sales) dekhna
 */
exports.getCounterSales = async (shopId) => {
    return await Order.find({ shopId, source: 'COUNTER' }).sort({ createdAt: -1 });
};
