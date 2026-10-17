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
    },
    {
      slug: "administration",
      label: "District or state administration"
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
      label: "A right was restricted or violated"
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
    ],
    administration: [
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
        "fir_not_registered",
        "custodial_violence",
        "journalist_detained_or_attacked"
      ],
      administration: [
        "internet_shutdown",
        "content_blocked",
        "demolition_without_notice",
        "forced_eviction"
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
  ],
  geoServices: {
    municipal: [
      "pothole",
      "streetlight",
      "open_drain",
      "garbage_pile",
      "broken_road"
    ]
  }
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
        "hojai",
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
        "vaishali",
        "west_champaran"
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
        "fatehabad",
        "gurugram",
        "hisar",
        "karnal",
        "kurukshetra",
        "nuh",
        "palwal",
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
        "mandsaur",
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
        "chhatrapati_sambhajinagar",
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
        "didwana_kuchaman",
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
        "suryapet",
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
        "ayodhya",
        "balrampur",
        "bareilly",
        "bijnor",
        "fatehpur",
        "gautam_buddh_nagar",
        "ghaziabad",
        "gorakhpur",
        "hapur",
        "hardoi",
        "jhansi",
        "kannauj",
        "kanpur_nagar",
        "lakhimpur_kheri",
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

// src/lib/indiaDots.ts
var DOT_GEO = { "x0": 68, "y1": 37.2, "dx": 0.56, "dy": 0.5 };
var DOTS = [[11, 0, "jk"], [12, 0, "jk"], [9, 1, "jk"], [10, 1, "jk"], [11, 1, "jk"], [12, 1, "jk"], [13, 1, "la"], [8, 2, "jk"], [9, 2, "jk"], [10, 2, "jk"], [11, 2, "jk"], [12, 2, "jk"], [13, 2, "la"], [14, 2, "la"], [15, 2, "la"], [10, 3, "jk"], [11, 3, "jk"], [12, 3, "jk"], [13, 3, "la"], [14, 3, "la"], [15, 3, "la"], [16, 3, "la"], [17, 3, "la"], [18, 3, "la"], [19, 3, "la"], [20, 3, "la"], [21, 3, "la"], [11, 4, "jk"], [12, 4, "jk"], [13, 4, "la"], [14, 4, "la"], [15, 4, "la"], [16, 4, "la"], [17, 4, "la"], [18, 4, "la"], [19, 4, "la"], [20, 4, "la"], [21, 4, "la"], [10, 5, "jk"], [11, 5, "jk"], [12, 5, "jk"], [13, 5, "jk"], [14, 5, "la"], [15, 5, "la"], [16, 5, "la"], [17, 5, "la"], [18, 5, "la"], [19, 5, "la"], [20, 5, "la"], [10, 6, "jk"], [11, 6, "jk"], [12, 6, "jk"], [13, 6, "jk"], [14, 6, "la"], [15, 6, "la"], [16, 6, "la"], [17, 6, "la"], [18, 6, "la"], [19, 6, "la"], [10, 7, "jk"], [11, 7, "jk"], [12, 7, "jk"], [13, 7, "jk"], [14, 7, "la"], [15, 7, "la"], [16, 7, "la"], [17, 7, "la"], [18, 7, "la"], [19, 7, "la"], [11, 8, "jk"], [12, 8, "jk"], [13, 8, "jk"], [14, 8, "hp"], [15, 8, "hp"], [16, 8, "la"], [17, 8, "la"], [18, 8, "la"], [19, 8, "la"], [13, 9, "jk"], [14, 9, "hp"], [15, 9, "hp"], [16, 9, "hp"], [17, 9, "hp"], [18, 9, "hp"], [19, 9, "la"], [12, 10, "pb"], [13, 10, "pb"], [14, 10, "hp"], [15, 10, "hp"], [16, 10, "hp"], [17, 10, "hp"], [18, 10, "hp"], [12, 11, "pb"], [13, 11, "pb"], [14, 11, "pb"], [15, 11, "hp"], [16, 11, "hp"], [17, 11, "hp"], [18, 11, "hp"], [12, 12, "pb"], [13, 12, "pb"], [14, 12, "pb"], [15, 12, "ch"], [16, 12, "hp"], [17, 12, "uk"], [18, 12, "uk"], [19, 12, "uk"], [20, 12, "uk"], [11, 13, "pb"], [12, 13, "pb"], [13, 13, "pb"], [14, 13, "pb"], [15, 13, "pb"], [16, 13, "hr"], [17, 13, "uk"], [18, 13, "uk"], [19, 13, "uk"], [20, 13, "uk"], [21, 13, "uk"], [22, 13, "uk"], [10, 14, "rj"], [12, 14, "pb"], [13, 14, "pb"], [14, 14, "pb"], [15, 14, "hr"], [16, 14, "up"], [17, 14, "uk"], [18, 14, "uk"], [19, 14, "uk"], [20, 14, "uk"], [21, 14, "uk"], [9, 15, "rj"], [10, 15, "rj"], [11, 15, "rj"], [12, 15, "hr"], [13, 15, "hr"], [14, 15, "hr"], [15, 15, "hr"], [16, 15, "up"], [17, 15, "up"], [18, 15, "up"], [19, 15, "up"], [20, 15, "uk"], [21, 15, "uk"], [9, 16, "rj"], [10, 16, "rj"], [11, 16, "rj"], [12, 16, "rj"], [13, 16, "hr"], [14, 16, "hr"], [15, 16, "hr"], [16, 16, "up"], [17, 16, "up"], [18, 16, "up"], [19, 16, "up"], [20, 16, "uk"], [21, 16, "uk"], [47, 16, "ar"], [48, 16, "ar"], [49, 16, "ar"], [50, 16, "ar"], [8, 17, "rj"], [9, 17, "rj"], [10, 17, "rj"], [11, 17, "rj"], [12, 17, "rj"], [13, 17, "rj"], [14, 17, "hr"], [15, 17, "hr"], [16, 17, "dl"], [17, 17, "up"], [18, 17, "up"], [19, 17, "up"], [20, 17, "up"], [21, 17, "up"], [22, 17, "up"], [45, 17, "ar"], [46, 17, "ar"], [47, 17, "ar"], [48, 17, "ar"], [49, 17, "ar"], [50, 17, "ar"], [4, 18, "rj"], [7, 18, "rj"], [8, 18, "rj"], [9, 18, "rj"], [10, 18, "rj"], [11, 18, "rj"], [12, 18, "rj"], [13, 18, "rj"], [14, 18, "hr"], [15, 18, "rj"], [16, 18, "hr"], [17, 18, "up"], [18, 18, "up"], [19, 18, "up"], [20, 18, "up"], [21, 18, "up"], [22, 18, "up"], [23, 18, "up"], [24, 18, "up"], [36, 18, "sk"], [44, 18, "ar"], [45, 18, "ar"], [46, 18, "ar"], [47, 18, "ar"], [48, 18, "ar"], [49, 18, "as"], [50, 18, "ar"], [51, 18, "ar"], [3, 19, "rj"], [4, 19, "rj"], [5, 19, "rj"], [6, 19, "rj"], [7, 19, "rj"], [8, 19, "rj"], [9, 19, "rj"], [10, 19, "rj"], [11, 19, "rj"], [12, 19, "rj"], [13, 19, "rj"], [14, 19, "rj"], [15, 19, "rj"], [16, 19, "rj"], [17, 19, "up"], [18, 19, "up"], [19, 19, "up"], [20, 19, "up"], [21, 19, "up"], [22, 19, "up"], [23, 19, "up"], [24, 19, "up"], [25, 19, "up"], [26, 19, "up"], [27, 19, "up"], [36, 19, "sk"], [43, 19, "ar"], [44, 19, "ar"], [45, 19, "ar"], [46, 19, "ar"], [47, 19, "as"], [48, 19, "as"], [49, 19, "as"], [50, 19, "ar"], [51, 19, "ar"], [3, 20, "rj"], [4, 20, "rj"], [5, 20, "rj"], [6, 20, "rj"], [7, 20, "rj"], [8, 20, "rj"], [9, 20, "rj"], [10, 20, "rj"], [11, 20, "rj"], [12, 20, "rj"], [13, 20, "rj"], [14, 20, "rj"], [15, 20, "rj"], [16, 20, "rj"], [17, 20, "up"], [18, 20, "up"], [19, 20, "up"], [20, 20, "up"], [21, 20, "up"], [22, 20, "up"], [23, 20, "up"], [24, 20, "up"], [25, 20, "up"], [26, 20, "up"], [27, 20, "up"], [28, 20, "up"], [29, 20, "br"], [36, 20, "wb"], [43, 20, "ar"], [44, 20, "as"], [45, 20, "ar"], [46, 20, "as"], [47, 20, "as"], [48, 20, "nl"], [49, 20, "ar"], [4, 21, "rj"], [5, 21, "rj"], [6, 21, "rj"], [7, 21, "rj"], [8, 21, "rj"], [9, 21, "rj"], [10, 21, "rj"], [11, 21, "rj"], [12, 21, "rj"], [13, 21, "rj"], [14, 21, "rj"], [15, 21, "rj"], [16, 21, "rj"], [17, 21, "mp"], [18, 21, "mp"], [19, 21, "mp"], [20, 21, "up"], [21, 21, "up"], [22, 21, "up"], [23, 21, "up"], [24, 21, "up"], [25, 21, "up"], [26, 21, "up"], [27, 21, "up"], [28, 21, "br"], [29, 21, "br"], [30, 21, "br"], [31, 21, "br"], [32, 21, "br"], [35, 21, "br"], [36, 21, "wb"], [37, 21, "wb"], [38, 21, "wb"], [39, 21, "as"], [40, 21, "as"], [41, 21, "as"], [42, 21, "as"], [43, 21, "as"], [44, 21, "as"], [45, 21, "as"], [46, 21, "as"], [47, 21, "nl"], [4, 22, "rj"], [5, 22, "rj"], [6, 22, "rj"], [7, 22, "rj"], [8, 22, "rj"], [9, 22, "rj"], [10, 22, "rj"], [11, 22, "rj"], [12, 22, "rj"], [13, 22, "rj"], [14, 22, "rj"], [15, 22, "rj"], [16, 22, "mp"], [17, 22, "mp"], [18, 22, "mp"], [19, 22, "mp"], [20, 22, "up"], [21, 22, "up"], [22, 22, "up"], [23, 22, "up"], [24, 22, "up"], [25, 22, "up"], [26, 22, "up"], [27, 22, "up"], [28, 22, "up"], [29, 22, "br"], [30, 22, "br"], [31, 22, "br"], [32, 22, "br"], [33, 22, "br"], [34, 22, "br"], [35, 22, "wb"], [39, 22, "ml"], [40, 22, "as"], [41, 22, "as"], [42, 22, "ml"], [43, 22, "as"], [44, 22, "as"], [45, 22, "as"], [46, 22, "nl"], [47, 22, "nl"], [5, 23, "rj"], [6, 23, "rj"], [7, 23, "rj"], [8, 23, "rj"], [9, 23, "rj"], [10, 23, "rj"], [11, 23, "rj"], [12, 23, "rj"], [13, 23, "rj"], [14, 23, "rj"], [15, 23, "mp"], [16, 23, "mp"], [17, 23, "mp"], [18, 23, "up"], [19, 23, "up"], [20, 23, "up"], [21, 23, "up"], [22, 23, "up"], [23, 23, "up"], [24, 23, "up"], [25, 23, "up"], [26, 23, "up"], [27, 23, "up"], [28, 23, "br"], [29, 23, "br"], [30, 23, "br"], [31, 23, "br"], [32, 23, "br"], [33, 23, "br"], [34, 23, "br"], [35, 23, "wb"], [36, 23, "wb"], [39, 23, "ml"], [40, 23, "ml"], [41, 23, "ml"], [42, 23, "ml"], [43, 23, "ml"], [44, 23, "as"], [45, 23, "nl"], [46, 23, "mn"], [47, 23, "mn"], [5, 24, "rj"], [6, 24, "rj"], [7, 24, "rj"], [8, 24, "rj"], [9, 24, "rj"], [10, 24, "rj"], [11, 24, "rj"], [12, 24, "rj"], [13, 24, "rj"], [14, 24, "rj"], [15, 24, "rj"], [16, 24, "mp"], [17, 24, "mp"], [18, 24, "up"], [19, 24, "mp"], [20, 24, "mp"], [21, 24, "mp"], [22, 24, "mp"], [23, 24, "up"], [24, 24, "mp"], [25, 24, "up"], [26, 24, "up"], [27, 24, "br"], [28, 24, "br"], [29, 24, "br"], [30, 24, "br"], [31, 24, "br"], [32, 24, "br"], [33, 24, "br"], [34, 24, "jh"], [35, 24, "jh"], [44, 24, "as"], [45, 24, "mn"], [46, 24, "mn"], [47, 24, "mn"], [5, 25, "gj"], [6, 25, "gj"], [7, 25, "gj"], [8, 25, "rj"], [9, 25, "rj"], [10, 25, "rj"], [11, 25, "rj"], [12, 25, "mp"], [13, 25, "mp"], [14, 25, "rj"], [15, 25, "rj"], [16, 25, "mp"], [17, 25, "mp"], [18, 25, "up"], [19, 25, "up"], [20, 25, "mp"], [21, 25, "mp"], [22, 25, "mp"], [23, 25, "mp"], [24, 25, "mp"], [25, 25, "mp"], [26, 25, "up"], [27, 25, "up"], [28, 25, "jh"], [29, 25, "br"], [30, 25, "br"], [31, 25, "jh"], [32, 25, "jh"], [33, 25, "jh"], [34, 25, "jh"], [35, 25, "wb"], [43, 25, "as"], [44, 25, "as"], [45, 25, "mn"], [46, 25, "mn"], [1, 26, "gj"], [2, 26, "gj"], [3, 26, "gj"], [4, 26, "gj"], [5, 26, "gj"], [6, 26, "gj"], [7, 26, "gj"], [8, 26, "gj"], [9, 26, "gj"], [10, 26, "rj"], [11, 26, "rj"], [12, 26, "mp"], [13, 26, "rj"], [14, 26, "mp"], [15, 26, "mp"], [16, 26, "mp"], [17, 26, "mp"], [18, 26, "mp"], [19, 26, "mp"], [20, 26, "mp"], [21, 26, "mp"], [22, 26, "mp"], [23, 26, "mp"], [24, 26, "mp"], [25, 26, "mp"], [26, 26, "up"], [27, 26, "ct"], [28, 26, "jh"], [29, 26, "jh"], [30, 26, "jh"], [31, 26, "jh"], [32, 26, "jh"], [33, 26, "jh"], [34, 26, "wb"], [35, 26, "wb"], [36, 26, "wb"], [42, 26, "tr"], [43, 26, "mz"], [44, 26, "mz"], [46, 26, "mn"], [1, 27, "gj"], [2, 27, "gj"], [3, 27, "gj"], [4, 27, "gj"], [5, 27, "gj"], [6, 27, "gj"], [7, 27, "gj"], [8, 27, "gj"], [9, 27, "gj"], [10, 27, "rj"], [11, 27, "rj"], [12, 27, "mp"], [13, 27, "mp"], [14, 27, "mp"], [15, 27, "mp"], [16, 27, "mp"], [17, 27, "mp"], [18, 27, "mp"], [19, 27, "mp"], [20, 27, "mp"], [21, 27, "mp"], [22, 27, "mp"], [23, 27, "mp"], [24, 27, "mp"], [25, 27, "ct"], [26, 27, "ct"], [27, 27, "ct"], [28, 27, "ct"], [29, 27, "jh"], [30, 27, "jh"], [31, 27, "jh"], [32, 27, "wb"], [33, 27, "wb"], [34, 27, "wb"], [35, 27, "wb"], [36, 27, "wb"], [42, 27, "tr"], [43, 27, "mz"], [44, 27, "mz"], [2, 28, "gj"], [3, 28, "gj"], [4, 28, "gj"], [5, 28, "gj"], [6, 28, "gj"], [7, 28, "gj"], [8, 28, "gj"], [9, 28, "gj"], [10, 28, "gj"], [11, 28, "mp"], [12, 28, "mp"], [13, 28, "mp"], [14, 28, "mp"], [15, 28, "mp"], [16, 28, "mp"], [17, 28, "mp"], [18, 28, "mp"], [19, 28, "mp"], [20, 28, "mp"], [21, 28, "mp"], [22, 28, "mp"], [23, 28, "mp"], [24, 28, "mp"], [25, 28, "ct"], [26, 28, "ct"], [27, 28, "ct"], [28, 28, "ct"], [29, 28, "jh"], [30, 28, "jh"], [31, 28, "jh"], [32, 28, "jh"], [33, 28, "wb"], [34, 28, "wb"], [35, 28, "wb"], [36, 28, "wb"], [44, 28, "mz"], [3, 29, "gj"], [4, 29, "gj"], [5, 29, "gj"], [6, 29, "gj"], [7, 29, "gj"], [8, 29, "gj"], [9, 29, "gj"], [10, 29, "gj"], [11, 29, "mp"], [12, 29, "mp"], [13, 29, "mp"], [14, 29, "mp"], [15, 29, "mp"], [16, 29, "mp"], [17, 29, "mp"], [18, 29, "mp"], [19, 29, "mp"], [20, 29, "mp"], [21, 29, "mp"], [22, 29, "mp"], [23, 29, "ct"], [24, 29, "ct"], [25, 29, "ct"], [26, 29, "ct"], [27, 29, "ct"], [28, 29, "ct"], [29, 29, "jh"], [30, 29, "jh"], [31, 29, "jh"], [32, 29, "or"], [33, 29, "jh"], [34, 29, "wb"], [35, 29, "wb"], [36, 29, "wb"], [44, 29, "mz"], [2, 30, "gj"], [3, 30, "gj"], [4, 30, "gj"], [5, 30, "gj"], [6, 30, "gj"], [7, 30, "gj"], [8, 30, "gj"], [9, 30, "gj"], [10, 30, "gj"], [11, 30, "mh"], [12, 30, "mp"], [13, 30, "mp"], [14, 30, "mp"], [15, 30, "mp"], [16, 30, "mp"], [17, 30, "mp"], [18, 30, "mp"], [19, 30, "mp"], [20, 30, "mp"], [21, 30, "mp"], [22, 30, "mp"], [23, 30, "ct"], [24, 30, "ct"], [25, 30, "ct"], [26, 30, "ct"], [27, 30, "ct"], [28, 30, "or"], [29, 30, "or"], [30, 30, "or"], [31, 30, "or"], [32, 30, "or"], [33, 30, "or"], [34, 30, "wb"], [35, 30, "wb"], [36, 30, "wb"], [37, 30, "wb"], [3, 31, "gj"], [4, 31, "gj"], [5, 31, "gj"], [6, 31, "gj"], [7, 31, "gj"], [8, 31, "gj"], [9, 31, "gj"], [10, 31, "gj"], [11, 31, "mh"], [12, 31, "mh"], [13, 31, "mp"], [14, 31, "mp"], [15, 31, "mp"], [16, 31, "mh"], [17, 31, "mp"], [18, 31, "mh"], [19, 31, "mh"], [20, 31, "mh"], [21, 31, "mh"], [22, 31, "mp"], [23, 31, "ct"], [24, 31, "ct"], [25, 31, "ct"], [26, 31, "ct"], [27, 31, "or"], [28, 31, "or"], [29, 31, "or"], [30, 31, "or"], [31, 31, "or"], [32, 31, "or"], [33, 31, "or"], [4, 32, "gj"], [5, 32, "gj"], [8, 32, "gj"], [9, 32, "gj"], [10, 32, "gj"], [11, 32, "mh"], [12, 32, "mh"], [13, 32, "mh"], [14, 32, "mh"], [15, 32, "mh"], [16, 32, "mh"], [17, 32, "mh"], [18, 32, "mh"], [19, 32, "mh"], [20, 32, "mh"], [21, 32, "mh"], [22, 32, "ct"], [23, 32, "ct"], [24, 32, "ct"], [25, 32, "ct"], [26, 32, "or"], [27, 32, "or"], [28, 32, "or"], [29, 32, "or"], [30, 32, "or"], [31, 32, "or"], [32, 32, "or"], [33, 32, "or"], [9, 33, "dn"], [10, 33, "mh"], [11, 33, "mh"], [12, 33, "mh"], [13, 33, "mh"], [14, 33, "mh"], [15, 33, "mh"], [16, 33, "mh"], [17, 33, "mh"], [18, 33, "mh"], [19, 33, "mh"], [20, 33, "mh"], [21, 33, "mh"], [22, 33, "mh"], [23, 33, "ct"], [24, 33, "ct"], [25, 33, "ct"], [26, 33, "or"], [27, 33, "or"], [28, 33, "or"], [29, 33, "or"], [30, 33, "or"], [31, 33, "or"], [32, 33, "or"], [9, 34, "mh"], [10, 34, "mh"], [11, 34, "mh"], [12, 34, "mh"], [13, 34, "mh"], [14, 34, "mh"], [15, 34, "mh"], [16, 34, "mh"], [17, 34, "mh"], [18, 34, "mh"], [19, 34, "mh"], [20, 34, "mh"], [21, 34, "mh"], [22, 34, "ct"], [23, 34, "ct"], [24, 34, "ct"], [25, 34, "ct"], [26, 34, "or"], [27, 34, "or"], [28, 34, "or"], [29, 34, "or"], [30, 34, "or"], [31, 34, "or"], [32, 34, "or"], [8, 35, "mh"], [9, 35, "mh"], [10, 35, "mh"], [11, 35, "mh"], [12, 35, "mh"], [13, 35, "mh"], [14, 35, "mh"], [15, 35, "mh"], [16, 35, "mh"], [17, 35, "mh"], [18, 35, "tg"], [19, 35, "tg"], [20, 35, "tg"], [21, 35, "mh"], [22, 35, "mh"], [23, 35, "ct"], [24, 35, "ct"], [25, 35, "or"], [26, 35, "or"], [27, 35, "or"], [28, 35, "or"], [29, 35, "or"], [30, 35, "or"], [9, 36, "mh"], [10, 36, "mh"], [11, 36, "mh"], [12, 36, "mh"], [13, 36, "mh"], [14, 36, "mh"], [15, 36, "mh"], [16, 36, "mh"], [17, 36, "mh"], [18, 36, "tg"], [19, 36, "tg"], [20, 36, "tg"], [21, 36, "mh"], [22, 36, "ct"], [23, 36, "ct"], [24, 36, "ct"], [25, 36, "or"], [26, 36, "or"], [27, 36, "ap"], [28, 36, "or"], [29, 36, "ap"], [9, 37, "mh"], [10, 37, "mh"], [11, 37, "mh"], [12, 37, "mh"], [13, 37, "mh"], [14, 37, "mh"], [15, 37, "mh"], [16, 37, "mh"], [17, 37, "tg"], [18, 37, "tg"], [19, 37, "tg"], [20, 37, "tg"], [21, 37, "tg"], [22, 37, "tg"], [23, 37, "ct"], [24, 37, "ct"], [25, 37, "or"], [26, 37, "or"], [27, 37, "ap"], [28, 37, "ap"], [9, 38, "mh"], [10, 38, "mh"], [11, 38, "mh"], [12, 38, "mh"], [13, 38, "mh"], [14, 38, "mh"], [15, 38, "mh"], [16, 38, "ka"], [17, 38, "tg"], [18, 38, "tg"], [19, 38, "tg"], [20, 38, "tg"], [21, 38, "tg"], [22, 38, "tg"], [23, 38, "ct"], [24, 38, "or"], [25, 38, "ap"], [26, 38, "ap"], [27, 38, "ap"], [9, 39, "mh"], [10, 39, "mh"], [11, 39, "mh"], [12, 39, "mh"], [13, 39, "mh"], [14, 39, "mh"], [15, 39, "ka"], [16, 39, "ka"], [17, 39, "tg"], [18, 39, "tg"], [19, 39, "tg"], [20, 39, "tg"], [21, 39, "tg"], [22, 39, "tg"], [23, 39, "tg"], [24, 39, "ap"], [25, 39, "ap"], [26, 39, "ap"], [9, 40, "mh"], [10, 40, "mh"], [11, 40, "mh"], [12, 40, "mh"], [13, 40, "ka"], [14, 40, "ka"], [15, 40, "ka"], [16, 40, "ka"], [17, 40, "tg"], [18, 40, "tg"], [19, 40, "tg"], [20, 40, "tg"], [21, 40, "tg"], [22, 40, "ap"], [23, 40, "ap"], [24, 40, "ap"], [10, 41, "mh"], [11, 41, "ka"], [12, 41, "ka"], [13, 41, "ka"], [14, 41, "ka"], [15, 41, "ka"], [16, 41, "ka"], [17, 41, "tg"], [18, 41, "tg"], [19, 41, "tg"], [20, 41, "ap"], [21, 41, "ap"], [22, 41, "ap"], [23, 41, "ap"], [24, 41, "ap"], [10, 42, "mh"], [11, 42, "ka"], [12, 42, "ka"], [13, 42, "ka"], [14, 42, "ka"], [15, 42, "ka"], [16, 42, "ap"], [17, 42, "tg"], [18, 42, "ap"], [19, 42, "ap"], [20, 42, "ap"], [21, 42, "ap"], [22, 42, "ap"], [10, 43, "ga"], [11, 43, "ka"], [12, 43, "ka"], [13, 43, "ka"], [14, 43, "ka"], [15, 43, "ka"], [16, 43, "ap"], [17, 43, "ap"], [18, 43, "ap"], [19, 43, "ap"], [20, 43, "ap"], [21, 43, "ap"], [11, 44, "ka"], [12, 44, "ka"], [13, 44, "ka"], [14, 44, "ka"], [15, 44, "ka"], [16, 44, "ap"], [17, 44, "ap"], [18, 44, "ap"], [19, 44, "ap"], [20, 44, "ap"], [21, 44, "ap"], [11, 45, "ka"], [12, 45, "ka"], [13, 45, "ka"], [14, 45, "ka"], [15, 45, "ka"], [16, 45, "ap"], [17, 45, "ap"], [18, 45, "ap"], [19, 45, "ap"], [20, 45, "ap"], [21, 45, "ap"], [12, 46, "ka"], [13, 46, "ka"], [14, 46, "ka"], [15, 46, "ka"], [16, 46, "ap"], [17, 46, "ap"], [18, 46, "ap"], [19, 46, "ap"], [20, 46, "ap"], [21, 46, "ap"], [12, 47, "ka"], [13, 47, "ka"], [14, 47, "ka"], [15, 47, "ka"], [16, 47, "ka"], [17, 47, "ka"], [18, 47, "ka"], [19, 47, "ap"], [20, 47, "ap"], [21, 47, "tn"], [44, 47, "an"], [12, 48, "ka"], [13, 48, "ka"], [14, 48, "ka"], [15, 48, "ka"], [16, 48, "ka"], [17, 48, "ka"], [18, 48, "ka"], [19, 48, "tn"], [20, 48, "tn"], [21, 48, "tn"], [13, 49, "ka"], [14, 49, "ka"], [15, 49, "ka"], [16, 49, "ka"], [17, 49, "tn"], [18, 49, "tn"], [19, 49, "tn"], [20, 49, "tn"], [21, 49, "tn"], [44, 49, "an"], [13, 50, "kl"], [14, 50, "ka"], [15, 50, "ka"], [16, 50, "ka"], [17, 50, "tn"], [18, 50, "tn"], [19, 50, "tn"], [20, 50, "py"], [14, 51, "kl"], [15, 51, "tn"], [16, 51, "tn"], [17, 51, "tn"], [18, 51, "tn"], [19, 51, "tn"], [20, 51, "tn"], [14, 52, "kl"], [15, 52, "tn"], [16, 52, "tn"], [17, 52, "tn"], [18, 52, "tn"], [19, 52, "tn"], [20, 52, "tn"], [14, 53, "kl"], [15, 53, "kl"], [16, 53, "tn"], [17, 53, "tn"], [18, 53, "tn"], [19, 53, "tn"], [20, 53, "tn"], [15, 54, "kl"], [16, 54, "kl"], [17, 54, "tn"], [18, 54, "tn"], [19, 54, "tn"], [15, 55, "kl"], [16, 55, "kl"], [17, 55, "tn"], [18, 55, "tn"], [15, 56, "kl"], [16, 56, "tn"], [17, 56, "tn"], [16, 57, "tn"], [17, 57, "tn"], [10, 51, "ld"]];

