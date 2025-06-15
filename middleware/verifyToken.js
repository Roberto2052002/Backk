const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Authorization header missing." });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.PASSCODE, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid or expired token." });

    req.user = {
      id: decoded._id || decoded.id || decoded.userId,
      ...decoded,
    };
    next();
  });
};

module.exports = verifyToken;