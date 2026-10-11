const inventoryService = require('./inventory.service');

exports.addItem = async (req, res) => {
    try {
        // req.shopId humare auth middleware (Guard) ne set kiya tha!
        if (!req.shopId) return res.status(403).json({ error: 'Sirf dukandar hi saman add kar sakte hain.' });
        
        const item = await inventoryService.addItem(req.shopId, req.body);
        res.status(201).json({ message: 'Saman successfully add ho gaya!', item });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllItems = async (req, res) => {
    try {
        if (!req.shopId) return res.status(403).json({ error: 'Not authorized.' });
        
        const items = await inventoryService.getAllItems(req.shopId);
        res.status(200).json({ items });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateItem = async (req, res) => {
    try {
        if (!req.shopId) return res.status(403).json({ error: 'Not authorized.' });
        
        const { id } = req.params; // URL se item ki ID nikal li
        const updatedItem = await inventoryService.updateItem(req.shopId, id, req.body);
        res.status(200).json({ message: 'Saman update ho gaya!', updatedItem });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        if (!req.shopId) return res.status(403).json({ error: 'Not authorized.' });
        
        const { id } = req.params;
        await inventoryService.deleteItem(req.shopId, id);
        res.status(200).json({ message: 'Saman delete kar diya gaya hai.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
