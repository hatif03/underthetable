import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);

// data/vocab.json
var vocab_default = {
  departments: [
    {
      slug: "police",
      label: "Police"
    },
    {
      slug: "rto",
      label: "RTO / transport"
    },
    {
      slug: "revenue",
      label: "Revenue and land records"
    },
    {
      slug: "passport",
      label: "Passport"
    },
    {
      slug: "municipal",
      label: "Municipal corporation"
    },
    {
      slug: "gst",
      label: "GST"
    },
    {
      slug: "electricity",
      label: "Electricity board"
    },
    {
      slug: "income_tax",
      label: "Income tax"
    },
    {
      slug: "fda",
      label: "Food and drug administration"
    },
    {
      slug: "ration",
      label: "Ration shop"
    },
    {
      slug: "health",
      label: "Health"
    },
    {
      slug: "school",
      label: "School"
    }
  ],
  kinds: [
    {
      slug: "demand",
      label: "A demand for money"
    },
    {
      slug: "failure",
      label: "A public thing is broken"
    },
    {
      slug: "absence",
      label: "Something that should be there is missing"
    },
    {
      slug: "diversion",
      label: "Something meant for the public did not arrive"
    },
    {
      slug: "restriction",
      label: "A public freedom was restricted"
    }
  ],
  roles: {
    police: [
      "station_house_officer",
      "constable",
      "traffic_constable"
    ],
    rto: [
      "motor_vehicle_inspector",
      "clerk"
    ],
    revenue: [
      "tehsildar",
      "patwari",
      "clerk",
      "revenue_inspector"
    ],
    passport: [
      "verification_officer",
      "clerk"
    ],
    municipal: [
      "junior_engineer",
      "clerk"
    ],
    gst: [
      "inspector",
      "clerk"
    ],
    electricity: [
      "lineman",
      "clerk"
    ],
    income_tax: [
      "assessing_officer",
      "clerk"
    ],
    fda: [
      "inspector",
      "clerk"
    ],
    ration: [
      "public"
    ],
    health: [
      "public"
    ],
    school: [
      "public"
    ]
  },
  services: {
    police: [
      "fir_registration",
      "noc",
      "traffic_stop"
    ],
    rto: [
      "driving_licence",
      "vehicle_registration",
      "fitness_certificate"
    ],
    revenue: [
      "mutation",
      "caste_certificate",
      "income_certificate",
      "land_conversion"
    ],
    passport: [
      "fresh_passport",
      "police_verification"
    ],
    municipal: [
      "birth_certificate",
      "trade_licence",
      "building_plan"
    ],
    gst: [
      "registration",
      "refund"
    ],
    electricity: [
      "new_connection",
      "name_transfer"
    ],
    income_tax: [
      "refund",
      "pan"
    ],
    fda: [
      "licence"
    ]
  },
  conditions: {
    failure: {
      municipal: [
        "pothole",
        "streetlight",
        "open_drain",
        "garbage_pile",
        "broken_road",
        "water_supply"
      ],
      electricity: [
        "power_cut"
      ]
    },
    absence: {
      municipal: [
        "counter_closed"
      ],
      health: [
        "doctor_absent",
        "medicine_missing"
      ],
      school: [
        "teacher_absent",
        "meal_missing"
      ],
      ration: [
        "shop_closed"
      ]
    },
    diversion: {
      ration: [
        "grain_short",
        "fuel_short"
      ],
      school: [
        "meal_short"
      ],
      municipal: [
        "material_missing"
      ],
      health: [
        "medicine_short"
      ]
    },
    restriction: {
      police: [
        "assembly_permission_denied",
        "gathering_ban_order",
        "barricades_or_closures",
        "force_at_gathering",
        "detention_without_notice",
        "fir_not_registered"
      ]
    }
  },
  outcomes: [
    {
      slug: "asked",
      label: "Asked, not paid"
    },
    {
      slug: "paid",
      label: "Paid"
    },
    {
      slug: "refused",
      label: "Refused"
    },
    {
      slug: "noted",
      label: "Noted"
    },
    {
      slug: "worsened",
      label: "Worsened"
    },
    {
      slug: "cleared",
      label: "Cleared"
    }
  ]
};

