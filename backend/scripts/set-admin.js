/**
 * Usage : node scripts/set-admin.js [email]
 * Sans argument, promeut alphaooumar88@gmail.com par défaut.
 */
const { connectDB, disconnectDB } = require('../src/config/database');
const User = require('../src/models/User');

const email = (process.argv[2] || 'alphaooumar88@gmail.com').trim().toLowerCase();

async function run() {
  await connectDB();

  const user = await User.findOne({ email });
  if (!user) {
    console.error(`Aucun utilisateur trouvé avec l'adresse e-mail : ${email}`);
    process.exitCode = 1;
    return;
  }

  if (user.role === 'admin') {
    console.log(`L'utilisateur ${email} est déjà administrateur.`);
    return;
  }

  user.role = 'admin';
  await user.save();
  console.log(`L'utilisateur ${email} est maintenant administrateur.`);
}

run()
  .catch((error) => {
    console.error('Erreur lors de la mise à jour du rôle :', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
