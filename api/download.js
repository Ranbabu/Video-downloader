export default async function handler(req, res) {
    // CORS परमिशन (ताकि आपकी वेबसाइट इससे बात कर सके)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { url, vQuality, isAudioOnly } = req.body;
        
        // Cobalt का नया डेटा फॉर्मेट
        const reqBody = JSON.stringify({
            url: url,
            videoQuality: vQuality || "720",
            isAudioOnly: isAudioOnly === true || isAudioOnly === "true"
        });

        // ⚠️ FIX: कोई नाटक नहीं, बिल्कुल सिंपल और असली Headers 
        // ताकि Cloudflare इसे Bot समझकर ब्लॉक न करे।
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        // 4 बेहतरीन और चालू सर्वर्स की लिस्ट
        const apis = [
            "https://co.wuk.sh/",
            "https://cobalt.cibere.dev/",
            "https://api.cobalt.tools/",
            "https://cobalt.timelessnesses.me/"
        ];

        let lastError = "सभी सर्वर इस समय बिज़ी हैं। कृपया 1 मिनट बाद कोशिश करें।";

        // लूप: एक सर्वर फेल होगा तो बिना एरर दिए तुरंत दूसरे पर जाएगा
        for (let api of apis) {
            try {
                const response = await fetch(api, { method: 'POST', headers, body: reqBody });
                
                // पहले रिस्पांस को टेक्स्ट में बदलेंगे ताकि Cloudflare के HTML ब्लॉक से क्रैश न हो
                const textData = await response.text(); 
                
                try {
                    const data = JSON.parse(textData);
                    
                    // अगर सफलता मिली और URL मिल गया!
                    if (response.ok && data && data.url) {
                        return res.status(200).json(data);
                    } else if (data && data.error) {
                        lastError = data.error.message || "API Error";
                    }
                } catch(parseErr) {
                    // अगर JSON की जगह कोई HTML पेज आया (यानी सर्वर ब्लॉक है), तो चुपचाप अगले सर्वर पर जाए
                    console.log(`${api} returned invalid JSON/HTML.`);
                }
            } catch(e) {
                // अगर नेटवर्क एरर है तो अगले सर्वर पर जाए
                console.log(`Failed to connect to ${api}`);
            }
        }

        // अगर चारों सर्वर फेल हो गए, तब जाकर असली एरर वेबसाइट को बताएगा
        return res.status(400).json({ error: { message: lastError } });

    } catch (error) {
        return res.status(500).json({ error: { message: error.message } });
    }
}
