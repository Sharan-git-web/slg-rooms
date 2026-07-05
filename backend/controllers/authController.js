const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminUsername || !adminPasswordHash) {
      return res.status(500).json({ message: 'Login is not configured on the server.' });
    }

    if (username !== adminUsername) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, adminPasswordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign({ sub: username, role: 'owner' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};