// data/districts.json
var districts_default = {
  states: [
    {
      slug: "an",
      label: "Andaman and Nicobar Islands",
      districts: [
        "nicobar",
        "north_and_middle_andaman",
        "south_andaman"
      ]
    },
    {
      slug: "ap",
      label: "Andhra Pradesh",
      districts: [
        "anantapur",
        "chittoor",
        "east_godavari",
        "guntur",
        "krishna",
        "kurnool",
        "nellore",
        "prakasam",
        "srikakulam",
        "visakhapatnam",
        "vizianagaram",
        "west_godavari",
        "ysr_kadapa"
      ]
    },
    {
      slug: "ar",
      label: "Arunachal Pradesh",
      districts: [
        "changlang",
        "east_siang",
        "lohit",
        "papum_pare",
        "tawang",
        "west_kameng"
      ]
    },
    {
      slug: "as",
      label: "Assam",
      districts: [
        "barpeta",
        "cachar",
        "dibrugarh",
        "goalpara",
        "golaghat",
        "jorhat",
        "kamrup",
        "karbi_anglong",
        "nagaon",
        "sivasagar",
        "sonitpur",
        "tinsukia"
      ]
    },
    {
      slug: "br",
      label: "Bihar",
      districts: [
        "bhagalpur",
        "darbhanga",
        "gaya",
        "muzaffarpur",
        "nalanda",
        "patna",
        "purnia",
        "saharsa",
        "samastipur",
        "saran",
        "vaishali"
      ]
    },
    {
      slug: "ch",
      label: "Chandigarh",
      districts: [
        "chandigarh"
      ]
    },
    {
      slug: "ct",
      label: "Chhattisgarh",
      districts: [
        "bastar",
        "bilaspur",
        "durg",
        "korba",
        "raigarh",
        "raipur",
        "rajnandgaon",
        "surajpur"
      ]
    },
    {
      slug: "dn",
      label: "Dadra and Nagar Haveli and Daman and Diu",
      districts: [
        "dadra_and_nagar_haveli",
        "daman",
        "diu"
      ]
    },
    {
      slug: "dl",
      label: "Delhi",
      districts: [
        "central_delhi",
        "east_delhi",
        "new_delhi",
        "north_delhi",
        "north_east_delhi",
        "north_west_delhi",
        "shahdara",
        "south_delhi",
        "south_east_delhi",
        "south_west_delhi",
        "west_delhi"
      ]
    },
    {
      slug: "ga",
      label: "Goa",
      districts: [
        "north_goa",
        "south_goa"
      ]
    },
    {
      slug: "gj",
      label: "Gujarat",
      districts: [
        "ahmedabad",
        "amreli",
        "anand",
        "banaskantha",
        "bharuch",
        "bhavnagar",
        "gandhinagar",
        "jamnagar",
        "junagadh",
        "kheda",
        "kutch",
        "mehsana",
        "rajkot",
        "surat",
        "vadodara"
      ]
    },
    {
      slug: "hr",
      label: "Haryana",
      districts: [
        "ambala",
        "bhiwani",
        "faridabad",
        "gurugram",
        "hisar",
        "karnal",
        "kurukshetra",
        "nuh",
        "panipat",
        "rohtak",
        "sirsa",
        "sonipat"
      ]
    },
    {
      slug: "hp",
      label: "Himachal Pradesh",
      districts: [
        "bilaspur",
        "chamba",
        "hamirpur",
        "kangra",
        "kinnaur",
        "kullu",
        "mandi",
        "shimla",
        "sirmaur",
        "solan",
        "una"
      ]
    },
    {
      slug: "jk",
      label: "Jammu and Kashmir",
      districts: [
        "anantnag",
        "baramulla",
        "budgam",
        "jammu",
        "kathua",
        "pulwama",
        "rajouri",
        "samba",
        "srinagar",
        "udhampur"
      ]
    },
    {
      slug: "jh",
      label: "Jharkhand",
      districts: [
        "bokaro",
        "dhanbad",
        "east_singhbhum",
        "giridih",
        "hazaribagh",
        "palamu",
        "ranchi",
        "west_singhbhum"
      ]
    },
    {
      slug: "ka",
      label: "Karnataka",
      districts: [
        "ballari",
        "belagavi",
        "bengaluru_urban",
        "bidar",
        "chikkamagaluru",
        "dakshina_kannada",
        "dharwad",
        "kalaburagi",
        "mysuru",
        "raichur",
        "shivamogga",
        "tumakuru",
        "udupi",
        "vijayapura"
      ]
    },
    {
      slug: "kl",
      label: "Kerala",
      districts: [
        "alappuzha",
        "ernakulam",
        "idukki",
        "kannur",
        "kollam",
        "kottayam",
        "kozhikode",
        "malappuram",
        "palakkad",
        "thiruvananthapuram",
        "thrissur",
        "wayanad"
      ]
    },
    {
      slug: "la",
      label: "Ladakh",
      districts: [
        "kargil",
        "leh"
      ]
    },
    {
      slug: "ld",
      label: "Lakshadweep",
      districts: [
        "lakshadweep"
      ]
    },
    {
      slug: "mp",
      label: "Madhya Pradesh",
      districts: [
        "bhopal",
        "gwalior",
        "indore",
        "jabalpur",
        "ratlam",
        "rewa",
        "sagar",
        "satna",
        "ujjain"
      ]
    },
    {
      slug: "mh",
      label: "Maharashtra",
      districts: [
        "ahmednagar",
        "akola",
        "amravati",
        "aurangabad",
        "beed",
        "bhandara",
        "buldhana",
        "chandrapur",
        "dhule",
        "gadchiroli",
        "gondia",
        "hingoli",
        "jalgaon",
        "jalna",
        "kolhapur",
        "latur",
        "mumbai",
        "mumbai_suburban",
        "nagpur",
        "nanded",
        "nandurbar",
        "nashik",
        "osmanabad",
        "palghar",
        "parbhani",
        "pune",
        "raigad",
        "ratnagiri",
        "sangli",
        "satara",
        "sindhudurg",
        "solapur",
        "thane",
        "wardha",
        "washim",
        "yavatmal"
      ]
    },
    {
      slug: "mn",
      label: "Manipur",
      districts: [
        "bishnupur",
        "churachandpur",
        "imphal_east",
        "imphal_west",
        "jiribam",
        "kakching",
        "thoubal",
        "ukhrul"
      ]
    },
    {
      slug: "ml",
      label: "Meghalaya",
      districts: [
        "east_khasi_hills",
        "west_garo_hills",
        "west_jaintia_hills",
        "west_khasi_hills"
      ]
    },
    {
      slug: "mz",
      label: "Mizoram",
      districts: [
        "aizawl",
        "lunglei",
        "mamit",
        "saiha"
      ]
    },
    {
      slug: "nl",
      label: "Nagaland",
      districts: [
        "dimapur",
        "kohima",
        "mokokchung",
        "mon",
        "tuensang",
        "wokha"
      ]
    },
    {
      slug: "or",
      label: "Odisha",
      districts: [
        "balangir",
        "balasore",
        "cuttack",
        "ganjam",
        "khordha",
        "koraput",
        "puri",
        "sambalpur",
        "sundargarh"
      ]
    },
    {
      slug: "py",
      label: "Puducherry",
      districts: [
        "karaikal",
        "mahe",
        "puducherry",
        "yanam"
      ]
    },
    {
      slug: "pb",
      label: "Punjab",
      districts: [
        "amritsar",
        "barnala",
        "bathinda",
        "jalandhar",
        "ludhiana",
        "patiala",
        "sas_nagar"
      ]
    },
    {
      slug: "rj",
      label: "Rajasthan",
      districts: [
        "ajmer",
        "alwar",
        "bikaner",
        "jaipur",
        "jodhpur",
        "kota",
        "udaipur"
      ]
    },
    {
      slug: "sk",
      label: "Sikkim",
      districts: [
        "east_sikkim",
        "north_sikkim",
        "south_sikkim",
        "west_sikkim"
      ]
    },
    {
      slug: "tn",
      label: "Tamil Nadu",
      districts: [
        "chennai",
        "coimbatore",
        "cuddalore",
        "dharmapuri",
        "erode",
        "kanchipuram",
        "madurai",
        "salem",
        "thanjavur",
        "thoothukudi",
        "tiruchirappalli",
        "tirunelveli",
        "vellore"
      ]
    },
    {
      slug: "tg",
      label: "Telangana",
      districts: [
        "adilabad",
        "hyderabad",
        "karimnagar",
        "khammam",
        "mahbbubnagar",
        "medchal_malkajgiri",
        "nalgonda",
        "nizamabad",
        "rangareddy",
        "warangal"
      ]
    },
    {
      slug: "tr",
      label: "Tripura",
      districts: [
        "dhalai",
        "gomati",
        "khowai",
        "north_tripura",
        "sepahijala",
        "south_tripura",
        "unakoti",
        "west_tripura"
      ]
    },
    {
      slug: "up",
      label: "Uttar Pradesh",
      districts: [
        "agra",
        "aligarh",
        "allahabad",
        "balrampur",
        "bareilly",
        "bijnor",
        "fatehpur",
        "gautam_buddh_nagar",
        "ghaziabad",
        "gorakhpur",
        "hardoi",
        "jhansi",
        "kannauj",
        "kanpur_nagar",
        "lucknow",
        "meerut",
        "moradabad",
        "rampur",
        "sitapur",
        "varanasi"
      ]
    },
    {
      slug: "uk",
      label: "Uttarakhand",
      districts: [
        "almora",
        "dehradun",
        "haridwar",
        "nainital",
        "pauri_garhwal",
        "tehri_garhwal",
        "udham_singh_nagar"
      ]
    },
    {
      slug: "wb",
      label: "West Bengal",
      districts: [
        "bankura",
        "birbhum",
        "darjeeling",
        "hooghly",
        "howrah",
        "jalpaiguri",
        "kolkata",
        "malda",
        "murshidabad",
        "nadia",
        "north_24_parganas",
        "paschim_bardhaman",
        "paschim_medinipur",
        "purba_bardhaman",
        "purba_medinipur",
        "south_24_parganas"
      ]
    }
  ]
};

