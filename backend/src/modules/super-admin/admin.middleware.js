/**
 * Super Admin Security Guard Middleware
 * Yeh check karta hai ki logged-in user ke paas 'admin' ya 'super_admin' role hai ya nahi
 */
const verifySuperAdmin = (req, res, next) => {
    if (!req.role || (req.role !== 'admin' && req.role !== 'super_admin')) {
        return res.status(403).json({
            error: 'Access Denied! Sirf Super Admin hi is panel ko access kar sakte hain.'
        });
    }
    next();
};

module.exports = { verifySuperAdmin };
