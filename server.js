import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

// ... (keep other routes as they are)

// Updated route for claim creation with improved error handling
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

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});