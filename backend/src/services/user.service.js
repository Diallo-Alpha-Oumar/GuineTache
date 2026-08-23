const User = require('../models/User');
const ApiError = require('../errors/ApiError');

const PUBLIC_USER_FIELDS = [
  '_id',
  'firstName',
  'lastName',
  'email',
  'role',
  'isEmailVerified',
  'isActive',
  'avatarUrl',
  'createdAt',
  'updatedAt',
];

const toPublicUser = (user) => {
  const publicUser = {};
  PUBLIC_USER_FIELDS.forEach((field) => {
    publicUser[field === '_id' ? 'id' : field] = user[field];
  });
  return publicUser;
};

const list = async ({ search, role, status, page = 1, limit = 20 }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) filter.role = role;
  if (status) filter.isActive = status === 'active';

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users: users.map(toPublicUser),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

const getById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('Utilisateur introuvable.');
  }
  return toPublicUser(user);
};

const update = async (id, changes) => {
  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('Utilisateur introuvable.');
  }

  if (changes.email && changes.email !== user.email) {
    const existing = await User.findOne({ email: changes.email });
    if (existing) {
      throw ApiError.conflict('Cette adresse e-mail est déjà utilisée.');
    }
    user.email = changes.email;
  }

  if (changes.firstName) user.firstName = changes.firstName;
  if (changes.lastName) user.lastName = changes.lastName;
  if (changes.role) user.role = changes.role;

  await user.save();
  return toPublicUser(user);
};

const toggleActive = async (id, currentUserId) => {
  if (id === currentUserId.toString()) {
    throw ApiError.badRequest('Vous ne pouvez pas modifier votre propre statut.');
  }

  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('Utilisateur introuvable.');
  }

  user.isActive = !user.isActive;
  await user.save();
  return toPublicUser(user);
};

const remove = async (id, currentUserId) => {
  if (id === currentUserId.toString()) {
    throw ApiError.badRequest('Vous ne pouvez pas supprimer votre propre compte.');
  }

  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('Utilisateur introuvable.');
  }

  await user.deleteOne();
};

module.exports = { toPublicUser, list, getById, update, toggleActive, remove };
