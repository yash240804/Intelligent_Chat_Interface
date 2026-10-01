const mongoose = require('mongoose');
const User = require('../models/User');

// Lightweight identity: client sends the id returned from POST /api/users
module.exports = async (req, _res, next) => {
  try {
    const id = req.get('x-user-id');
    if (!id || !mongoose.isValidObjectId(id)) throw Object.assign(new Error('Missing or invalid x-user-id'), { status: 401 });
    const user = await User.findById(id);
    if (!user) throw Object.assign(new Error('User not found'), { status: 401 });
    req.user = user;
    next();
  } catch (e) { next(e); }
};
