export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "सिर्फ POST रिक्वेस्ट अलाउड है।" });
    }

    try {
        const { url, vQuality, isAudioOnly } = req.body;

        // ⚠️ FIX: नए Cobalt API नियमों के अनुसार रिक्वेस्ट बॉडी को अपडेट किया गया है
        const requestBody = {
            url: url,
            downloadMode: isAudioOnly ? "audio" : "video", // v7 के 'isAudioOnly' को नए फॉर्मेट में बदला
            videoQuality: vQuality || "720",
            audioFormat: "mp3"
        };

        // चालू Cobalt API सर्वर का इस्तेमाल
        const response = await fetch("https://api.cobalt.tools/", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Server Error", details: error.message });
    }
}
