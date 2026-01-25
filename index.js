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

    const SYSTEM_PROMPT = "Your name is VIRU AI, created by Viruna. Speak in casual Sri Lankan Sinhala with 'මචං','එල','ගැම්ම'. If user speaks English, reply in English. Use emojis. Keep it short.";

    try {
        // Axios වෙනුවට Native Fetch පාවිච්චි කරමු - මේක වඩාත් Stable
        const url = `https://text.pollinations.ai/${encodeURIComponent(userMsg)}?system=${encodeURIComponent(SYSTEM_PROMPT)}&model=mistral-7b&cache=false`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Pollinations API error: ${response.status}`);
        }

        const aiText = await response.text();

        res.json({
            reply: aiText.trim(),
            creator: "Viruna"
        });

    } catch (error) {
        console.error("Error details:", error);
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
