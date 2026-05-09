import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const resetVoters = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const result = await User.updateMany(
            { role: 'Voter' },
            { $set: { votedElections: [], isVoted: false } }
        );
        console.log(`Reset status for ${result.modifiedCount} voters.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetVoters();
