const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

/**
 * 📚 MANUAL TRAINING DICTIONARY
 * වෘත්තීය මට්ටමින් සකස් කළ පිළිතුරු එකතුව (No slang words)
 */
const manualResponses = {
    // --- Greetings ---
    "hi": "ආයුබෝවන්! මම VIRU AI. ඔබට අද මම කොහොමද උදව් කළ යුත්තේ? 👋",
    "hello": "ආයුබෝවන්! ඔබව සාදරයෙන් පිළිගන්නවා. 😎🚀",
    "hey": "කොහොමද? ඔබගේ ගැටලුව ඉදිරිපත් කරන්න, මම සහාය වන්නම්. 👊",
    "gm": "සුබ උදෑසනක්! ඔබගේ දවස සාර්ථක වේවා! ☀️☕",
    "gn": "සුබ රාත්‍රියක්! ඔබට සාමකාමී නින්දක් ප්‍රාර්ථනා කරනවා. 😴🌙",
    "කොහොමද": "මම ඉතා හොඳින් සිටිනවා. ඔබට කොහොමද? 😊",
    "සැපද": "මම ඉතා හොඳින් සිටිනවා. ඔබත් සතුටින් සිටිනවා යැයි මම විශ්වාස කරනවා. 😎",

    // --- About Creator ---
    "kauda umba": "මම VIRU AI. මාව නිර්මාණය කළේ විරුණ (Viruna) විසිනි. 😎⚡",
    "uba kage kawda": "මම විරුණ (Viruna) විසින් නිර්මාණය කරන ලද නිල AI සහායකයා වෙමි. 🤖💎",
    "viruna kauda": "විරුණ (Viruna) යනු දක්ෂ තරුණ මෘදුකාංග සංවර්ධකයෙකි. ඔහු මගේ නිර්මාණකරු වේ. 🚀🔥",
    "name": "මගේ නම VIRU AI. My name is VIRU AI. 😎",
    "වයස": "මම මෘදුකාංගයක් බැවින් මට නිශ්චිත වයසක් නොමැත. නමුත් මා නිර්මාණය වූයේ විරුණගේ පරිගණකය තුළයි. 💻",

    // --- Casual Transitions ---
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
 * 🎯 MAIN AI LOGIC WITH AUTO-BACKUP
 * මුලින්ම OpenAI try කර, එය අසාර්ථක වුවහොත් වෙනත් Models වෙත යොමු වේ.
 */
async function getAIResponse(msg, systemPrompt) {
    // 1. Primary Attempt (ඔබේ Original URL එක)
    try {
        const mainUrl = `https://text.pollinations.ai/${encodeURIComponent(msg)}?system=${encodeURIComponent(systemPrompt)}&model=openai&seed=42`;
        const response = await fetch(mainUrl);
        if (response.ok) {
            const aiText = await response.text();
            if (aiText && aiText.trim().length > 1) return aiText.trim();
        }
    } catch (e) {
        console.log("Primary API fail වුණා. Backup උත්සාහ කරනවා...");
    }

    // 2. Backup Attempts (ප්‍රධාන එක වැඩ නැති වුණොත් පමණක් මේවා ක්‍රියාත්මක වේ)
    const backupModels = ['mistral', 'llama', 'searchgpt'];
    for (let model of backupModels) {
        try {
            const backupUrl = `https://text.pollinations.ai/${encodeURIComponent(msg)}?system=${encodeURIComponent(systemPrompt)}&model=${model}`;
            const response = await fetch(backupUrl);
            if (response.ok) {
                const aiText = await response.text();
                if (aiText && aiText.trim().length > 1) return aiText.trim();
            }
        } catch (e) {
            continue; // ඊළඟ Model එකට මාරු වේ
        }
    }
    return null; 
}

app.get('/api/chat', async (req, res) => {
    let rawMsg = req.query.msg ? req.query.msg.trim() : "";
    let userMsg = rawMsg.toLowerCase();

    if (!userMsg) {
        return res.status(400).json({ error: "කරුණාකර පණිවිඩයක් ඇතුළත් කරන්න. 😅" });
    }

    // 🎯 1. Manual Match
    if (manualResponses[userMsg]) {
        return res.json({ reply: manualResponses[userMsg], source: "manual", creator: "Viruna" });
    }

    // 🎯 2. Keyword Match
    for (const key in manualResponses) {
        if (userMsg.includes(key)) {
            return res.json({ reply: manualResponses[key], source: "keyword", creator: "Viruna" });
        }
    }

    // 🎯 3. AI Logic (Updated System Prompt for Professional Tone)
    const SYSTEM_PROMPT = `
        Your name is VIRU AI, created by Viruna.
        Instructions:
        1. Reply professionally and politely. 
        2. Never use informal Sri Lankan slang like 'machan', 'ban', or 'bokka'.
        3. If the user asks in Sinhala, use formal Sinhala words.
        4. If you don't know the answer, reply ONLY with: SKIP_TO_VIRUNA
    `;

    const finalReply = await getAIResponse(rawMsg, SYSTEM_PROMPT);

    const isEnglish = /^[A-Za-z0-9\s.,!?-]+$/.test(rawMsg);
    const defaultReply = isEnglish ? 
        "I am sorry, but I haven't been programmed with this information yet. Viruna is currently working on it! 👊" : 
        "කණගාටුයි, මට මේ පිළිබඳව තොරතුරු ලබා දී නැහැ. විරුණ තවමත් මේ පද්ධතිය සංවර්ධනය කරමින් සිටිනවා.. 👊";

    // 🎯 4. Final Response Construction
    if (!finalReply || finalReply.toUpperCase().includes("SKIP_TO_VIRUNA") || finalReply.length < 2) {
        res.json({ reply: defaultReply, source: "default", creator: "Viruna" });
    } else {
        res.json({ reply: finalReply, source: "ai", creator: "Viruna" });
    }
});

// Root Page
app.get('/', (req, res) => {
    res.send("<h1 style='font-family:sans-serif; text-align:center; margin-top:50px;'>🚀 VIRU AI SUPREME IS ONLINE & STABLE</h1>");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
