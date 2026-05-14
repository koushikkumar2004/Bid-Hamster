const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log('⚠️  Admin credentials not set in .env — skipping admin seed.');
      return;
    }

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('✅ Admin account already exists.');
      return;
    }

    const admin = await User.create({
      name: 'Platform Admin',
      email: adminEmail,
      password: adminPassword,
      age: 25,
      gender: 'Prefer not to say',
      role: 'admin',
      isVerified: true,
    });

    console.log(`✅ Admin seeded: ${admin.email}`);
  } catch (error) {
    console.error('❌ Admin seed error:', error.message);
  }
};

module.exports = seedAdmin;
