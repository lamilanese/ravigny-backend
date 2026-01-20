export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://lamilanese.github.io'); // allow your frontend
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // allowed methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // allowed headers

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, l_name, interest, countryCode, phone } = req.body;

    // Validate required fields
    if (!name || !l_name || !interest || !countryCode || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Basic sanitization
    const sanitize = (str) => String(str).substring(0, 200);

    const message = `🆕 Nouvelle réponse - Ravigny 2026

👤 Nom: ${sanitize(name)} ${sanitize(l_name)}
📊 Présence: ${sanitize(interest)}
📞 Téléphone: ${sanitize(countryCode)} ${sanitize(phone)}`;

    // Get credentials from environment variables
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('Missing environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      }
    );

    const result = await response.json();

    if (result.ok) {
      return res.status(200).json({ success: true });
    } else {
      console.error('Telegram API error:', result);
      return res.status(500).json({ error: 'Failed to send message' });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
