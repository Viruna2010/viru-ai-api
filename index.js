const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

/**
 * 📚 MANUAL TRAINING DICTIONARY
 * වෘත්තීය මට්ටමින් සකස් කළ පිළිතුරු එකතුව
 */
const manualResponses = {
    // --- Greetings ---
    "hi": "ආයුබෝවන්! මම VIRU AI. ඔබට අද මම කොහොමද උදව් කළ යුත්තේ? 👋",
    "hello": "ආයුබෝවන්! ඔබව සාදරයෙන් පිළිගන්නවා. 😎🚀",
    "hey": "කොහොමද? ඔබගේ ගැටලුව ඉදිරිපත් කරන්න, මම සහාය වන්නම්. 👊",
    "gm": "සුබ උදෑසනක්! ඔබගේ දවස සාර්ථක වේවා! ☀️☕",
    "gn": "සුබ රාත්‍රියක්! ඔබට සාමකාමී නින්දක් ප්‍රාර්ථනා කරනවා. 😴🌙",
    "කොහොමද": "මම ඉතා හොඳින් සිටිනවා. ඔබගේ සුවදුක් කොහොමද? 😊",
    "සැපද": "මම ඉතා හොඳින් සිටිනවා. ඔබත් සතුටින් සිටිනවා යැයි මම විශ්වාස කරනවා. 😎",
    "sup": "මම හොඳින් සිටිනවා. ඔබට අවශ්‍ය ඕනෑම සහායක් ලබා දීමට මම සූදානම්. 😎",

    // --- About Developer (Viruna) ---
    "kauda umba": "මම VIRU AI. මාව නිර්මාණය කළේ විරුණ (Viruna) විසිනි. 😎⚡",
    "uba kage kawda": "මම විරුණ (Viruna) විසින් නිර්මාණය කරන ලද නිල AI සහායකයා වෙමි. 🤖💎",
    "viruna kauda": "විරුණ (Viruna) යනු දක්ෂ තරුණ මෘදුකාංග සංවර්ධකයෙකි. ඔහු මගේ නිර්මාණකරු වේ. 🚀🔥",
    "name": "මගේ නම VIRU AI. My name is VIRU AI. 😎",
    "වයස": "මම මෘදුකාංගයක් බැවින් මට නිශ්චිත වයසක් නොමැත. නමුත් මා නිර්මාණය වූයේ 2024-2025 කාල වකවානුවේදීය. 💻",

    // --- Casual Professional Transitions ---
    "අඩෝ": "ඔව්, ඔබට යම්කිසි සහායක් අවශ්‍ය ද? මම උදව් කිරීමට සූදානම්. 👊",
    "එල": "ඉතා හොඳයි. ඔබගේ දිරිගැන්වීමට ස්තුතියි. 💎",
    "ela": "විශිෂ්ටයි! ජයවේවා. 🚀",
    "නියමයි": "බොහොම ස්තුතියි. ඔබේ අදහස මට ගොඩක් වටිනවා. 👊🔥",

    // --- Farewell ---
    "bye": "නැවත හමුවෙමු! ඔබට සුබ දවසක් ප්‍රාර්ථනා කරනවා! 👋✨",
    "thanks": "ඔබව සාදරයෙන් පිළිගන්නවා! ඕනෑම වේලාවක මම සහාය වන්නම්. 👊💎",
    "එලකිරි": "ඉතා හොඳයි. ඔබට ජයවේවා! 🚀"
};

/**
 * 🎯 MULTI-MODEL BACKUP LOGIC
 * ප්‍රධාන API එක වැඩ නොකළහොත් අනෙක් Models මගින් උත්සාහ කරයි.
 */
async function fetchAIResponse(msg, systemPrompt) {
    // භාවිතා කළ හැකි Models ලැයිස්තුව
    const models = ['openai', 'mistral', 'llama', 'searchgpt'];
    
    for (let model of models) {
        try {
            // Pollinations API එක විවිධ Models සමඟ භාවිතා කිරීම
            const url = `https://text.pollinations.ai/${encodeURIComponent(msg)}?system=${encodeURIComponent(systemPrompt)}&model=${model}&seed=${Math.floor(Math.random() * 1000)}`;
            
            const response = await fetch(url, { 
                method: 'GET',
                signal: AbortSignal.timeout(8000) // තත්පර 8ක් ඇතුළත Response එකක් නැත්නම් Next Model එකට යයි
            });

            if (response.ok) {
                const text = await response.text();
                if (text && text.trim().length > 1 && !text.includes("error")) {
                    return text.trim();
                }
            }
        } catch (e) {
            console.log(`Model ${model} fail වුණා. ඊළඟ එක උත්සාහ කරනවා...`);
            continue; 
        }
    }
    return null; // සියලුම උත්සාහයන් අසාර්ථක වුවහොත්
}

app.get('/api/chat', async (req, res) => {
    let rawMsg = req.query.msg ? req.query.msg.trim() : "";
    let userMsg = rawMsg.toLowerCase();

    // 1. හිස් පණිවිඩයක් නම්
    if (!userMsg) {
        return res.status(400).json({ error: "කරුණාකර පණිවිඩයක් ඇතුළත් කරන්න. 😅" });
    }

    // 2. Manual Dictionary එක පරීක්ෂා කිරීම
    if (manualResponses[userMsg]) {
        return res.json({ reply: manualResponses[userMsg], source: "manual", creator: "Viruna" });
    }

    // 3. Keyword Match පරීක්ෂා කිරීම
    for (const key in manualResponses) {
        if (userMsg.includes(key)) {
            return res.json({ reply: manualResponses[key], source: "keyword", creator: "Viruna" });
        }
    }

    // 4. AI එකට යොමු කිරීම (Backup System එක සහිතව)
    const SYSTEM_PROMPT = `
        Your name is VIRU AI, created by Viruna.
        Instructions:
        1. Be professional, polite and helpful.
        2. Never use slang words like 'machan', 'bokka', or 'ban'.
        3. If asked in Sinhala, reply in formal Sinhala.
        4. If asked in English, reply in professional English.
        5. Keep answers concise and direct.
    `;

    const aiResponse = await fetchAIResponse(rawMsg, SYSTEM_PROMPT);

    // Default Reply (API Fail වුවහොත් පෙන්වීමට)
    const isEnglish = /^[A-Za-z0-9\s.,!?-]+$/.test(rawMsg);
    const defaultReply = isEnglish ? 
        "I apologize, but I am unable to provide a detailed response at the moment. Viruna is currently updating my system! 👊" : 
        "කණගාටුයි, මට මේ අවස්ථාවේදී පිළිතුරක් ලබා දීමට නොහැකියි. විරුණ මගේ පද්ධතිය යාවත්කාලීන කරමින් සිටිනවා විය හැකියි.. 👊";

    if (!aiResponse) {
        res.json({ reply: defaultReply, source: "fallback", creator: "Viruna" });
    } else {
        res.json({ reply: aiResponse, source: "ai", creator: "Viruna" });
    }
});

// Root Route
app.get('/', (req, res) => {
    res.send(`
        <body style="font-family:sans-serif; text-align:center; padding-top:50px; background:#f4f4f4;">
            <h1 style="color:#2c3e50;">🚀 VIRU AI SUPREME IS ONLINE</h1>
            <p style="color:#7f8c8d;">Developed by Viruna | Professional Version 2.0</p>
            <div style="margin-top:20px; color:green; font-weight:bold;">Status: Stable & Active</div>
        </body>
    `);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