// src/lib/week.ts
var DAY_MS = 864e5;
function kolkataDay(now = /* @__PURE__ */ new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(now);
}
function addDays(day, days) {
  const [year, month, date] = day.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, date));
  utc.setUTCDate(utc.getUTCDate() + days);
  const y = utc.getUTCFullYear();
  const m = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const d = String(utc.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function isoWeek(day) {
  const [year, month, date] = day.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, date));
  const weekday = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - weekday);
  const weekYear = utc.getUTCFullYear();
  const yearStart = new Date(Date.UTC(weekYear, 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / DAY_MS + 1) / 7);
  return `${weekYear}-W${String(week).padStart(2, "0")}`;
}
function incidentWindow(day, today) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return "Pick a date.";
  if (day > today) return "The incident date cannot be in the future.";
  if (day < addDays(today, -180)) return "The incident date cannot be more than 180 days ago.";
  return null;
}

// src/lib/guard.ts
var PAYLOAD_TEXT = '{"v":1}';
var PAYLOAD_BYTES = new TextEncoder().encode(PAYLOAD_TEXT);
var KINDS = ["demand", "failure", "absence", "diversion", "restriction"];
var roles = vocab_default.roles;
var services = vocab_default.services;
var conditions = vocab_default.conditions;
var DEMAND_OUTCOMES = ["asked", "paid", "refused"];
var CONDITION_OUTCOMES = ["noted", "worsened", "cleared"];
function privateTextProblem(raw) {
  const value = normalizeForScan(raw);
  if (value.includes("@") || value.includes("+91")) return "Leave out phone numbers and email addresses.";
  if (/(?:\d[\s\-.()/]{0,2}){10,}/.test(value)) return "Leave out long numbers such as phone numbers.";
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value)) return "Leave out email addresses.";
  return null;
}
var TITLES = "Mr|Mrs|Ms|Shri|Sri|Smt|Dr|Prof|SI|ASI|DSP|ACP|DCP|SP|IPS|Inspector|Sub-Inspector|Constable|Officer|Sir|Madam|mr|mrs|ms|shri|sri|smt|dr|inspector|constable|officer|sir|madam";
var NAME = "[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?";
var PRIVATE_PATTERNS = [
  { re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, note: "an email address" },
  { re: /\b\d{4}[\s-]\d{4}[\s-]\d{4}\b/g, note: "an Aadhaar number" },
  { re: /(?:\+91[\s-]?)?\b[6-9]\d{4}[\s-]?\d{5}\b/g, note: "a phone number" },
  { re: /(?:\d[\s\-.()/]{0,2}){10,}/g, note: "a long number" },
  { re: /\b[\w.-]{2,}\s*@\s*[a-z]{2,}\b/gi, note: "an email or UPI handle" },
  { re: /\b[\w.-]{2,}\s*[([]?\s*at\s*[)\]]?\s*[\w-]{2,}\s*[([]?\s*dot\s*[)\]]?\s*[a-z]{2,}\b/gi, note: "an email written out in words" },
  { re: /\b[A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{1,3}[\s-]?\d{4}\b/g, note: "a vehicle number" },
  { re: /\b(?:fir|f\.i\.r\.?|case|crime)\s*(?:no\.?|number)?\s*#?\s*\d+(?:\/\d+)?\b/gi, note: "a case number" },
  { re: /\b(?:pin(?:code)?|zip)\s*:?\s*\d{6}\b/gi, note: "a PIN code" },
  { re: new RegExp(`\\b(?:${TITLES})\\.?\\s+${NAME}`, "g"), note: "a name" },
  { re: new RegExp(`\\b(?:[Mm]y name is|I am|named)\\s+${NAME}`, "g"), note: "a name" },
  { re: /(?:श्रीमान|श्रीमती|सुश्री|श्री|डॉ\.?)\s+[\p{L}\p{M}]+(?:\s+[\p{L}\p{M}]+)?/gu, note: "a name" },
  { re: /\b(?:room|ward|office|thana|shop|house|flat|plot)\s*(?:no\.?|number)?\s*#?\s*\d{1,6}\b/gi, note: "an office or house number" }
];
function normalizeForScan(value) {
  const ascii = value.replace(/[\u0660-\u0669\u06F0-\u06F9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\uFF10-\uFF19]/g, (ch) => {
    const cp = ch.charCodeAt(0);
    const arabicOrFullWidth = cp <= 1785 || cp >= 65296;
    return String(arabicOrFullWidth ? cp & 15 : (cp & 15) - 6);
  });
  return ascii.replace(/\b\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}\b/g, (m) => "_".repeat(m.length)).replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, (m) => "_".repeat(m.length));
}
function findPrivate(input) {
  const value = normalizeForScan(input);
  const hits = [];
  for (const { re, note } of PRIVATE_PATTERNS) {
    for (const match of value.matchAll(new RegExp(re.source, re.flags))) {
      const start = match.index ?? 0;
      const end = start + match[0].length;
      if (!hits.some((hit) => start < hit.end && end > hit.start)) hits.push({ start, end, note });
    }
  }
  return hits.sort((a, b) => a.start - b.start);
}
function redactText(value) {
  const hits = findPrivate(value);
  let text = value;
  for (const hit of [...hits].reverse()) text = text.slice(0, hit.start) + " " + text.slice(hit.end);
  text = text.replace(/\s{2,}/g, " ").trim();
  return { text, removed: [...new Set(hits.map((hit) => hit.note))] };
}
function assertPayload(bytes) {
  const text = new TextDecoder().decode(bytes);
  if (text !== PAYLOAD_TEXT) {
    throw new Error('The payload must be exactly {"v":1}.');
  }
}
function sealReport(input) {
  const today = input.today ?? kolkataDay();
  const fields = [
    input.state,
    input.district,
    input.department,
    input.role,
    input.service,
    input.outcome,
    input.day
  ];
  for (const field of fields) {
    const problem = privateTextProblem(field);
    if (problem) throw new Error(problem);
  }
  const state = districts_default.states.find((item) => item.slug === input.state);
  if (!state) throw new Error("Pick a state from the list.");
  if (!state.districts.includes(input.district)) throw new Error("Pick a district from the list.");
  if (!vocab_default.departments.some((item) => item.slug === input.department)) {
    throw new Error("Pick a department from the list.");
  }
  const kind = input.kind ?? "demand";
  if (!KINDS.includes(kind)) throw new Error("Pick what kind of report this is.");
  if (kind === "demand") {
    if (!roles[input.department]?.includes(input.role)) throw new Error("Pick a role from the list.");
    if (!services[input.department]?.includes(input.service)) throw new Error("Pick a service from the list.");
    if (!DEMAND_OUTCOMES.includes(input.outcome)) throw new Error("Pick an outcome from the list.");
    if (!Number.isInteger(input.amountInr) || input.amountInr < 1 || input.amountInr > 1e7) {
      throw new Error("Enter a whole amount from 1 to 10000000 rupees.");
    }
  } else {
    if (input.role !== "public") throw new Error("This report uses the public role. It does not name a person.");
    if (!conditions[kind]?.[input.department]?.includes(input.service)) {
      throw new Error("Pick a service from the list.");
    }
    if (!CONDITION_OUTCOMES.includes(input.outcome)) throw new Error("Pick an outcome from the list.");
    if (!Number.isInteger(input.amountInr) || input.amountInr < 1 || input.amountInr > 5) {
      throw new Error("Enter a severity from 1 to 5.");
    }
  }
  const dateError = incidentWindow(input.day, today);
  if (dateError) throw new Error(dateError);
  if (input.source !== void 0 && input.source !== "press") throw new Error("The source must be press, or left out.");
  assertPayload(PAYLOAD_BYTES);
  return {
    ...input,
    project: "underthetable",
    type: "report",
    kind,
    week: isoWeek(input.day),
    amount_inr: BigInt(input.amountInr)
  };
}

// server/assist.ts
var IFM_MODEL = "IFM/K2-Horizon-375B-A23B";
function ifmUrl() {
  const base = (process.env.IFM_BASE_URL || "https://api.ifm.ai/v1").replace(/\/$/, "");
  return `${base}/chat/completions`;
}
function jsonObjects(content) {
  const marker = "</ifm|think>";
  const after = content.includes(marker) ? content.slice(content.lastIndexOf(marker) + marker.length) : content;
  const found = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escape = false;
  for (let index = 0; index < after.length; index += 1) {
    const char = after[index];
    if (inString) {
      if (escape) escape = false;
      else if (char === "\\") escape = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === "{") {
      if (depth === 0) start = index;
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        try {
          found.push(JSON.parse(after.slice(start, index + 1)));
        } catch {
        }
        start = -1;
      }
    }
  }
  return found;
}
function readJsonObject(content) {
  const objects = jsonObjects(content);
  const slip = [...objects].reverse().find((item) => item.state || item.district || item.amountInr || item.department);
  if (!slip) throw new Error("That didn't match the lists. Pick the fields yourself.");
  return slip;
}
function asSlug(value) {
  return value.trim().toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}
