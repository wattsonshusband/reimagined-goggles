let tokensInMemory = null;

async function saveTokens(tokens) { tokensInMemory = tokens; }
async function getTokens() { return tokensInMemory; }
async function clearTokens() { tokensInMemory = null; }

module.exports = { saveTokens, getTokens, clearTokens };
