import 'dotenv/config';
import { OpenAI } from 'openai';

const client = new OpenAI();

async function createEmbedding() { 
    const result = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: 'The quick brown fox jumps over the lazy dog',
        encoding_format: 'base64'
    })
    console.log(result);
}   

createEmbedding();