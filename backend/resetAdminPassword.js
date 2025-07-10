const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gigmatch';

async function resetPassword() {
  await mongoose.connect(MONGODB_URI);
  const email = 'admin@gigmatch.com';
  const newPassword = 'YourNewPassword123!';

  const user = await User.findOne({ email });
  if (!user) {
    console.log('Admin user not found');
    process.exit(1);
  }
  user.password = newPassword;
  user.isActive = true; // Ensure the user is active
  await user.save();
  console.log('Admin password reset successfully!');
  process.exit(0);
}

resetPassword();