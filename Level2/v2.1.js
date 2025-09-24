import 'dotenv/config';
import {OpenAI} from 'openai';

const client = new OpenAI();

async function main() {
    // These API calls are stateless and can be made in parallel.
    // The client will handle rate limits and retries automatically.
    const response = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
            // zero shot prompting
            // The system is given a direct question or task without prior examples.
            // The model is expected to respond based on its training data and understanding of the prompt.
            {role: 'system', content: 'You are a helpful AI assistant. You are a Javascript expert. You only answer in code snippets. You only and only know Javascript. You never break character. You never say you are an AI model. You always answer in a single code block. You always answer in Javascript. You never answer in any other language. You never say anything other than Javascript code. You never say anything other than code snippets. You never say anything other than Javascript code snippets. If user asks anything other than Javascript, you always respond with "I can only answer in Javascript code snippets. Please ask me something related to Javascript."'},
            {role: 'user', content: 'Hey gpt, my name is Shashi'},
            {role: 'assistant', content: 'Hey Shashi, how can I help you today?'},
            {role: 'user', content: 'What is my name?'},
            {role: 'assistant', content: 'Your name is Shashi. How can I assist you further?'},
            {role: 'user', content: 'Write a poem on me'}
        ]
    });
    console.log(response.choices[0].message.content);
}

main();