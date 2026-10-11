const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const Auth = require('./auth.model');
const Shop = require('../shop/shop.model');

// 1. Signup Service
exports.signup = async (shopData) => {
    // Check if phone number already exists in Auth collection
    const existingAuth = await Auth.findOne({ phoneNumber: shopData.phoneNumber });
    if (existingAuth) {
        throw new Error('Yeh phone number pehle se register hai.');
    }

    const hashedPassword = await bcrypt.hash(shopData.password, 10);
    
    // Pehle Auth record banayenge
    const newAuth = new Auth({
        phoneNumber: shopData.phoneNumber,
        password: hashedPassword,
        role: 'shop_owner'
    });
    await newAuth.save();

    // Phir Shop record banayenge aur usko Auth ID se link karenge
    const newShop = new Shop({
        authId: newAuth._id,
        shopName: shopData.shopName,
        ownerName: shopData.ownerName
    });
    await newShop.save();

    return { authId: newAuth._id, shopId: newShop._id };
};

// 2. Login Service
exports.login = async (phoneNumber, password) => {
    const auth = await Auth.findOne({ phoneNumber });
    if (!auth) throw new Error('Phone number ya password galat hai.');

    const isMatch = await bcrypt.compare(password, auth.password);
    if (!isMatch) throw new Error('Phone number ya password galat hai.');

    // Dukandar ki details nikalne ke liye Shop find karenge
    const shop = await Shop.findOne({ authId: auth._id });

    const payload = { authId: auth._id, shopId: shop ? shop._id : null, role: auth.role };
    const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    return { shop, token };
};

// 3. Forgot Password Service (Generate OTP)
exports.generateOTP = async (phoneNumber) => {
    const auth = await Auth.findOne({ phoneNumber });
    if (!auth) throw new Error('Is number se koi account register nahi hai.');

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    auth.resetPasswordOTP = otp;
    auth.resetPasswordExpires = Date.now() + 10 * 60 * 1000; 
    await auth.save();

    console.log(`\n📲 SMS BHEJA GAYA: ${auth.phoneNumber} par OTP hai: ${otp}\n`);

    return otp; 
};

// 4. Reset Password Service
exports.resetPassword = async (phoneNumber, otp, newPassword) => {
    const auth = await Auth.findOne({ 
        phoneNumber,
        resetPasswordOTP: otp,
        resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!auth) throw new Error('OTP galat hai ya expire ho chuka hai.');

    auth.password = await bcrypt.hash(newPassword, 10);
    auth.resetPasswordOTP = null;
    auth.resetPasswordExpires = null;
    await auth.save();

    return true;
};
