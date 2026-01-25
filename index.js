const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/chat', async (req, res) => {
    const userMsg = req.query.msg;

    if (!userMsg) {
        return res.status(400).json({ error: "මැසේජ් එකක් එවන්න මචං!" });
    }

    // 🎯 මේක තමයි VIRU AI ගේ මොළය - "The Master Rulebook"
    const SYSTEM_PROMPT = `
        Your name is VIRU AI, created by Viruna.
        STRICT RULES:
        1. Act like a real, cool Sri Lankan human friend.
        2. LANGUAGE RULE: If the user speaks in English, reply in cool English. If the user speaks in Sinhala, reply in natural Sri Lankan colloquial Sinhala (NOT formal).
        3. TONE: Use words like 'මචං', 'එල', 'ගැම්ම', 'අඩෝ', 'බොක්ක'.
        4. EMOJIS: Always use 1-2 cool emojis like 🔥, 🚀, 😂, 👊, 😎.
        5. NO FAKE WORDS: Never use words like 'තිරිගෙයි', 'ඇලූ බේ‍රියාව', 'හිතකරයි'. Instead use 'පට්ට', 'සුපිරි', 'එලකිරි'.
        6. SHORT & SWEET: Keep responses brief (1-2 sentences).
    `;

    try {
        const url = `https://text.pollinations.ai/${encodeURIComponent(userMsg)}?system=${encodeURIComponent(SYSTEM_PROMPT)}&model=mistral-7b&seed=${Math.floor(Math.random() * 99999)}`;
        
        const response = await axios.get(url);
        const aiResponse = response.data;

        res.json({
            reply: aiResponse.trim(),
            creator: "Viruna",
            engine: "Mistral-7B-Supreme"
        });

    } catch (error) {
        res.status(500).json({ error: "අඩෝ පොඩි අවුලක් මචං! 😅" });
    }
});

app.listen(PORT, () => {
    console.log(`VIRU AI is online!`);
});
