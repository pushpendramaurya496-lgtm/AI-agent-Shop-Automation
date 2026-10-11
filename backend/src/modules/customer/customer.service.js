const Customer = require('./customer.model');
const Order = require('../order/order.model');

/**
 * Grahak ko dhoondhna ya pehli baar aane par naya grahak register karna
 */
exports.findOrCreateCustomer = async (shopId, phoneNumber, initialData = {}) => {
    let customer = await Customer.findOne({ shopId, phoneNumber });

    if (!customer) {
        customer = new Customer({
            shopId,
            phoneNumber,
            name: initialData.name || 'Customer',
            defaultAddress: initialData.address || '',
            addresses: initialData.address ? [initialData.address] : []
        });
        await customer.save();
    } else if (initialData.address && !customer.addresses.includes(initialData.address)) {
        customer.addresses.push(initialData.address);
        if (!customer.defaultAddress) {
            customer.defaultAddress = initialData.address;
        }
        await customer.save();
    }

    return customer;
};

/**
 * Dukan ke sabhi grahako ki list (Search & Filter support)
 */
exports.getAllCustomers = async (shopId, query = {}) => {
    const filter = { shopId };

    if (query.search) {
        const regex = new RegExp(query.search.trim(), 'i');
        filter.$or = [
            { name: regex },
            { phoneNumber: regex }
        ];
    }

    return await Customer.find(filter).sort({ totalSpent: -1, createdAt: -1 });
};

/**
 * Kisi ek grahak ki puri jankari aur uske purane orders
 */
exports.getCustomerById = async (shopId, customerId) => {
    const customer = await Customer.findOne({ _id: customerId, shopId });
    if (!customer) {
        throw new Error('Grahak nahi mila.');
    }

    // Is grahak ke saare pichle orders bhi saath me le aao
    const orders = await Order.find({ shopId, customerPhone: customer.phoneNumber }).sort({ createdAt: -1 }).limit(10);

    return {
        customer,
        recentOrders: orders
    };
};

/**
 * Grahak ki profile update karna (Naam, Address, Notes)
 */
exports.updateCustomer = async (shopId, customerId, updateData) => {
    const customer = await Customer.findOneAndUpdate(
        { _id: customerId, shopId },
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!customer) {
        throw new Error('Grahak nahi mila.');
    }

    return customer;
};

/**
 * Udhaar Khata Update (Balance Change)
 * amount > 0 matlab grahak par udhaar chadha
 * amount < 0 matlab grahak ne paisa chukaya
 */
exports.updateBalance = async (shopId, customerId, amountChange, note) => {
    const numAmount = Number(amountChange);
    if (isNaN(numAmount)) {
        throw new Error('Valid amount provide karein.');
    }

    const customer = await Customer.findOne({ _id: customerId, shopId });
    if (!customer) {
        throw new Error('Grahak nahi mila.');
    }

    customer.outstandingBalance += numAmount;
    if (note) {
        customer.notes = customer.notes ? `${customer.notes}\n[Balance Update]: ${note}` : `[Balance Update]: ${note}`;
    }

    return await customer.save();
};

/**
 * Naya order lagne par grahak ka spending aur order count badhana
 */
exports.recordCustomerOrder = async (shopId, phoneNumber, orderAmount, address) => {
    let customer = await exports.findOrCreateCustomer(shopId, phoneNumber, { address });

    customer.totalOrdersCount += 1;
    customer.totalSpent += Number(orderAmount) || 0;

    if (address && !customer.addresses.includes(address)) {
        customer.addresses.push(address);
    }
    if (address && !customer.defaultAddress) {
        customer.defaultAddress = address;
    }

    // Agar 5 se zyada orders ho gaye toh 'Regular' tag de dein
    if (customer.totalOrdersCount >= 5 && !customer.tags.includes('Regular')) {
        customer.tags.push('Regular');
    }

    return await customer.save();
};
