const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const ApiError = require('../errors/ApiError');

const AVATARS_DIR = path.resolve(process.cwd(), 'uploads', 'avatars');
fs.mkdirSync(AVATARS_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AVATARS_DIR),
  filename: (req, file, cb) => {
    const extension = ALLOWED_MIME_TYPES[file.mimetype];
    cb(null, `${req.user._id}-${crypto.randomUUID()}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES[file.mimetype]) {
    cb(ApiError.badRequest('Format d’image non supporté. Utilisez JPEG, PNG ou WebP.'));
    return;
  }
  cb(null, true);
};

const avatarUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single('avatar');

const uploadAvatar = (req, res, next) => {
  avatarUpload(req, res, (err) => {
    if (!err) {
      if (!req.file) {
        next(ApiError.badRequest('Aucune image fournie.'));
        return;
      }
      next();
      return;
    }

    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      next(ApiError.badRequest('L’image ne doit pas dépasser 2 Mo.'));
      return;
    }

    next(err instanceof ApiError ? err : ApiError.badRequest(err.message));
  });
};

module.exports = { uploadAvatar, AVATARS_DIR };
