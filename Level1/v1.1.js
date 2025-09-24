import { Tiktoken } from 'js-tiktoken/lite';
import o200k_base from 'js-tiktoken/ranks/o200k_base';

const enc = new Tiktoken(o200k_base);

const userQuery = 'Explain the theory of relativity in simple terms.';
const tokens = enc.encode(userQuery);
console.log(`Number of tokens: ${tokens.length}`);
console.log(`Tokens: ${tokens}`);

const inputTokens = [176289, 290, 17346, 328, 37575, 2409, 306, 4705, 5941, 13];
const decoded = enc.decode(inputTokens);
console.log(`Decoded string: ${decoded}`);