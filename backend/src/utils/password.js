const bcrypt = require('bcryptjs');
const env = require('../config/env');

const hashPassword = async (plainPassword) => bcrypt.hash(plainPassword, env.BCRYPT_SALT_ROUNDS);

const comparePassword = async (plainPassword, hashedPassword) =>
  bcrypt.compare(plainPassword, hashedPassword);

module.exports = { hashPassword, comparePassword };
