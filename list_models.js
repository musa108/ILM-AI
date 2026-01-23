const { GoogleGenerativeAI } = require('@google/generative-ai');

async function list() {
    try {
        const genAI = new GoogleGenerativeAI('AIzaSyCHaKgksWo7COSLHSLZ9f2Qr1A8CHpRruQ');
        const result = await genAI.listModels();
        console.log('MODELS:', result.models.map(m => m.name));
    } catch (error) {
        console.error('ERROR:', error);
    }
}

list();
