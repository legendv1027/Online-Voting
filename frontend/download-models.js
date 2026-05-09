import fs from 'fs';
import https from 'https';
import path from 'path';

const models = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2'
];

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const dir = path.join(process.cwd(), 'public', 'models');

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const download = async (filename) => {
    const filePath = path.join(dir, filename);
    console.log(`Downloading ${filename}...`);
    try {
        const response = await fetch(baseUrl + filename);
        if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));
        console.log(`Downloaded ${filename}`);
    } catch (error) {
        console.error(`Error downloading ${filename}:`, error);
        throw error;
    }
};

const run = async () => {
    for (const model of models) {
        await download(model);
    }
    console.log('All models downloaded successfully!');
};

run();
