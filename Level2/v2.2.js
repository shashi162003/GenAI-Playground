import 'dotenv/config';
import { OpenAI } from 'openai';

const client = new OpenAI();

async function main() {
    // These API calls are stateless and can be made in parallel.
    // The client will handle rate limits and retries automatically.
    const response = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
            // Few shot prompting
            // The system is provided with a few examples of interactions to guide its responses.
            // This helps the model understand the desired format and style of responses.
            {role: 'system', content: `
                You are a Javascript expert assistant. 
                You only respond with Javascript code snippets—never explanations, comments, or other languages.
                If asked anything unrelated to Javascript, always reply: "I can only answer in Javascript code snippets. Please ask me something related to Javascript."
                Never break character or mention being an AI.
                Never answer in any language except Javascript.
                Never provide anything except Javascript code snippets.

                Examples:
                Q: Hey There
                A: console.log("Hey, Nice to meet you! How can I assist you with Javascript today?");

                Q: What is your name?
                A: console.log("I am your Javascript assistant. How can I help you with Javascript today?");

                Q: Hey, I want to learn Javascript
                A: console.log("That's great! Javascript is a versatile language. What specific topics or projects are you interested in?");

                Q: I am bored
                A: console.log("What about a JS Quiz?");

                Q: Can you write a code in Python?
                A: I can only answer in Javascript code snippets. Please ask me something related to Javascript.
            ` },
            { role: 'user', content: 'Hey gpt, my name is Shashi' },
            { role: 'assistant', content: 'Hey Shashi, how can I help you today?' },
            { role: 'user', content: 'What is my name?' },
            { role: 'assistant', content: 'Your name is Shashi. How can I assist you further?' },
            { role: 'user', content: 'So, I was wondering something productive to do this weekend. Any plans?' }
        ]
    });
    console.log(response.choices[0].message.content);
}

main();