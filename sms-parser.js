/**
 * AMS SMS Parser - bKash / Nagad / Rocket
 * এই ফাইলটি Android অ্যাপে (বা WebView) ব্যবহার করতে পারবেন।
 * SMS এলে parseSMS() কল করে Firebase-এ পাঠান।
 */

const SMS_PATTERNS = {
  BKASH: {
    senders: ['bKash', 'BKASH'],
    // উদাহরণ: "You have received Tk 500.00 from 017XXXXXXXX. Fee Tk 0.00. Balance Tk 1,234.56. TrxID BIKxxxx."
    regex: /(?:received|পেয়েছেন|গৃহীত).*?(?:Tk|টাকা|BDT)?\s*([\d,]+\.?\d*).*?(?:from|থেকে)\s*(01\d{9}).*?(?:TrxID|Transaction ID|ট্রান্সঅ্যাকশন)\s*([A-Z0-9]+)/i,
    amountIndex: 1,
    senderIndex: 2,
    trxIndex: 3
  },
  NAGAD: {
    senders: ['NAGAD', 'Nagad'],
    regex: /(?:received|পেয়েছেন).*?(?:Tk|টাকা)?\s*([\d,]+\.?\d*).*?(?:from|থেকে)\s*(01\d{9}).*?(?:TxnID|TrxID|Transaction)\s*([A-Z0-9]+)/i,
    amountIndex: 1,
    senderIndex: 2,
    trxIndex: 3
  },
  ROCKET: {
    senders: ['16216', 'ROCKET', 'Rocket'],
    regex: /(?:received|পেয়েছেন|Credit).*?(?:Tk|টাকা|BDT)?\s*([\d,]+\.?\d*).*?(?:from|থেকে)\s*(01\d{9}).*?(?:Txn|TrxID|ID)\s*([A-Z0-9]+)/i,
    amountIndex: 1,
    senderIndex: 2,
    trxIndex: 3
  }
};

/**
 * SMS পার্স করে স্ট্রাকচার্ড অবজেক্ট রিটার্ন করে
 * @param {string} body - SMS body
 * @param {string} address - SMS sender address
 * @returns {object|null}
 */
function parseSMS(body, address = '') {
  if (!body) return null;
  const text = body.replace(/\s+/g, ' ').trim();

  for (const [platform, cfg] of Object.entries(SMS_PATTERNS)) {
    const isFromSender = cfg.senders.some(s => 
      address.toLowerCase().includes(s.toLowerCase()) || 
      text.toLowerCase().includes(s.toLowerCase())
    );
    if (!isFromSender && !text.match(/received|পেয়েছেন|Credit/i)) continue;

    const match = text.match(cfg.regex);
    if (match) {
      const amount = parseFloat((match[cfg.amountIndex] || '0').replace(/,/g, ''));
      const sender = match[cfg.senderIndex] || '';
      const trxId = match[cfg.trxIndex] || '';

      if (amount > 0) {
        return {
          platform,
          amount,
          sender,
          trxId,
          raw: body,
          timestamp: Date.now(),
          status: 'success'
        };
      }
    }
  }

  // Fallback simple amount extract
  const amountMatch = text.match(/(?:Tk|টাকা|BDT)\s*([\d,]+\.?\d*)/i);
  const phoneMatch = text.match(/(01\d{9})/);
  if (amountMatch) {
    return {
      platform: detectPlatform(address, text),
      amount: parseFloat(amountMatch[1].replace(/,/g, '')),
      sender: phoneMatch ? phoneMatch[1] : '',
      trxId: '',
      raw: body,
      timestamp: Date.now(),
      status: 'success'
    };
  }
  return null;
}

function detectPlatform(address, text) {
  const a = (address + ' ' + text).toLowerCase();
  if (a.includes('bkash') || a.includes('বিকাশ')) return 'BKASH';
  if (a.includes('nagad') || a.includes('নগদ')) return 'NAGAD';
  if (a.includes('rocket') || a.includes('রকেট') || a.includes('16216')) return 'ROCKET';
  return 'UNKNOWN';
}

/**
 * Firebase-এ ট্রানজেকশন পাঠানোর উদাহরণ (Node বা Browser)
 * Android এ Retrofit / Volley / Firebase SDK ব্যবহার করুন
 */
async function sendToFirebase(tx, databaseURL, apiKey) {
  // Realtime Database REST API উদাহরণ
  const url = `${databaseURL}/transactions.json?auth=${apiKey || ''}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tx)
  });
  return res.json();
}

// Export for module use
if (typeof module !== 'undefined') {
  module.exports = { parseSMS, sendToFirebase, SMS_PATTERNS };
}
