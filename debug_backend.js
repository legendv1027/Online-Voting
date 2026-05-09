import 'dotenv/config';
import express from 'express';
import connectDB from './backend/src/db.js';
import User from './backend/src/models/User.js';

const test = async () => {
    try {
        console.log("Testing Backend Initialization...");

        // 1. Test DB Connection
        await connectDB();
        console.log("DB Hooked.");

        // 2. Test Model Loading
        const count = await User.countDocuments();
        console.log(`User model online. Count: ${count}`);

        // 3. Test Route Imports
        console.log("Importing authRoutes...");
        const authRoutes = await import('./backend/src/routes/authRoutes.js');
        console.log("authRoutes imported.");

        console.log("\nBackend check completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Backend check failed:");
        console.error(err);
        process.exit(1);
    }
};

test();
