# 🗳️ VOTEX - Blockchain Online Voting System

VOTEX is a futuristic, antigravity-themed web application that provides a secure, immutable, and transparent online voting system. Powered by blockchain technology and facial biometric verification.

## 🌟 Features
- **3D Interactive Interface**: Built with Three.js, React Three Fiber, and framer-motion for a zero-gravity feel.
- **Glassmorphism Design**: Custom Tailwind CSS implementation with neon glows.
- **Biometric Security**: AI-based facial recognition (`face-api.js`) to verify voters and prevent fraud.
- **Immutable Ledger**: Ethereum/Polygon Smart Contracts via Solidity ensure 1 voter = 1 vote.
- **Robust Auth**: JWT, bcrypt, and Email/App-based 2FA powered by Speakeasy.

---

## 🏗️ Project Structure
The repository is structured as a monorepo:
- `/frontend` - React 19 + Vite app
- `/backend` - Node.js + Express + MongoDB REST API
- `/blockchain` - Hardhat Ethereum development environment

---

## 🚀 Setup Instructions

### 1. Database (Backend)
1. Ensure you have MongoDB running locally (`mongodb://localhost:27017`) or get an Atlas URI.
2. `cd backend`
3. The `.env` file is already created. Verify the `MONGODB_URI` inside.
4. Run `npm install`
5. Start server: `npm run dev` (Runs on port 5000)

### 2. Smart Contracts (Blockchain)
1. `cd blockchain`
2. Run `npm install`
3. Compile contracts: `npx hardhat compile`
4. Start a local node: `npx hardhat node`
5. Deploy (In a new terminal window): `npx hardhat ignition deploy ignition/modules/Votex.js --network localhost`
6. *Note down the deployed contract address and update it in `frontend/src/pages/VoteCasting.jsx`*.

### 3. Client Interface (Frontend)
1. `cd frontend`
2. Run `npm install`
3. **Important for Face-API**: You must download the `face-api.js` weights (tiny_face_detector, face_landmark_68, face_recognition) and place them in `frontend/public/models/`.
4. Start development server: `npm run dev`
5. Open `http://localhost:5173` in your browser.

---

## 🔒 Security Flow
1. User registers providing name, email, password, and webcam face snapshot.
2. User logs in. System verifies password.
3. System requests 2FA token (Speakeasy / Authenticator).
4. For voting: System requests live webcam feed to match face descriptors against registered snapshot.
5. If verified, user signs MetaMask transaction to cast vote on the Blockchain.
6. A unique transaction hash is generated as the voter's permanent record.
