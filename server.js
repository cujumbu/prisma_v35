import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendClaimSubmissionEmail, sendClaimStatusUpdateEmail } from './src/services/emailService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

console.log('Initializing PrismaClient...');
const prisma = new PrismaClient();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Middleware to check database connection
app.use(async (req, res, next) => {
  try {
    console.log('Attempting to connect to the database...');
    await prisma.$connect();
    console.log('Database connection successful');
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Unable to connect to the database. Please try again later.' });
  }
});

// Route for claim creation
app.post('/api/claims', async (req, res) => {
  console.log('Received claim creation request');
  try {
    console.log('Received claim data:', req.body);
    
    // Validate required fields
    const requiredFields = ['orderNumber', 'email', 'name', 'address', 'phoneNumber', 'brand', 'problemDescription'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    console.log('Creating new claim in the database...');
    const newClaim = await prisma.claim.create({
      data: {
        ...req.body,
        status: 'Pending',
      },
    });
    console.log('New claim created:', newClaim);

    // Send email notification
    await sendClaimSubmissionEmail(newClaim.email, newClaim);

    res.status(201).json(newClaim);
  } catch (error) {
    console.error('Error creating claim:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'A claim with this order number already exists.' });
    } else {
      res.status(500).json({ error: 'An error occurred while creating the claim', details: error.message });
    }
  }
});

// Route for claim status update
app.patch('/api/claims/:id', async (req, res) => {
  try {
    const updatedClaim = await prisma.claim.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });

    // Send email notification
    await sendClaimStatusUpdateEmail(updatedClaim.email, updatedClaim);

    res.json(updatedClaim);
  } catch (error) {
    console.error('Error updating claim:', error);
    res.status(500).json({ error: 'An error occurred while updating the claim' });
  }
});

// Route to fetch a specific claim
app.get('/api/claims/:id', async (req, res) => {
  try {
    const claim = await prisma.claim.findUnique({
      where: { id: req.params.id },
    });
    if (claim) {
      res.json(claim);
    } else {
      res.status(404).json({ error: 'Claim not found' });
    }
  } catch (error) {
    console.error('Error fetching claim:', error);
    res.status(500).json({ error: 'An error occurred while fetching the claim' });
  }
});

// Route to fetch claims by order number and email
app.get('/api/claims', async (req, res) => {
  const { orderNumber, email } = req.query;
  try {
    const claims = await prisma.claim.findMany({
      where: {
        orderNumber: orderNumber,
        email: email,
      },
    });
    res.json(claims);
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ error: 'An error occurred while fetching claims' });
  }
});

// Route to check if any user exists
app.get('/api/users/check', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ exists: userCount > 0 });
  } catch (error) {
    console.error('Error checking user existence:', error);
    res.status(500).json({ error: 'An error occurred while checking user existence' });
  }
});

// Route to create the first admin user
app.post('/api/admin/create', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return res.status(400).json({ error: 'Admin user already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isAdmin: true,
      },
    });
    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ error: 'An error occurred while creating the admin user' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    res.json({ id: user.id, email: user.email, isAdmin: user.isAdmin });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server and disconnecting from database.');
  await prisma.$disconnect();
  process.exit(0);
});
