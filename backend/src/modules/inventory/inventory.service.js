const Inventory = require('./inventory.model');

// Naya Saman Add Karna
exports.addItem = async (shopId, itemData) => {
    // Check if item already exists for this shop
    const existingItem = await Inventory.findOne({ 
        shopId, 
        itemName: { $regex: new RegExp(`^${itemData.itemName}$`, 'i') } // Case insensitive search
    });

    if (existingItem) {
        throw new Error('Yeh item aapki dukan mein pehle se maujood hai. Stock update karein.');
    }

    const newItem = new Inventory({
        shopId,
        ...itemData
    });
    
    return await newItem.save();
};

// Dukan ka Saara Saman Dekhna
exports.getAllItems = async (shopId) => {
    return await Inventory.find({ shopId }).sort({ createdAt: -1 }); // Naya saman sabse upar
};

// Saman ko Update Karna (Price ya Stock change karna)
exports.updateItem = async (shopId, itemId, updateData) => {
    // Hum `shopId` bhi pass kar rahe hain taaki koi aur dukandar ise change na kar paye
    const updatedItem = await Inventory.findOneAndUpdate(
        { _id: itemId, shopId },
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!updatedItem) {
        throw new Error('Item nahi mila ya aap ise update nahi kar sakte.');
    }

    return updatedItem;
};

// Saman ko Delete Karna
exports.deleteItem = async (shopId, itemId) => {
    const deletedItem = await Inventory.findOneAndDelete({ _id: itemId, shopId });
    if (!deletedItem) {
        throw new Error('Item nahi mila ya aap ise delete nahi kar sakte.');
    }
    return deletedItem;
};
