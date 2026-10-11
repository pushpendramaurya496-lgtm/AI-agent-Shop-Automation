const jwt = require('jsonwebtoken');

// Yeh middleware check karega ki request ke sath valid Token hai ya nahi
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // Authorization header format: "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Bina Login ke yeh action nahi kar sakte. Token missing.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.authId = decoded.authId; // User ki ID
        req.shopId = decoded.shopId; // Dukaan ki ID (agar dukandar hai)
        req.role = decoded.role;
        next(); // Aage badhne do
    } catch (error) {
        return res.status(403).json({ error: 'Token galat hai ya expire ho chuka hai.' });
    }
};

module.exports = { verifyToken };
