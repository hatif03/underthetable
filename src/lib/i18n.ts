import { useSyncExternalStore } from "react"

/**
 * English and Hindi for the core flow: navigation, the first screen, the report form, the receipt, and
 * the names of the kinds, outcomes and departments. District and service names stay in English, and the
 * sentence box understands English only. Both limits are said in the interface.
 */
export type Lang = "en" | "hi"

const en = {
  "nav.pulse": "Pulse",
  "nav.record": "Record",
  "nav.sealed": "How it is sealed",
  "nav.report": "Report",
  "nav.closed": "closed",
  "hero.eyebrow": "Citizen and press reports · India · sealed on Arkiv",
  "hero.title": "A district ledger nobody can delete.",
  "hero.lede": "What people are asked to pay, what is broken, what never arrived, and which freedoms were restricted. District and week only. No names. Once sealed, not even we can take a row down.",
  "hero.search": "Search a district or a service",
  "stat.sealed": "Sealed reports",
  "stat.districts": "Districts",
  "stat.wallets": "Citizen wallets",
  "stat.press": "From the press",
  "demo.hiding": "Hiding the team's synthetic demo rows",
  "demo.showing": "Showing the team's synthetic demo rows, labelled demo",
  "stat.quoted": "Quoted desks",
  "map.title": "Where it is coming from",
  "map.tap": "Tap a state",
  "feed.title": "Just sealed",
  "desks.title": "Quoted desks",
  "desks.sub": "Each figure is the median of one amount per wallet, shown once 3 wallets reported the same desk in the same week.",
  "press.title": "Reported in the press",
  "open.title": "Waiting for a third wallet",
  "chart.title": "Last 14 days",
  "expiry.title": "Entity Expiration",
  "card.reportDesk": "Report this desk",
  "card.wereYouThere": "Were you there? Report it",
  "form.title": "Report",
  "form.sub": "District and week only. No name, no office, no day.",
  "form.sentence": "Say it in a sentence, if you like (English only)",
  "form.sentenceNote": "Read on this device. Never sent, never stored.",
  "form.what": "What happened",
  "form.district": "District",
  "form.desk": "Desk",
  "form.whatShort": "What",
  "form.amount": "Amount asked, whole rupees",
  "form.severity": "How serious, 1 to 5",
  "form.outcome": "Outcome",
  "form.when": "When",
  "form.thisWeek": "This week",
  "form.lastWeek": "Last week",
  "form.earlier": "Earlier",
  "form.public": "This is everything that becomes public",
  "form.notStored": "Not stored: your sentence, your name, the day, any office or street. It leaves every query in 180 days. Nobody can edit or delete it, including you.",
  "form.loc": "Check my location",
  "form.locOn": "Your browser asks once. It rounds your position to about 5 km on your device and sends that to our checker, which compares it with the state on this report and forgets it. Only the state is written to Arkiv, by the checker's own wallet. A phone can fake a position, so this is a hint, not proof.",
  "form.locOff": "Off. The report is filed and counts as a wallet. It will not be marked location-checked.",
  "form.asThrowaway": "Reporting as a throwaway identity",
  "form.useWallet": "Use my wallet",
  "form.useThrowaway": "Use a throwaway",
  "form.newIdentity": "New identity",
  "form.file": "File the report",
  "form.locating": "Reading your location, once",
  "form.gas": "Getting a few cents of test gas",
  "form.sealing": "Sealing on Tiramisu",
  "form.checking": "Asking the checker to vouch",
  "form.footnote": "One transaction creates the report and hands it to an address nobody holds. Tiramisu testnet, test GLM only.",
  "receipt.sealed": "Sealed",
  "receipt.line": "Your report is on Tiramisu. It cannot be edited or deleted by us, or by you.",
  "receipt.delete": "Try to delete it",
  "receipt.another": "Report another",
  "receipt.back": "Back to the board",
  "kind.demand": "Demand",
  "kind.failure": "Failure",
  "kind.absence": "Absence",
  "kind.diversion": "Diversion",
  "kind.restriction": "Rights violation",
  "blurb.demand": "Money asked for a routine service",
  "blurb.failure": "A public thing is broken",
  "blurb.absence": "Something that should be there is missing",
  "blurb.diversion": "Something meant for the public did not arrive",
  "blurb.restriction": "An authority restricted or violated a right: a protest, the internet, a home, the press",
  "outcome.asked": "asked, not paid",
  "outcome.paid": "paid",
  "outcome.refused": "refused",
  "outcome.noted": "noted",
  "outcome.worsened": "worsened",
  "outcome.cleared": "cleared",
  "dept.police": "Police",
  "dept.rto": "RTO",
  "dept.revenue": "Revenue",
  "dept.passport": "Passport",
  "dept.municipal": "Municipal",
  "dept.gst": "GST",
  "dept.electricity": "Electricity",
  "dept.income_tax": "Income tax",
  "dept.fda": "FDA",
  "dept.ration": "Ration",
  "dept.health": "Health",
  "dept.school": "School",
  "dept.administration": "Administration",
  "nav.map": "Map",
  "map.heading": "Pinned problems",
  "pin.title": "Pin the exact place",
  "pin.use": "Use my current location",
  "pin.hint": "The pin is the place of the problem, not you. Drag it onto the problem. If you are reporting from outside your home, move it off your own street.",
  "pin.none": "No pin. Only the district is recorded.",
  "human.title": "Checking that you are a person",
  "human.ok": "Human check passed",
  "cat.title": "What can be documented",
  "cat.shutdown": "Internet shutdown",
  "cat.shutdownSub": "A district was cut off from the network by order",
}

