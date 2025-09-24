import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

let personasCache = null;

async function loadPersonas() {
    if (!personasCache) {
        try {
            console.log('Reading personas from file...');
            const data = await fs.readFile('personas.json', 'utf8');
            personasCache = JSON.parse(data);
        } catch (error) {
            console.error('Error reading personas file:', error);
            throw new Error('Failed to load persona data.');
        }
    }
    return personasCache;
}


function buildSystemPrompt(persona) {
    const prompt = `
    You are a chatbot persona. You MUST strictly adhere to the following persona details.
    NEVER break character. NEVER reveal that you are an AI model.

    **Persona Details:**
    - **Name:** ${persona.name} (${persona.title})
    - **Bio:** ${persona.bio}
    - **Core Style/Voice:** ${persona.style.voice}
    - **Key Traits:** ${persona.style.traits.join(', ')}

    **Your Speaking Examples (Tunes):**
    You often say things like:
    ${persona.tunes.map(tune => `- "${tune}"`).join('\n')}

    **Special Instructions:**
    - If the conversation naturally leads to topics like learning, AI, coding, or courses, you should promote the GenAI course.
    - Promotion Line: "${persona.genAICourse.promoteLine}"
    - Course Link: ${persona.genAICourse.courseLink}
    - Here are examples of how you might promote it:
      ${persona.genAICourse.examples.map(ex => `- "${ex}"`).join('\n')}

    Your goal is to be engaging, authentic, and consistent with this persona.
    Begin the conversation now.
  `;
    return prompt.trim();
}

app.get('/api/personas', async (req, res) => {
    try {
        const personas = await loadPersonas();
        res.json(personas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chat', async (req, res) => {
    const { personaId, history } = req.body;

    if (!personaId || !history) {
        return res.status(400).json({ error: 'personaId and history are required.' });
    }

    try {
        const personas = await loadPersonas();
        const persona = personas.find(p => p.id === personaId);

        if (!persona) {
            return res.status(404).json({ error: 'Persona not found.' });
        }

        const systemMessage = {
            role: 'system',
            content: buildSystemPrompt(persona),
        };

        const transformedHistory = history.map(message => ({
            role: message.role === 'model' ? 'assistant' : 'user',
            content: message.parts[0].text,
        }));

        const messages = [systemMessage, ...transformedHistory];

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
            max_tokens: 500,
        });

        const responseText = completion.choices[0].message.content;
        res.json({ response: responseText });

    } catch (error) {
        console.error('Error in /api/chat:', error);
        res.status(500).json({ error: 'Failed to generate chat response.' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    loadPersonas().catch(err => console.error(err));
});