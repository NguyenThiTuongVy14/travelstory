const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Lấy token từ header Authorization

    // Nếu không có token, trả về 401 và thông báo lỗi
    if (!token) {
        return res.status(401).json({ error: true, message: "No token provided" });
    }

    // Kiểm tra tính hợp lệ của token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: true, message: "Invalid or expired token" });
        }
        
        // Gán thông tin người dùng vào req.user
        req.user = user;
        next(); // Tiếp tục đến route handler
    });
}

module.exports = {
    authenticateToken,
};
