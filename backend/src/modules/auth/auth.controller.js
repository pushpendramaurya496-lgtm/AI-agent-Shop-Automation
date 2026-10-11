const authService = require('./auth.service');

exports.signup = async (req, res) => {
    try {
        const { shopName, ownerName, phoneNumber, password } = req.body;
        if(!shopName || !ownerName || !phoneNumber || !password) {
            return res.status(400).json({ error: 'Saari fields daalna zaroori hai.' });
        }
        const shop = await authService.signup(req.body);
        res.status(201).json({ message: 'Dukan successfully register ho gayi!', shopId: shop._id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;
        if(!phoneNumber || !password) {
            return res.status(400).json({ error: 'Phone Number aur Password daalna zaroori hai.' });
        }
        const { shop, token } = await authService.login(phoneNumber, password);
        res.status(200).json({ message: 'Login successful!', token, shopName: shop.shopName });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        if(!phoneNumber) return res.status(400).json({ error: 'Phone Number zaroori hai.' });
        
        const testOtp = await authService.generateOTP(phoneNumber);
        res.status(200).json({ message: 'OTP bhej diya gaya hai (Testing ke liye console check karein)', testOtp });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { phoneNumber, otp, newPassword } = req.body;
        if(!phoneNumber || !otp || !newPassword) {
            return res.status(400).json({ error: 'Phone, OTP aur Naya Password teeno chahiye.' });
        }
        
        await authService.resetPassword(phoneNumber, otp, newPassword);
        res.status(200).json({ message: 'Password successfully badal diya gaya hai!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
