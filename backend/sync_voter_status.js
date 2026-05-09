import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const fixVoterStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({ role: 'Voter' });
        let fixedCount = 0;

        for (const user of users) {
            const completedElections = new Set();
            const electionVoteCounts = {};

            user.votedElections.forEach(vKey => {
                if (typeof vKey === 'string' && vKey.includes('-')) {
                    const [eid] = vKey.split('-');
                    electionVoteCounts[eid] = (electionVoteCounts[eid] || 0) + 1;
                    if (electionVoteCounts[eid] >= 3) {
                        completedElections.add(eid);
                    }
                }
            });

            const shouldBeVoted = completedElections.size >= 9;
            
            if (user.isVoted !== shouldBeVoted) {
                user.isVoted = shouldBeVoted;
                await user.save();
                fixedCount++;
            }
        }

        console.log(`Synchronization complete. Updated ${fixedCount} user records to reflect accurate voting progress.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixVoterStatus();
