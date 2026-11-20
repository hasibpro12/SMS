# AMS Auto Payment + SMS Reader Dashboard

বাংলাদেশের bKash, Nagad, Rocket পেমেন্ট SMS পড়ে অটোমেটিক ট্রানজেকশন রেকর্ড করার ড্যাশবোর্ড।

## ফাইলসমূহ

| ফাইল | কাজ |
|------|-----|
| `index.html` | সম্পূর্ণ ওয়েব ড্যাশবোর্ড (Firebase + Local Storage) |
| `sms-parser.js` | SMS পার্সিং লজিক (Android অ্যাপে ব্যবহার করুন) |
| `README.md` | এই গাইড |

## কিভাবে ব্যবহার করবেন

### ১. Firebase সেটআপ
1. [Firebase Console](https://console.firebase.google.com) এ নতুন প্রজেক্ট তৈরি করুন।
2. **Realtime Database** চালু করুন (Test mode বা Rules সেট করুন)।
3. Database URL কপি করুন (যেমন: `https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app`)。

### ২. ড্যাশবোর্ড চালু
- `index.html` ফাইল ব্রাউজারে খুলুন (অথবা যেকোনো হোস্টিং এ আপলোড করুন)।
- **সেটিংস** ট্যাবে Database URL দিন → **নতুন কী তৈরি করুন** → সেভ করুন।
- bKash / Nagad / Rocket নম্বর সেট করুন।

### ৩. SMS রিডার অ্যাপ
শুধুমাত্র HTML দিয়ে SMS পড়া যায় না। আপনাকে Android অ্যাপ লাগবে।

**অপশনসমূহ:**
- বিদ্যমান ওপেন সোর্স: [bKash-Nagad-Payment-Auto-Verification](https://github.com/Mr-SxR/bKash-Nagad-Payment-Auto-Verification)
- নিজে বানাতে চাইলে: Android Studio তে SMS BroadcastReceiver ব্যবহার করে `sms-parser.js` এর লজিক প্রয়োগ করুন এবং Firebase-এ POST করুন।

অ্যাপে যা দিতে হবে:
- Database URL
- API Key (ড্যাশবোর্ড থেকে জেনারেট করা)

### ৪. অটো পেমেন্ট
ড্যাশবোর্ডে টগল চালু করলে `config/autoEnabled = true` সেট হবে।  
অ্যাপ থেকে SMS পার্স করে `transactions` নোডে ডাটা পাঠালেই ড্যাশবোর্ডে রিয়েল-টাইম দেখা যাবে।

## Firebase Rules (উদাহরণ - সুরক্ষিত করুন)

```json
{
  "rules": {
    "config": {
      ".read": true,
      ".write": true
    },
    "transactions": {
      ".read": true,
      ".write": true
    },
    "devices": {
      ".read": true,
      ".write": true
    }
  }
}
```

**প্রোডাকশনে** API Key বা Auth দিয়ে সীমিত করুন।

## ডাটা স্ট্রাকচার

```
/config
  apiKey: "ams_xxxx"
  autoEnabled: true
  numbers: { bkash, nagad, rocket }

/transactions/{id}
  platform: "BKASH" | "NAGAD" | "ROCKET"
  sender: "017..."
  amount: 500
  trxId: "BIK..."
  timestamp: 1730...
  status: "success"
  raw: "original sms"

/devices/{deviceId}
  lastSeen: timestamp
  status: "online"
```

## সতর্কতা

- শুধুমাত্র নিজের ব্যবসায়িক/মার্চেন্ট নম্বরে ব্যবহার করুন।
- অফিসিয়াল bKash/Nagad Merchant API থাকলে সেটাই প্রাধান্য দিন।
- API কী ও Firebase Rules সুরক্ষিত রাখুন।
- এই কোড শিক্ষামূলক ও ব্যক্তিগত ব্যবহারের জন্য।

## সাপোর্ট

কোনো বাগ বা পরিবর্তন চাইলে বলুন।
