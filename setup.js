#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up MatchyStore CMS...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Node.js 18+ is required. Current version:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js version check passed');

// Install root dependencies
console.log('\n📦 Installing root dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed');
} catch (error) {
  console.error('❌ Failed to install root dependencies:', error.message);
  process.exit(1);
}

// Install server dependencies
console.log('\n📦 Installing server dependencies...');
try {
  execSync('npm install', { cwd: path.join(__dirname, 'server'), stdio: 'inherit' });
  console.log('✅ Server dependencies installed');
} catch (error) {
  console.error('❌ Failed to install server dependencies:', error.message);
  process.exit(1);
}

// Install client dependencies
console.log('\n📦 Installing client dependencies...');
try {
  execSync('npm install', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });
  console.log('✅ Client dependencies installed');
} catch (error) {
  console.error('❌ Failed to install client dependencies:', error.message);
  process.exit(1);
}

// Check if .env file exists
const envPath = path.join(__dirname, 'server', '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n📝 Creating .env file...');
  try {
    const envExample = fs.readFileSync(path.join(__dirname, 'server', 'env.example'), 'utf8');
    fs.writeFileSync(envPath, envExample);
    console.log('✅ .env file created from template');
    console.log('⚠️  Please update the .env file with your database credentials');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
  }
} else {
  console.log('✅ .env file already exists');
}

// Generate Prisma client
console.log('\n🔧 Generating Prisma client...');
try {
  execSync('npm run db:generate', { cwd: path.join(__dirname, 'server'), stdio: 'inherit' });
  console.log('✅ Prisma client generated');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  console.log('⚠️  You may need to set up your database first');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update server/.env with your database credentials');
console.log('2. Create a PostgreSQL database named "matchystorecms"');
console.log('3. Run: cd server && npm run db:push');
console.log('4. Run: cd server && npm run db:seed');
console.log('5. Start the development server: npm run dev');
console.log('\n🌐 Access the application at:');
console.log('- Frontend: http://localhost:5173');
console.log('- Backend: http://localhost:3001');
console.log('\n🔐 Default login credentials:');
console.log('- Admin: admin@matchystore.com / admin123');
console.log('- Customer: customer@example.com / customer123');








