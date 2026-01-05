const fs = require('fs');
const path = require('path');

const target = path.resolve(__dirname, '../storage/app');
const link = path.resolve(__dirname, '../public/storage');
const linkParent = path.dirname(link);

// 1️⃣ Ensure target directory exists
if (!fs.existsSync(target)) {
  console.error('Target directory does not exist:', target);
  process.exit(1);
}

// 2️⃣ Create parent directory (public/storage) if it doesn't exist
if (!fs.existsSync(linkParent)) {
  fs.mkdirSync(linkParent, { recursive: true });
}

// 3️⃣ Exit if symlink already exists
if (fs.existsSync(link)) {
  console.log('public/storage already exists');
  process.exit(0);
}

// 4️⃣ Create symbolic link
try {
  fs.symlinkSync(target, link, 'junction'); // "junction" works cross-platform (especially Windows)
  console.log('Storage linked successfully');
} catch (err) {
  console.error('Failed to create symlink:', err.message);
}
