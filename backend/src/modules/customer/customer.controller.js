const customerService = require('./customer.service');

exports.getAllCustomers = async (req, res) => {
    try {
        if (!req.shopId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const customers = await customerService.getAllCustomers(req.shopId, req.query);
        res.status(200).json({
            count: customers.length,
            customers
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getCustomerById = async (req, res) => {
    try {
        if (!req.shopId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const result = await customerService.getCustomerById(req.shopId, req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

exports.createCustomer = async (req, res) => {
    try {
        if (!req.shopId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const { phoneNumber, name, defaultAddress } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number zaroori hai.' });
        }

        const customer = await customerService.findOrCreateCustomer(req.shopId, phoneNumber, {
            name,
            address: defaultAddress
        });

        res.status(201).json({
            message: 'Grahak register ho gaya!',
            customer
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        if (!req.shopId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const updatedCustomer = await customerService.updateCustomer(req.shopId, req.params.id, req.body);
        res.status(200).json({
            message: 'Grahak ki profile update ho gayi!',
            customer: updatedCustomer
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateBalance = async (req, res) => {
    try {
        if (!req.shopId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const { amountChange, note } = req.body;
        if (amountChange === undefined) {
            return res.status(400).json({ error: 'amountChange provide karna zaroori hai (+ for udhaar, - for payment).' });
        }

        const customer = await customerService.updateBalance(req.shopId, req.params.id, amountChange, note);
        res.status(200).json({
            message: 'Khata balance update ho gaya!',
            outstandingBalance: customer.outstandingBalance,
            customer
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
