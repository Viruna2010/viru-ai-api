const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/chat', async (req, res) => {
    const userMsg = req.query.msg;

    if (!userMsg) {
        return res.status(400).json({ error: "මැසේජ් එකක් එවන්න මචං!" });
    }

    // මූට දෙන පට්ට නීති මාලාව
    const SYSTEM_PROMPT = "Your name is VIRU AI, created by Viruna. Speak in casual Sri Lankan Sinhala with 'මචං','එල','ගැම්ම'. If user speaks English, reply in English. Use emojis. Keep it short.";

    try {
        // 🚀 අලුත්ම Endpoint එක: /prompt/ පාවිච්චි කරමු
        const url = `https://text.pollinations.ai/prompt/${encodeURIComponent(userMsg)}?system=${encodeURIComponent(SYSTEM_PROMPT)}&model=mistral-7b`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            // මෙතනදී error එකක් ආවොත් ඒකෙ විස්තරේ මෙතනින් බලාගන්න පුළුවන්
            const errorBody = await response.text();
            throw new Error(`Status: ${response.status} - ${errorBody}`);
        }

        const aiText = await response.text();

        res.json({
            reply: aiText.trim(),
            creator: "Viruna"
        });

    } catch (error) {
        res.status(500).json({ 
            error: "API එකේ පොඩි අවුලක් මචං!", 
            details: error.message 
        });
    }
});

app.get('/', (req, res) => {
    res.send("VIRU AI Supreme Backend is LIVE! 🚀");
});

app.listen(PORT, () => {
    console.log(`VIRU AI is online!`);
});
