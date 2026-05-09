import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const fixIndexes = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");

        const collections = await mongoose.connection.db.listCollections().toArray();
        const usersCollectionExists = collections.some(c => c.name === 'users');

        if (usersCollectionExists) {
            console.log("Checking indexes for 'users' collection...");
            const indexes = await mongoose.connection.db.collection('users').indexes();
            console.log("Current indexes:", JSON.stringify(indexes, null, 2));

            if (indexes.some(idx => idx.name === 'entityId_1')) {
                console.log("Dropping 'entityId_1' index...");
                await mongoose.connection.db.collection('users').dropIndex('entityId_1');
                console.log("Index 'entityId_1' dropped successfully.");
            } else {
                console.log("Index 'entityId_1' not found.");
            }
        } else {
            console.log("'users' collection not found.");
        }

        console.log("Indexing fix completed.");
        process.exit(0);
    } catch (error) {
        console.error("Error fixing indexes:", error);
        process.exit(1);
    }
};

fixIndexes();
