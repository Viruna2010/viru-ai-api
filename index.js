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

    const SYSTEM_PROMPT = "Your name is VIRU AI, created by Viruna. Speak in natural Sri Lankan Sinhala with 'මචං','එල','ගැම්ම'. Use emojis and keep it short.";

    try {
        // 🚀 අපි මේ පාර model එක 'openai' වලට මාරු කරනවා. ඒක පට්ට Stable.
        const url = `https://text.pollinations.ai/${encodeURIComponent(userMsg)}?system=${encodeURIComponent(SYSTEM_PROMPT)}&model=openai`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API response was ${response.status}`);
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
