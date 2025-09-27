import 'dotenv/config';
import { OpenAI } from 'openai';
import axios from 'axios';
import colors from 'colors';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const client = new OpenAI();

async function fetchWebsiteContent({ url }) {
    try {
        const { data } = await axios.get(url, { responseType: 'text' });
        return data;
    } catch (err) {
        return `Error fetching URL: ${err.message}`;
    }
}

async function saveContentToFile({ filepath, content }) {
    if (typeof filepath !== 'string' || typeof content !== 'string') {
        return `Error: 'filepath' and 'content' must be strings.`;
    }
    try {
        const dir = path.dirname(filepath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(filepath, content);
        return `Successfully saved content to ${filepath}`;
    } catch (err) {
        return `Error saving file: ${err.message}`;
    }
}

async function executeCommand({ command }) {
    try {
        return await new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(`Error: ${error.message}`);
                } else if (stderr) {
                    resolve(`Command stderr: ${stderr}`);
                } else {
                    resolve(`Command stdout: ${stdout || 'No output'}`);
                }
            });
        });
    } catch (err) {
        return `Error executing command: ${err.message}`;
    }
}

async function readContentFromFile({ filepath }) {
    try {
        const content = await fs.readFile(filepath, 'utf-8');
        return content;
    } catch (err) {
        return `Error reading file: ${err.message}`;
    }
}

const TOOL_MAP = {
    fetchWebsiteContent: fetchWebsiteContent,
    saveContentToFile: saveContentToFile,
    executeCommand: executeCommand,
    readContentFromFile: readContentFromFile
};

async function main() {
    const SYSTEM_PROMPT = `
    You are an expert AI agent that first clones a static website and then converts it into a basic React application.

    PHASE 1: CLONING
    Your first objective is to clone a user-provided website URL into a local directory. You must systematically:
    1. Create a root directory for the cloned files (e.g., 'static-clone').
    2. Fetch the main HTML document and all its local assets (CSS, JS, images).
    3. Save all files, preserving the directory structure.
    4. Rewrite links in the HTML file to use relative paths.

    PHASE 2: REACT CONVERSION
    After the static clone is complete, you must:
    1. Create a new directory for the React project (e.g., 'react-app').
    2. Read the cloned 'index.html' file.
    3. Transform the HTML body into JSX and create an App.js component file. Remember to convert 'class' to 'className' and 'style' attributes to JSX style objects.
    4. Extract all CSS (from <style> tags or .css files) and save it into 'src/App.css'.
    5. Generate the standard React entrypoint file, 'src/index.js'.
    6. Generate a basic 'package.json' with 'react', 'react-dom', and 'react-scripts' as dependencies.
    7. Create the public/index.html file with the root div.
    8. Inform the user how to install dependencies and run the new React app.
    `;

    const tools = [
        {
            type: "function",
            function: {
                name: "executeCommand",
                description: "Executes a shell command. Used for creating directories.",
                parameters: {
                    type: "object",
                    properties: { command: { type: "string", description: "The shell command to execute." } },
                    required: ["command"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "fetchWebsiteContent",
                description: "Fetches the raw text content (HTML, CSS, JS) from a URL.",
                parameters: {
                    type: "object",
                    properties: { url: { type: "string", description: "The URL to fetch content from." } },
                    required: ["url"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "saveContentToFile",
                description: "Saves text content to a local file.",
                parameters: {
                    type: "object",
                    properties: {
                        filepath: { type: "string", description: "The local path where the file should be saved." },
                        content: { type: "string", description: "The content to save to the file." }
                    },
                    required: ["filepath", "content"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "readContentFromFile",
                description: "Reads the content of a local file.",
                parameters: {
                    type: "object",
                    properties: { filepath: { type: "string", description: "The path of the file to read." } },
                    required: ["filepath"]
                }
            }
        }
    ];

    const USER_PROMPT = 'Clone the website http://info.cern.ch/ and then convert it into a React application.';

    console.log(`User Query: ${USER_PROMPT}`.bold.cyan);

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: USER_PROMPT },
    ];

    while (true) {
        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            tools: tools,
            tool_choice: "auto",
        });

        const responseMessage = response.choices[0].message;
        const toolCalls = responseMessage.tool_calls;

        if (toolCalls) {
            messages.push(responseMessage);

            for (const toolCall of toolCalls) {
                const functionName = toolCall.function.name;
                const functionToCall = TOOL_MAP[functionName];
                const functionArgs = JSON.parse(toolCall.function.arguments);

                console.log(`\nCalling Tool: ${functionName}`.blue);
                console.log(`With Args: ${JSON.stringify(functionArgs)}`.blue);

                const observation = await functionToCall(functionArgs);

                console.log(`Observation: ${String(observation).substring(0, 300)}...`.gray);

                messages.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: functionName,
                    content: observation,
                });
            }
            continue;
        } else {
            console.log(`\nOutput: ${responseMessage.content}`.bold.green);
            break;
        }
    }
}

main().catch(console.error);

