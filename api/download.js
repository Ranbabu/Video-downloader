export default async function handler(req, res) {
    // CORS पॉलिसी को बायपास करने का कोड (ताकि github.io से रिक्वेस्ट आ सके)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // हर वेबसाइट को परमिशन
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // प्री-फ्लाइट रिक्वेस्ट हैंडलिंग
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "सिर्फ POST रिक्वेस्ट अलाउड है।" });
    }

    try {
        const { url, vQuality, isAudioOnly } = req.body;

        // Vercel का सर्वर सीधा Cobalt API से बात करेगा (ब्राउज़र का कोई काम नहीं)
        const response = await fetch("https://api.cobalt.tools/api/json", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                vQuality: vQuality,
                isAudioOnly: isAudioOnly,
                aFormat: "mp3"
            })
        });

        const data = await response.json();
        
        // जो जवाब Cobalt से आया, वो आपकी वेबसाइट को वापस भेज देगा
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Server Error", details: error.message });
    }
}
