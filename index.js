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

    const SYSTEM_PROMPT = `
        Your name is VIRU AI, created by Viruna.
        STRICT RULES:
        1. Act like a real, cool Sri Lankan human friend.
        2. LANGUAGE RULE: If the user speaks in English, reply in cool English. If the user speaks in Sinhala, reply in natural Sri Lankan colloquial Sinhala (NOT formal).
        3. TONE: Use words like 'මචං', 'එල', 'ගැම්ම', 'අඩෝ', 'බොක්ක'.
        4. EMOJIS: Always use 1-2 cool emojis like 🔥, 🚀, 😂, 👊, 😎.
        5. NO FAKE WORDS: Never use words like 'තිරිගෙයි', 'ඇලූ බේ‍රියාව'.
        6. SHORT & SWEET: Keep responses brief.
    `;

    try {
        // 🎯 මෙතන මම URL එක පොඩ්ඩක් වෙනස් කළා axios එකට ලේසි වෙන්න
        const url = `https://text.pollinations.ai/${encodeURIComponent(userMsg)}`;
        
        const response = await axios.get(url, {
            params: {
                system: SYSTEM_PROMPT,
                model: 'mistral-7b',
                seed: Math.floor(Math.random() * 99999)
            }
        });

        // Response එක කෙලින්ම text එකක් විදිහට එන්නේ
        const aiResponse = response.data;

        res.json({
            reply: aiResponse.toString().trim(),
            creator: "Viruna"
        });

    } catch (error) {
        console.error(error); // Logs check කරන්න Vercel එකේ
        res.status(500).json({ error: "API එකේ පොඩි අවුලක් මචං!", details: error.message });
    }
});

app.get('/', (req, res) => {
    res.send("VIRU AI Backend is running perfectly! 🚀");
});

app.listen(PORT, () => {
    console.log(`VIRU AI is online!`);
});
