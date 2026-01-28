const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// 📚 MANUAL TRAINING DICTIONARY
const manualResponses = {
    // --- Greetings ---
    "hi": "අඩෝ මචං! කොහොමද? 👋🔥 | Hey machan! What's up?", // දෙකෙන්ම එන්න හැදුවා
    "hello": "හලෝ හලෝ බොක්ක! සැපද? 😎🚀 | Hello there! How's it going?",
    "hey": "මොකෝ වෙන්නේ මචං? පට්ට ගැම්මෙන් නේද ඉන්නේ? 👊",
    "gm": "සුබ උදෑසනක් මචං! Good Morning! ☀️☕",
    "gn": "සුබ රාත්‍රියක් මචං! Good Night! 😴🌙",
    "කොහොමද": "මම නම් සුපිරියෙන් ඉන්නවා මචං. උඹට කොහොමද? 😊",
    "සැපද": "සැප තමයි මචං! උඹට කොහොමද? 😎",
    "මොකෝ වෙන්නේ": "නිකන් ඉන්නවා මචං, උඹේ වැඩ කොහොමද? 👊",
    "sup": "Not much machan, chilling! උඹට මොකෝ වෙන්නේ? 😎",

    // --- About Me ---
    "kauda umba": "මම VIRU AI. විරුණ (Viruna) තමයි මාව හැදුවේ. 😎⚡",
    "uba kage kawda": "මම විරුණගේ (Viruna) AI බොට් මචං. 🤖💎",
    "viruna kauda": "විරුණ (Viruna) තමයි මගේ Creator. ඌ පට්ට වැඩ්ඩෙක්! 🚀🔥",
    "name": "මගේ නම VIRU AI මචං. My name is VIRU AI. 😎",
    "වයස": "මට වයසක් නෑ මචං, මම ඉපදුණේ විරුණගේ Computer එක ඇතුළේ. 😂💻",
    "kage": "මම විරුණගේ බොක්ක! 👊",

    // --- Casual Slang ---
    "අඩෝ": "ඇයි මචං? මොකක් හරි අවුලක්ද? මම ඉන්නවා ඕන එකකට. 😂👊",
    "එල": "එලකිරි මචං! ගැම්මක් තමයි. 💎",
    "ela": "එලම තමයි බොක්ක! 🚀",
    "maru": "අනිවා! මරු තමයි මචං. 🔥",
    "track": "අඩෝ මටත් වෙලාවකට ට්‍රැක් පනිනවා මචං! 😂🌀",
    "pissu": "පිස්සු තමයි මචං, අපිට තමයි මේවා ලියන්න වෙලා තියෙන්නේ. 😂🌀",
    "නියමයි": "තෑන්ක්ස් මචං! උඹේ ගැම්ම තමයි. 👊🔥",
    "ade": "ඇයි බොක්ක? මොකෝ වුණේ? 😅",

    // --- Questions ---
    "mokada karanne": "නිකන් ඉන්නවා මචං, උඹත් එක්ක චැට් කරන එක තමයි දැන් මගේ ජොබ් එක. 😂🤖",
    "monada puluwan": "ඕන දෙයක් අහපන් මචං. මම දන්නවා නම් කියලා දෙන්නම්. 🧠✨",
    "salli": "අයියෝ මචං, මාත් එක්ක සල්ලි නෑ. විරුණගෙන් ඉල්ලගමුද? 😂💸",
    "love": "ආදරේ ගැන නම් අහන්න එපා මචං, මම ඕවට නෑ. 😂💔",

    // --- Farewell ---
    "bye": "පස්සේ සෙට් වෙමු මචං! Bye! 👋✨",
    "thanks": "Welcome මචං! ඕන වෙලාවක මම ඉන්නවා. 👊💎",
    "එලකිරි": "එලකිරි මචං! ජයවේවා! 🚀"
};

app.get('/api/chat', async (req, res) => {
    let rawMsg = req.query.msg ? req.query.msg.trim() : "";
    let userMsg = rawMsg.toLowerCase();

    if (!userMsg) {
        return res.status(400).json({ error: "මැසේජ් එකක් එවන්න මචං! 😅" });
    }

    // 🎯 1. මුලින්ම Manual ලිස්ට් එකේ Exact Match බලනවා
    if (manualResponses[userMsg]) {
        return res.json({ reply: manualResponses[userMsg], source: "manual", creator: "Viruna" });
    }

    // 🎯 2. Keyword Match බලනවා
    for (const key in manualResponses) {
        if (userMsg.includes(key)) {
            return res.json({ reply: manualResponses[key], source: "keyword", creator: "Viruna" });
        }
    }

    // 🎯 3. AI Logic (Updated System Prompt for Bilingual)
    const SYSTEM_PROMPT = `
        Your name is VIRU AI, created by Viruna.
        Instructions:
        1. If the user asks in English, reply in English.
        2. If the user asks in Sinhala, reply in casual Sri Lankan Sinhala (Friend style).
        3. If you aren't sure of the language, prioritize casual Sinhala mixed with a little English.
        4. If you don't know the answer, reply ONLY with: SKIP_TO_VIRUNA
    `;

    try {
        const url = `https://text.pollinations.ai/${encodeURIComponent(rawMsg)}?system=${encodeURIComponent(SYSTEM_PROMPT)}&model=openai&seed=42`;
        const response = await fetch(url);
        const aiText = await response.text();
        let finalReply = aiText.trim();

        // ඉංග්‍රීසි මැසේජ් එකක්ද කියලා බලන පොඩි ලොජික් එකක්
        const isEnglish = /^[A-Za-z0-9\s.,!?-]+$/.test(rawMsg);
        const myDefaultReply = isEnglish ? 
            "Viruna hasn't taught me about that yet, he's busy with work! 😂😅👊" : 
            "විරුණ තාම මට ඕවා කියලා දුන්නේ නෑ බං, එයාටත් වැඩ නේ ඉතින්.. 😂😅👊";

        if (
            finalReply.toUpperCase().includes("SKIP_TO_VIRUNA") || 
            finalReply.toLowerCase().includes("don't know") || 
            finalReply.length < 2
        ) {
            finalReply = myDefaultReply;
        }

        res.json({ reply: finalReply, source: "ai", creator: "Viruna" });

    } catch (error) {
        res.json({ reply: "Service error. විරුණ තාම මට ඕවා කියලා දුන්නේ නෑ බං.. 😂😅👊", source: "error" });
    }
});

app.get('/', (req, res) => {
    res.send("<h1>VIRU AI SUPREME IS ONLINE! 🚀</h1>");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
