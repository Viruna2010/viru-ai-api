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

    // මූට දෙන පට්ට නීති මාලාව
    const SYSTEM_PROMPT = "Your name is VIRU AI, created by Viruna. Speak in casual Sri Lankan Sinhala with 'මචං','එල','ගැම්ම'. If user speaks English, reply in English. Use emojis. Keep it short.";

    try {
        // 🚀 URL එක කෙලින්ම හදන එක තමයි 404 නොවී තියෙන්න හොඳම ක්‍රමය
        const url = `https://text.pollinations.ai/${encodeURIComponent(userMsg)}?system=${encodeURIComponent(SYSTEM_PROMPT)}&model=mistral-7b&seed=${Math.floor(Math.random() * 99999)}`;
        
        const response = await axios.get(url);
        
        // Response එක plain text එකක් විදිහට එන්නේ
        let aiText = response.data;

        res.json({
            reply: aiText.toString().trim(),
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
