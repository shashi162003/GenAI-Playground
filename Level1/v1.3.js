// Ref Website: https://llm-concept.vercel.app/

const TOKEN_TYPES = {
    NUMBER: "NUMBER",
    PLUS: "PLUS",
    MINUS: "MINUS",
    MULTIPLY: "MULTIPLY",
    DIVIDE: "DIVIDE",
    LPAREN: "LPAREN",
    RPAREN: "RPAREN"
};

function tokenize(input) {
    const tokens = [];
    let i = 0;

    while (i < input.length) {
        const char = input[i];

        if (/\s/.test(char)) {
            i++;
            continue;
        }

        if (/\d/.test(char)) {
            let num = char;
            i++;
            while (i < input.length && /\d/.test(input[i])) {
                num += input[i];
                i++;
            }
            tokens.push({ type: TOKEN_TYPES.NUMBER, value: num });
            continue;
        }

        if (char === "+") {
            tokens.push({ type: TOKEN_TYPES.PLUS, value: char });
        } else if (char === "-") {
            tokens.push({ type: TOKEN_TYPES.MINUS, value: char });
        } else if (char === "*") {
            tokens.push({ type: TOKEN_TYPES.MULTIPLY, value: char });
        } else if (char === "/") {
            tokens.push({ type: TOKEN_TYPES.DIVIDE, value: char });
        } else if (char === "(") {
            tokens.push({ type: TOKEN_TYPES.LPAREN, value: char });
        } else if (char === ")") {
            tokens.push({ type: TOKEN_TYPES.RPAREN, value: char });
        } else {
            throw new Error("Unexpected character: " + char);
        }

        i++;
    }

    return tokens;
}

console.log(tokenize("12 + 24 * (5 - 3)"));