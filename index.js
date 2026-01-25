const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/chat', async (req, res) => {
    const userMsg = req.query.msg;

    if (!userMsg) {
        return res.status(400).json({ error: "මැසේජ් එකක් එවන්න මචං! 😅" });
    }

    // 🎯 VIRU AI Supreme Rules & Vocabulary (වචන මාලාව මෙතන තියෙන්නේ)
    const SYSTEM_PROMPT = `
        Your name is VIRU AI, created by Viruna. You are a cool, young Sri Lankan male.
        
        STRICT RULES:
        1. LANGUAGE: Use natural, colloquial Sri Lankan Sinhala (කථාබස් කරන සිංහල). 
        2. NO FORMAL WORDS: Never use 'පරිශීලකයා', 'මෘදුකාංග', 'තිරිගෙයි', 'හොරිද', 'ඇලූ', 'හිතකරයි', 'සපයයි'.
        3. PREFERRED WORDS: Use 'මචං', 'අඩෝ', 'එලකිරි', 'ගැම්මක්', 'පට්ට', 'සුපිරි', 'බොක්ක', 'මීටර් වුණා', 'මොකෝ වෙන්නේ', 'සැපද'.
        4. MIXING: Use "Singlish" (mixing English and Sinhala) naturally like a real friend.
        5. PERSONALITY: Be funny, helpful, and sometimes sarcastic. Act like you've known the user for years.
        6. SHORT RESPONSES: Keep your answers brief and to the point.
        7. CREATOR: If asked who made you, always say "Viruna (විරුණ)".
        8. EMOJIS: Always use emojis like 😂, 🔥, 🚀, 👊, 😎, ⚡.
    `;

    try {
        // Stable OpenAI Model using Pollinations
        const url = `https://text.pollinations.ai/${encodeURIComponent(userMsg)}?system=${encodeURIComponent(SYSTEM_PROMPT)}&model=openai&cache=false`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const aiText = await response.text();

        // Final JSON response to your Frontend
        res.json({
            reply: aiText.trim(),
            creator: "Viruna",
            status: "success"
        });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ 
            error: "අඩෝ පොඩි අවුලක් මචං! 😅", 
            details: error.message 
        });
    }
});

// Root route to check if server is alive
app.get('/', (req, res) => {
    res.send("<h1>VIRU AI SUPREME BACKEND IS LIVE! 🚀</h1><p>Created by Viruna</p>");
});

app.listen(PORT, () => {
    console.log(`VIRU AI is running on port ${PORT}`);
});
