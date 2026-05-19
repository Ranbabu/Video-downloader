export default async function handler(req, res) {
    // CORS परमिशन
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { url, vQuality, isAudioOnly } = req.body;
        
        // नए Cobalt API (v10) का बिल्कुल सही फॉर्मेट
        const reqBody = JSON.stringify({
            url: url,
            videoQuality: vQuality || "720",
            isAudioOnly: isAudioOnly
        });

        // ⚠️ Vercel को एकदम असली ब्राउज़र (Chrome) जैसा दिखाने का कोड
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Origin': 'https://cobalt.tools',
            'Referer': 'https://cobalt.tools/'
        };

        // दो अलग-अलग चालू सर्वर का बैकअप
        const apis = [
            "https://api.cobalt.tools/", // पहला (Official)
            "https://co.wuk.sh/"         // दूसरा (Community Backup)
        ];

        let lastResponse = null;

        // लूप: अगर पहला फेल हुआ, तो अपने-आप दूसरे सर्वर से डाउनलोड करेगा
        for (let api of apis) {
            try {
                const response = await fetch(api, { method: 'POST', headers, body: reqBody });
                const data = await response.json();
                
                // अगर सक्सेस हो गया, तो वेबसाइट को लिंक भेज देगा
                if (response.ok && data && data.url) {
                    return res.status(200).json(data);
                }
                lastResponse = data; // अगर एरर है तो सेव कर लेगा
            } catch(e) {
                lastResponse = { error: { message: "सर्वर कनेक्शन फेल" } };
            }
        }

        // अगर दोनों सर्वर फेल हो गए, तो असली एरर बताएगा
        return res.status(400).json(lastResponse);

    } catch (error) {
        return res.status(500).json({ error: { message: error.message } });
    }
}
