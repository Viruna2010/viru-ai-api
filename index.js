const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// 📚 MANUAL TRAINING DICTIONARY
const manualResponses = {
    // --- Greetings ---
    "hi": "ආයුබෝවන්! කොහොමද? 👋🔥 | Hello! How can I help you?",
    "hello": "ආයුබෝවන්! සුවදුක් කොහොමද? 😎🚀 | Hello there! How's it going?",
    "hey": "කොහොමද ඉතින්? ඔබව සාදරයෙන් පිළිගන්නවා! 👊",
    "gm": "සුබ උදෑසනක්! Good Morning! ☀️☕",
    "gn": "සුබ රාත්‍රියක්! Good Night! 😴🌙",
    "කොහොමද": "මම හොඳින් ඉන්නවා. ඔබට කොහොමද? 😊",
    "සැපද": "මම ඉතා හොඳින් ඉන්නවා. ඔබ සැපෙන් නේද? 😎",
    "මොකෝ වෙන්නේ": "විශේෂ දෙයක් නැහැ, ඔබේ වැඩ කටයුතු කොහොමද? 👊",
    "sup": "Not much, just here to help! ඔබ මොකද කරන්නේ? 😎",

    // --- About Me ---
    "kauda umba": "මම VIRU AI. විරුණ (Viruna) විසින් තමයි මාව නිර්මාණය කළේ. 😎⚡",
    "uba kage kawda": "මම විරුණ (Viruna) විසින් නිර්මාණය කළ AI සහායකයෙක්. 🤖💎",
    "viruna kauda": "විරුණ (Viruna) තමයි මගේ නිර්මාණකරු. ඔහු දක්ෂ මෘදුකාංග සංවර්ධකයෙක්! 🚀🔥",
    "name": "මගේ නම VIRU AI. My name is VIRU AI. 😎",
    "වයස": "මට නිශ්චිත වයසක් නැහැ, මම නිර්මාණය වුණේ විරුණගේ පරිගණකය තුළයි. 😂💻",
    "kage": "මම විරුණගේ නිල AI සහායකයා! 👊",

    // --- Casual Slang ---
    "අඩෝ": "ඔව්, ඔබට මොකක් හරි උදව්වක් අවශ්‍යද? මම සූදානම්. 😂👊",
    "එල": "ඉතා හොඳයි! ජයවේවා. 💎",
    "ela": "ඉතා හොඳයි! 🚀",
    "maru": "නියමයි! ඇත්තටම එය හොඳයි. 🔥",
    "track": "සමහර අවස්ථාවලදී මටත් ගැටලු මතු වෙනවා! 😂🌀",
    "pissu": "ඇත්තටම මෙය පුදුම සහගතයි නේද? 😂🌀",
    "නියමයි": "බොහොම ස්තුතියි! ඔබේ දිරිගැන්වීම වටිනවා. 👊🔥",
    "ade": "ඔව්, මොකක්ද වෙන්න ඕනේ? 😅",

    // --- Questions ---
    "mokada karanne": "මම ඔබත් සමඟ සංවාදයේ යෙදෙමින් සිටිනවා. ඔබට උදව් කිරීම තමයි මගේ කාර්යය. 😂🤖",
    "monada puluwan": "ඕනෑම දෙයක් අහන්න. මම දන්නා පරිදි පිළිතුරු දෙන්නම්. 🧠✨",
    "salli": "කණගාටුයි, මට මුදල් ගනුදෙනු කරන්න හැකියාවක් නැහැ. 😂💸",
    "love": "ආදරය ගැන මට එතරම් වැටහීමක් නැහැ, මම AI කෙනෙක් නිසා. 😂💔",

    // --- Farewell ---
    "bye": "නැවත හමුවෙමු! සුබ දවසක්! 👋✨",
    "thanks": "ඔබව සාදරයෙන් පිළිගන්නවා! ඕනෑම වේලාවක මම සහාය වන්නම්. 👊💎",
    "එලකිරි": "නියමයි! ඔබට ජයවේවා! 🚀"
};

app.get('/api/chat', async (req, res) => {
    let rawMsg = req.query.msg ? req.query.msg.trim() : "";
    let userMsg = rawMsg.toLowerCase();

    if (!userMsg) {
        return res.status(400).json({ error: "කරුණාකර පණිවිඩයක් ඇතුළත් කරන්න. 😅" });
    }

    // 🎯 1. Manual Exact Match
    if (manualResponses[userMsg]) {
        return res.json({ reply: manualResponses[userMsg], source: "manual", creator: "Viruna" });
    }

    // 🎯 2. Keyword Match
    for (const key in manualResponses) {
        if (userMsg.includes(key)) {
            return res.json({ reply: manualResponses[key], source: "keyword", creator: "Viruna" });
        }
    }

    // 🎯 3. AI Logic
    const SYSTEM_PROMPT = `
        Your name is VIRU AI, created by Viruna.
        Instructions:
        1. If the user asks in English, reply in English professionally.
        2. If the user asks in Sinhala, reply in a polite and helpful manner.
        3. Maintain a professional yet friendly persona.
        4. If you aren't sure of the language, prioritize clear Sinhala or English.
        5. If you don't know the answer, reply ONLY with: SKIP_TO_VIRUNA
    `;

    try {
        const url = `https://text.pollinations.ai/${encodeURIComponent(rawMsg)}?system=${encodeURIComponent(SYSTEM_PROMPT)}&model=openai&seed=42`;
        const response = await fetch(url);
        const aiText = await response.text();
        let finalReply = aiText.trim();

        const isEnglish = /^[A-Za-z0-9\s.,!?-]+$/.test(rawMsg);
        const myDefaultReply = isEnglish ? 
            "Viruna hasn't programmed me to answer this yet. I'm still learning! 😂😅👊" : 
            "විරුණ තාම මට මේ පිළිබඳව තොරතුරු ලබා දී නැහැ. මම තවමත් ඉගෙන ගනිමින් සිටිනවා.. 😂😅👊";

        if (
            finalReply.toUpperCase().includes("SKIP_TO_VIRUNA") || 
            finalReply.toLowerCase().includes("don't know") || 
            finalReply.length < 2
        ) {
            finalReply = myDefaultReply;
        }

        res.json({ reply: finalReply, source: "ai", creator: "Viruna" });

    } catch (error) {
        res.json({ reply: "සේවා දෝෂයකි. විරුණ තාම මට මේ ගැන උගන්වා නැත.. 😂😅👊", source: "error" });
    }
});

app.get('/', (req, res) => {
    res.send("<h1>VIRU AI SUPREME IS ONLINE! 🚀</h1>");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