// src/lib/geo.ts
function stateAt({ lat, lon }) {
  const col = Math.floor((lon - DOT_GEO.x0) / DOT_GEO.dx);
  const row = Math.floor((DOT_GEO.y1 - lat) / DOT_GEO.dy);
  const hit = DOTS.find(([c, r]) => c === col && r === row);
  return hit ? hit[2] : null;
}
function nearState(point, state) {
  for (const dLat of [-DOT_GEO.dy, 0, DOT_GEO.dy]) {
    for (const dLon of [-DOT_GEO.dx, 0, DOT_GEO.dx]) {
      const here = stateAt({ lat: point.lat + dLat, lon: point.lon + dLon });
      if (here && sameArea(here, state)) return true;
    }
  }
  return false;
}
function sameArea(a, b) {
  const pair = /* @__PURE__ */ new Set(["jk", "la"]);
  return a === b || pair.has(a) && pair.has(b);
}

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
  let lat_e5;
  let lon_e5;
  if (input.geo) {
    const allowed = vocab_default.geoServices ?? {};
    if (kind !== "failure" || !allowed[input.department]?.includes(input.service)) {
      throw new Error("A pin is only for a broken road, light, drain or pile of garbage. Bribes and rights reports stay at district level.");
    }
    const { lat, lon } = input.geo;
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < 6 || lat > 38 || lon < 68 || lon > 98) throw new Error("That pin is not in India.");
    if (!nearState({ lat, lon }, input.state)) throw new Error("That pin is not in the state you chose. Move it, or change the district.");
    lat_e5 = Math.round(lat * 1e5);
    lon_e5 = Math.round(lon * 1e5);
  }
  assertPayload(PAYLOAD_BYTES);
  return {
    ...input,
    project: "underthetable",
    type: "report",
    kind,
    week: isoWeek(input.day),
    amount_inr: BigInt(input.amountInr),
    ...lat_e5 !== void 0 && lon_e5 !== void 0 ? { lat_e5, lon_e5 } : {}
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