function closestSlug(value, allowed) {
  const slug = asSlug(value);
  if (!slug) return "";
  if (allowed.includes(slug)) return slug;
  const hits = allowed.filter((item) => item.includes(slug) || slug.includes(item));
  return hits.length === 1 ? hits[0] : slug;
}
function matchState(value) {
  const slug = asSlug(value);
  const exact = districts_default.states.find((item) => item.slug === slug || asSlug(item.label) === slug);
  if (exact) return exact.slug;
  return closestSlug(value, districts_default.states.map((item) => item.slug));
}
async function suggestSlip(text, apiKey) {
  const cleaned = redactText(text);
  text = cleaned.text;
  const problem = privateTextProblem(text);
  if (problem) throw new Error(problem);
  const trimmed = text.trim();
  if (trimmed.length < 8) throw new Error("Say a little more about the place, the desk, and the amount.");
  if (trimmed.length > 500) throw new Error("Keep it to a few sentences. Names and phone numbers are not needed.");
  const today = kolkataDay();
  let parsed = null;
  for (let attempt = 0; attempt < 2 && !parsed; attempt += 1) {
    const response = await fetch(ifmUrl(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.IFM_MODEL || IFM_MODEL,
        temperature: 0,
        max_tokens: 900,
        response_format: { type: "json_object" },
        chat_template_kwargs: { reasoning_effort: "low" },
        messages: [
          {
            role: "system",
            content: `Reply with one JSON object and no explanation. Use only slugs from the lists. Do not repeat any name, phone number, or office. Today in Asia/Kolkata is ${today}. If no date is given, use that day. kind is demand, failure, absence, or diversion. A demand uses outcome asked, paid, or refused, and amountInr is rupees. The other kinds use role public, outcome noted, worsened, or cleared, and amountInr is a severity from 1 to 5. Keys: kind, state, district, department, role, service, outcome, amountInr, day.`
          },
          {
            role: "user",
            content: `${JSON.stringify({ states: districts_default.states, departments: vocab_default.departments, roles: vocab_default.roles, services: vocab_default.services, conditions: vocab_default.conditions, outcomes: vocab_default.outcomes })}

${trimmed}`
          }
        ]
      }),
      signal: AbortSignal.timeout(4e4)
    });
    if (!response.ok) throw new Error("The form assistant is not answering right now. You can fill the slip yourself.");
    const body = await response.json();
    const message = body.choices?.[0]?.message;
    const content = `${message?.content ?? ""}
${message?.reasoning ?? ""}`;
    try {
      parsed = readJsonObject(content);
    } catch {
      parsed = null;
    }
  }
  if (!parsed) throw new Error("That didn't match the lists. Pick the fields yourself.");
  const departments = vocab_default.departments.map((item) => item.slug);
  const department = closestSlug(String(parsed.department ?? ""), departments);
  const kind = closestSlug(String(parsed.kind ?? "demand"), ["demand", "failure", "absence", "diversion"]);
  const serviceList = kind === "demand" ? vocab_default.services[department] ?? [] : vocab_default.conditions[kind]?.[department] ?? [];
  const roleList = kind === "demand" ? vocab_default.roles[department] ?? [] : ["public"];
  const outcomeList = kind === "demand" ? ["asked", "paid", "refused"] : ["noted", "worsened", "cleared"];
  const stateSlug = matchState(String(parsed.state ?? ""));
  const state = districts_default.states.find((item) => item.slug === stateSlug);
  return sealReport({
    state: stateSlug,
    district: closestSlug(String(parsed.district ?? ""), state?.districts ?? []),
    department,
    role: closestSlug(String(parsed.role ?? ""), roleList),
    service: closestSlug(String(parsed.service ?? ""), serviceList),
    outcome: closestSlug(String(parsed.outcome ?? ""), outcomeList),
    amountInr: Number(parsed.amountInr),
    day: String(parsed.day ?? today),
    today,
    kind
  });
}

// server/handlers/assist.ts
async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Send a description with POST." });
    return;
  }
  const apiKey = process.env.IFM_API_KEY ?? "";
  if (!apiKey) {
    res.status(503).json({ error: "The form assistant is not configured. Fill the slip yourself." });
    return;
  }
  try {
    const suggestion = await suggestSlip(String(req.body?.text ?? ""), apiKey);
    res.status(200).json({ suggestion });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Could not fill the slip." });
  }
}
export {
  handler as default
};
