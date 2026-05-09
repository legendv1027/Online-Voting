import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    electionId: {
        type: Number,
        required: true // Links the candidate to an active election ID (1 = Council, 2 = Mars)
    },
    avatarUrl: {
        type: String,
        required: false
    },
    symbol: {
        type: String,
        required: false // Unique symbol for the candidate (e.g., "Rocket", "Lion")
    },
    votes: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.model('Candidate', candidateSchema);