const hi: typeof en = {
  "nav.pulse": "लाइव",
  "nav.record": "रिकॉर्ड",
  "nav.sealed": "सील कैसे होता है",
  "nav.report": "रिपोर्ट करें",
  "nav.closed": "बंद",
  "hero.eyebrow": "नागरिक और प्रेस रिपोर्ट · भारत · Arkiv पर सील",
  "hero.title": "ज़िले का ऐसा बहीखाता जिसे कोई मिटा नहीं सकता।",
  "hero.lede": "लोगों से क्या वसूला जा रहा है, क्या टूटा है, क्या नहीं पहुँचा, और किन आज़ादियों पर रोक लगी। सिर्फ़ ज़िला और सप्ताह। कोई नाम नहीं। एक बार सील होने पर हम भी इसे हटा नहीं सकते।",
  "hero.search": "ज़िला या सेवा खोजें",
  "stat.sealed": "सील रिपोर्टें",
  "stat.districts": "ज़िले",
  "stat.wallets": "नागरिक वॉलेट",
  "stat.press": "प्रेस से",
  "demo.hiding": "टीम की नक़ली डेमो पंक्तियाँ छिपी हैं",
  "demo.showing": "टीम की नक़ली डेमो पंक्तियाँ दिख रही हैं (डेमो लिखा है)",
  "stat.quoted": "आँकड़े वाले डेस्क",
  "map.title": "रिपोर्टें कहाँ से आ रही हैं",
  "map.tap": "राज्य छुएँ",
  "feed.title": "अभी सील हुई",
  "desks.title": "आँकड़े वाले डेस्क",
  "desks.sub": "हर आँकड़ा हर वॉलेट की एक रक़म का मध्यमान है, और तभी दिखता है जब एक ही सप्ताह में एक ही डेस्क के बारे में 3 वॉलेट ने रिपोर्ट किया हो।",
  "press.title": "प्रेस में रिपोर्ट",
  "open.title": "तीसरे वॉलेट का इंतज़ार",
  "chart.title": "पिछले 14 दिन",
  "expiry.title": "Entity Expiration (समय-सीमा)",
  "card.reportDesk": "इस डेस्क पर रिपोर्ट करें",
  "card.wereYouThere": "क्या आप वहाँ थे? रिपोर्ट करें",
  "form.title": "रिपोर्ट",
  "form.sub": "सिर्फ़ ज़िला और सप्ताह। कोई नाम नहीं, कोई दफ़्तर नहीं, कोई तारीख़ नहीं।",
  "form.sentence": "चाहें तो एक वाक्य में बताएँ (अभी सिर्फ़ अंग्रेज़ी)",
  "form.sentenceNote": "आपके फ़ोन पर ही पढ़ा जाता है। भेजा नहीं जाता, सहेजा नहीं जाता।",
  "form.what": "क्या हुआ",
  "form.district": "ज़िला",
  "form.desk": "डेस्क",
  "form.whatShort": "क्या",
  "form.amount": "माँगी गई रक़म, पूरे रुपये",
  "form.severity": "कितना गंभीर, 1 से 5",
  "form.outcome": "नतीजा",
  "form.when": "कब",
  "form.thisWeek": "इसी सप्ताह",
  "form.lastWeek": "पिछले सप्ताह",
  "form.earlier": "पहले",
  "form.public": "यह सब सार्वजनिक हो जाएगा",
  "form.notStored": "सहेजा नहीं जाता: आपका वाक्य, आपका नाम, तारीख़, कोई दफ़्तर या गली। यह 180 दिन में हट जाता है। इसे कोई बदल या मिटा नहीं सकता, आप भी नहीं।",
  "form.loc": "मेरी लोकेशन जाँचें",
  "form.locOn": "आपका ब्राउज़र एक बार अनुमति माँगता है। आपकी स्थिति फ़ोन पर ही लगभग 5 किमी तक गोल की जाती है और हमारे चेकर को भेजी जाती है, जो उसे इस रिपोर्ट के राज्य से मिलाकर भूल जाता है। Arkiv पर चेकर के अपने वॉलेट से सिर्फ़ राज्य लिखा जाता है। फ़ोन लोकेशन नक़ली कर सकता है, इसलिए यह सबूत नहीं, सिर्फ़ संकेत है।",
  "form.locOff": "बंद। रिपोर्ट दर्ज होगी और एक वॉलेट गिनी जाएगी, पर लोकेशन-जाँचित नहीं मानी जाएगी।",
  "form.asThrowaway": "अस्थायी पहचान से रिपोर्ट",
  "form.useWallet": "मेरा वॉलेट इस्तेमाल करें",
  "form.useThrowaway": "अस्थायी पहचान इस्तेमाल करें",
  "form.newIdentity": "नई पहचान",
  "form.file": "रिपोर्ट दर्ज करें",
  "form.locating": "लोकेशन पढ़ी जा रही है",
  "form.gas": "टेस्ट गैस ली जा रही है",
  "form.sealing": "Tiramisu पर सील हो रही है",
  "form.checking": "चेकर से पुष्टि हो रही है",
  "form.footnote": "एक ही लेन-देन रिपोर्ट बनाता है और उसे ऐसे पते को सौंप देता है जिसकी चाबी किसी के पास नहीं। Tiramisu टेस्टनेट, सिर्फ़ टेस्ट GLM।",
  "receipt.sealed": "सील हो गया",
  "receipt.line": "आपकी रिपोर्ट Tiramisu पर है। इसे न हम मिटा सकते हैं, न आप।",
  "receipt.delete": "मिटाने की कोशिश करें",
  "receipt.another": "एक और रिपोर्ट",
  "receipt.back": "बोर्ड पर लौटें",
  "kind.demand": "रिश्वत की माँग",
  "kind.failure": "विफलता",
  "kind.absence": "अनुपस्थिति",
  "kind.diversion": "रास्ता बदला",
  "kind.restriction": "अधिकार हनन",
  "blurb.demand": "किसी सामान्य सेवा के लिए पैसे माँगे गए",
  "blurb.failure": "कोई सार्वजनिक चीज़ टूटी है",
  "blurb.absence": "जो होना चाहिए था वह नहीं है",
  "blurb.diversion": "जनता के लिए जो था वह पहुँचा नहीं",
  "blurb.restriction": "किसी प्राधिकरण ने अधिकार पर रोक लगाई या उसका हनन किया: विरोध, इंटरनेट, घर, प्रेस",
  "outcome.asked": "माँगी, दी नहीं",
  "outcome.paid": "दी",
  "outcome.refused": "मना किया",
  "outcome.noted": "दर्ज",
  "outcome.worsened": "बिगड़ा",
  "outcome.cleared": "ठीक हुआ",
  "dept.police": "पुलिस",
  "dept.rto": "आरटीओ",
  "dept.revenue": "राजस्व",
  "dept.passport": "पासपोर्ट",
  "dept.municipal": "नगर निगम",
  "dept.gst": "जीएसटी",
  "dept.electricity": "बिजली",
  "dept.income_tax": "आयकर",
  "dept.fda": "खाद्य एवं औषधि",
  "dept.ration": "राशन",
  "dept.health": "स्वास्थ्य",
  "dept.school": "स्कूल",
  "dept.administration": "प्रशासन",
  "nav.map": "नक़्शा",
  "map.heading": "पिन की गई समस्याएँ",
  "pin.title": "सही जगह पिन करें",
  "pin.use": "मेरी मौजूदा लोकेशन इस्तेमाल करें",
  "pin.hint": "पिन समस्या की जगह है, आपकी नहीं। उसे समस्या पर खींचकर रखें। अगर आप अपने घर के पास से रिपोर्ट कर रहे हैं तो पिन अपनी गली से हटा दें।",
  "pin.none": "कोई पिन नहीं। सिर्फ़ ज़िला दर्ज होगा।",
  "human.title": "जाँच कि आप इंसान हैं",
  "human.ok": "इंसान की जाँच पूरी",
  "cat.title": "क्या दर्ज किया जा सकता है",
  "cat.shutdown": "इंटरनेट बंद",
  "cat.shutdownSub": "आदेश से किसी ज़िले का नेटवर्क काट दिया गया",
}

export type Key = keyof typeof en
const dicts: Record<Lang, typeof en> = { en, hi }

function saved(): Lang {
  try {
    const stored = localStorage.getItem("utt:lang")
    if (stored === "hi" || stored === "en") return stored
    return navigator.language?.toLowerCase().startsWith("hi") ? "hi" : "en"
  } catch {
    return "en"
  }
}

let lang: Lang = saved()
const listeners = new Set<() => void>()

export function getLang(): Lang {
  return lang
}

export function setLang(next: Lang) {
  lang = next
  try {
    localStorage.setItem("utt:lang", next)
  } catch {
    // the choice holds for this tab
  }
  document.documentElement.lang = next
  for (const listener of listeners) listener()
}

/** A string in the current language. Safe to call anywhere; a component re-renders on a change by calling useLang(). */
export function t(key: Key): string {
  return dicts[lang][key] ?? dicts.en[key]
}

export function useLang(): Lang {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => lang,
    () => "en",
  )
}

if (typeof document !== "undefined") document.documentElement.lang = lang
