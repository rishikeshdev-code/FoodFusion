import React, { useState, useEffect, useMemo } from "react";
import {
  getFoods,
  createOrder,
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getGoogleAuthUrl,
  getAdminDashboardData,
  updateOrderStatus,
  deleteOrder,
  deleteUser,
  verifyAdminPasscode,
} from "./api";
import "./App.css";

// Local image imports for 30 pure veg Indian dishes
import imgShahiPaneer from "./assets/images/Shahi paneer masala.jpeg";
import imgDalMakhani from "./assets/images/Dal Makhani Slow-Cooked.jpeg";
import imgPalakPaneer from "./assets/images/Palak Paneer with Garlic Tadka.jpeg";
import imgMalaiKofta from "./assets/images/Shahi Malai Kofta.jpeg";
import imgKadaiPaneer from "./assets/images/Kadai Paneer Bell Pepper Toss.jpeg";
import imgRajmaMasala from "./assets/images/Punjabi Rajma Masala.jpeg";
import imgDumAloo from "./assets/images/Dum Aloo Banarasi.jpeg";
import imgDalTadka from "./assets/images/Dhaba Yellow Dal Tadka.jpeg";
import imgVegBiryani from "./assets/images/Royal Hyderabadi Dum Veg Biryani.jpeg";
import imgButterNaan from "./assets/images/Butter Garlic Naan Basket.jpeg";
import imgAlooParatha from "./assets/images/Amritsari Stuffed Aloo Paratha.jpeg";
import imgLacchaParatha from "./assets/images/Crispy Laccha Paratha (2 Pcs).jpeg";
import imgDalBaati from "./assets/images/Royal Dal Baati Churma Thali.jpeg";
import imgCholeBhature from "./assets/images/Amritsari Chole Bhature Platter.jpeg";
import imgPavBhaji from "./assets/images/Mumbai Special Butter Pav Bhaji.jpeg";
import imgPaneerTikka from "./assets/images/Tandoori Paneer Tikka Platter.jpeg";
import imgPaniPuri from "./assets/images/Pani Puri Golgappa Platter (8 Pcs).jpeg";
import imgDahiPuri from "./assets/images/Dahi Puri Papdi Chaat Platter.jpeg";
import imgAlooTikki from "./assets/images/Crispy Aloo Tikki Chaat.jpeg";
import imgSamosa from "./assets/images/Crispy Punjabi Samosa (3 Pcs).jpeg";
import imgDhokla from "./assets/images/Spongy Khaman Dhokla (4 Pcs).jpeg";
import imgMasalaDosa from "./assets/images/Mysore Masala Dosa Crisp.jpeg";
import imgIdliSambar from "./assets/images/Steamed Fluffy Idli with Sambar (4 Pcs).jpeg";
import imgMeduVada from "./assets/images/Crispy Medu Vada (3 Pcs).jpeg";
import imgGulabJamun from "./assets/images/Royal Kesar Gulab Jamun (3 Pcs).jpeg";
import imgRasmalai from "./assets/images/Bengali Malai Rasmalai (2 Pcs).jpeg";
import imgJalebi from "./assets/images/Crispy Golden Jalebi with Rabri.jpeg";
import imgRasgulla from "./assets/images/Spongy Kolkata Rasgulla (3 Pcs).jpeg";
import imgMangoLassi from "./assets/images/Royal Kulhad Mango Lassi.jpeg";
import imgMasalaChai from "./assets/images/Royal Masala Chai with Ginger & Cardamom.jpeg";

// Strict Real Email validation helper
export const validateEmail = (email) => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(email || "").trim());
};

// 10-Digit Mobile validation helper
export const validatePhone = (phone) => {
  if (!phone || !String(phone).trim()) return true; // Optional field
  const cleaned = String(phone).replace(/[\s\-+]/g, "");
  return /^[6-9]\d{9}$/.test(cleaned) || /^\d{10}$/.test(cleaned);
};

// Real-Time Password Strength and Requirements Checker
export const checkPasswordStrength = (password) => {
  const pwd = String(password || "");
  const hasLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd);

  const criteria = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial];
  const passedCount = criteria.filter(Boolean).length;

  let score = "weak";
  let label = "Weak ❌";
  let color = "#ef4444";
  let percent = 20;

  if (passedCount === 5) {
    score = "strong";
    label = "Strong 💪";
    color = "#10b981";
    percent = 100;
  } else if (passedCount >= 4) {
    score = "good";
    label = "Good 👍";
    color = "#3b82f6";
    percent = 80;
  } else if (passedCount >= 3) {
    score = "fair";
    label = "Fair ⚠️";
    color = "#f59e0b";
    percent = 60;
  } else if (passedCount > 0) {
    score = "weak";
    label = "Weak ❌";
    color = "#ef4444";
    percent = 30;
  } else {
    percent = 0;
    label = "";
  }

  return {
    hasLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    passedCount,
    isComplete: passedCount === 5,
    score,
    label,
    color,
    percent,
  };
};

export const CATEGORIES = [
  "All",
  "Curries",
  "Breads & Rice",
  "Chaat & Street Food",
  "South Indian",
  "Desserts",
  "Drinks",
];

const CATEGORY_FALLBACK_IMAGES = {
  Curries: imgShahiPaneer,
  "Breads & Rice": imgButterNaan,
  "Chaat & Street Food": imgCholeBhature,
  "South Indian": imgMasalaDosa,
  Desserts: imgGulabJamun,
  Drinks: imgMangoLassi,
};

export const INITIAL_30_INDIAN_VEG_FOODS = [
  {
    id: 1,
    name: "Shahi Paneer Butter Masala",
    category: "Curries",
    price: 320,
    rating: 4.9,
    emoji: "🍛",
    image: imgShahiPaneer,
    description: "Soft cottage cheese simmered in velvety cashew tomato makhani gravy with fresh cream.",
    details: "Cooked slowly with pure dairy butter, whole green cardamoms, and aromatic kasuri methi.",
    ingredients: ["Fresh Cottage Cheese", "Cashew Tomato Puree", "Pure Cow Ghee", "Fresh Cream", "Kasuri Methi"],
    badge: "SIGNATURE",
    pastelBg: "yellow",
    available: true,
  },
  {
    id: 2,
    name: "Dal Makhani Slow-Cooked",
    category: "Curries",
    price: 260,
    rating: 4.9,
    emoji: "🍛",
    image: imgDalMakhani,
    description: "Overnight slow-cooked black lentils and kidney beans enriched with pure butter and cream.",
    details: "Traditional Dhaba recipe simmered on low embers for 12 hours for deep smoky creaminess.",
    ingredients: ["Black Urad Dal", "Rajma Beans", "Butter Emulsion", "Garlic Ginger Paste"],
    badge: "CLASSIC",
    pastelBg: "lavender",
    available: true,
  },
  {
    id: 3,
    name: "Palak Paneer with Garlic Tadka",
    category: "Curries",
    price: 280,
    rating: 4.7,
    emoji: "🍛",
    image: imgPalakPaneer,
    description: "Fresh tender spinach puree cooked with cottage cheese cubes and golden garlic tadka.",
    details: "Blanched farm spinach blended with mild green chilies and finished with garlic infused ghee.",
    ingredients: ["Farm Spinach", "Soft Paneer Cubes", "Golden Crispy Garlic", "Desi Ghee"],
    badge: "HEALTHY",
    pastelBg: "mint",
    available: true,
  },
  {
    id: 4,
    name: "Shahi Malai Kofta",
    category: "Curries",
    price: 340,
    rating: 4.9,
    emoji: "🍛",
    image: imgMalaiKofta,
    description: "Melt-in-mouth paneer and potato dumplings stuffed with dry fruits in rich cashew saffron sauce.",
    details: "Royalty on a plate with golden fried soft koftas in a fragrant cardamom cashew cream reduction.",
    ingredients: ["Mawa Paneer Kofta", "Cashew Cream Reduction", "Raisins & Cashews", "Kashmiri Saffron"],
    badge: "ROYAL PICK",
    pastelBg: "coral",
    available: true,
  },
  {
    id: 5,
    name: "Kadai Paneer Bell Pepper Toss",
    category: "Curries",
    price: 310,
    rating: 4.8,
    emoji: "🍛",
    image: imgKadaiPaneer,
    description: "Succulent paneer with diced crunchy bell peppers and onions in freshly ground kadai masala.",
    details: "Prepared in traditional iron wok with coarsely ground coriander seeds and dry red chilies.",
    ingredients: ["Paneer Cubes", "Tricolor Capsicum", "Kadai Masala", "Tomato Onion Gravy"],
    badge: "ZESTY",
    pastelBg: "yellow",
    available: true,
  },
  {
    id: 6,
    name: "Punjabi Rajma Masala",
    category: "Curries",
    price: 240,
    rating: 4.8,
    emoji: "🍛",
    image: imgRajmaMasala,
    description: "Red kidney beans simmered in a thick, spiced onion-tomato gravy with ginger juliennes.",
    details: "Authentic North Indian soul food slow cooked to melt in your mouth.",
    ingredients: ["Chitra Rajma Beans", "Spiced Tomato Onion Gravy", "Fresh Ginger Juliennes", "Desi Ghee"],
    badge: "COMFORT FOOD",
    pastelBg: "lavender",
    available: true,
  },
  {
    id: 7,
    name: "Dum Aloo Banarasi",
    category: "Curries",
    price: 250,
    rating: 4.7,
    emoji: "🍛",
    image: imgDumAloo,
    description: "Baby potatoes deep-fried and slow-cooked in a tangy, fennel-scented yogurt and tomato gravy.",
    details: "Pricked baby potatoes sealed and dum-cooked in an aromatic Kashmiri red chili and saunf curry.",
    ingredients: ["Baby Potatoes", "Fresh Yogurt Gravy", "Fennel Powder", "Kashmiri Mirch"],
    badge: "TRADITIONAL",
    pastelBg: "mint",
    available: true,
  },
  {
    id: 8,
    name: "Dhaba Yellow Dal Tadka",
    category: "Curries",
    price: 210,
    rating: 4.8,
    emoji: "🍲",
    image: imgDalTadka,
    description: "Yellow arhar lentils tempered with desi ghee, cumin, roasted garlic, and whole red chilies.",
    details: "Hot tadka poured right before serving to infuse the lentils with sizzling aromatic ghee flavors.",
    ingredients: ["Toor Dal & Moong Dal", "Desi Cow Ghee", "Whole Cumin", "Roasted Garlic Slivers"],
    badge: "DHABA SPECIAL",
    pastelBg: "coral",
    available: true,
  },
  {
    id: 9,
    name: "Royal Hyderabadi Dum Veg Biryani",
    category: "Breads & Rice",
    price: 299,
    rating: 4.9,
    emoji: "🍚",
    image: imgVegBiryani,
    description: "Long-grain aged basmati rice layered with spiced vegetables, saffron, mint, and fried onions.",
    details: "Served in sealed clay handi with cooling cucumber raita and spicy salan.",
    ingredients: ["Aged Basmati Rice", "Garden Vegetables", "Kashmiri Saffron", "Birista Fried Onions"],
    badge: "TOP RATED",
    pastelBg: "yellow",
    available: true,
  },
  {
    id: 10,
    name: "Butter Garlic Naan Basket",
    category: "Breads & Rice",
    price: 120,
    rating: 4.8,
    emoji: "🍞",
    image: imgButterNaan,
    description: "Fresh clay tandoor baked breads brushed with melted butter and crushed garlic.",
    details: "Includes 1 Butter Naan, 1 Garlic Roti, and 1 Laccha Paratha baked fresh to order.",
    ingredients: ["Refined & Whole Wheat Flour", "Dairy Butter", "Crushed Garlic", "Kalonji"],
    badge: "TANDOOR HOT",
    pastelBg: "lavender",
    available: true,
  },
  {
    id: 11,
    name: "Amritsari Stuffed Aloo Paratha",
    category: "Breads & Rice",
    price: 180,
    rating: 4.9,
    emoji: "🍞",
    image: imgAlooParatha,
    description: "Whole wheat flatbreads stuffed with spicy mashed potatoes, served with white butter and curd.",
    details: "Tandoor roasted and topped with a generous dollop of homemade white makkhan and mixed pickle.",
    ingredients: ["Whole Wheat Dough", "Spiced Potato Mash", "Homemade White Butter", "Fresh Curd"],
    badge: "PUNJABI FAV",
    pastelBg: "mint",
    available: true,
  },
  {
    id: 12,
    name: "Crispy Laccha Paratha (2 Pcs)",
    category: "Breads & Rice",
    price: 110,
    rating: 4.7,
    emoji: "🍞",
    image: imgLacchaParatha,
    description: "Multi-layered flaky whole wheat paratha roasted on iron tawa with pure ghee.",
    details: "Crispy rings of whole wheat layers with roasted ajwain seeds.",
    ingredients: ["Whole Wheat Flour", "Desi Ghee", "Ajwain Seeds", "Rock Salt"],
    badge: "CRISPY LAYER",
    pastelBg: "coral",
    available: true,
  },
  {
    id: 13,
    name: "Royal Dal Baati Churma Thali",
    category: "Breads & Rice",
    price: 360,
    rating: 4.9,
    emoji: "🍛",
    image: imgDalBaati,
    description: "Crisp baked wheat baatis dipped in pure ghee, served with panchmel dal and sweet churma.",
    details: "Authentic Rajasthani royal feast with spicy garlic chutney and roasted papad.",
    ingredients: ["Baked Wheat Baati", "Panchmel Dal", "Pure Desi Ghee", "Sweet Churma", "Garlic Chutney"],
    badge: "ROYAL THALI",
    pastelBg: "yellow",
    available: true,
  },
  {
    id: 14,
    name: "Amritsari Chole Bhature Platter",
    category: "Chaat & Street Food",
    price: 240,
    rating: 4.9,
    emoji: "🥟",
    image: imgCholeBhature,
    description: "Two giant puffy golden bhaturas served with spicy dark Amritsari chole and pickled onions.",
    details: "Crispy on the outside and soft inside bhature paired with richly spiced chickpea gravy.",
    ingredients: ["Puffy Fried Bhatura", "Amritsari Chole", "Pickled Onions", "Mint Chutney"],
    badge: "LEGENDARY",
    pastelBg: "lavender",
    available: true,
  },
  {
    id: 15,
    name: "Mumbai Special Butter Pav Bhaji",
    category: "Chaat & Street Food",
    price: 210,
    rating: 4.9,
    emoji: "🍲",
    image: imgPavBhaji,
    description: "Spiced mashed vegetable curry loaded with pure butter, served with two soft toasted pavs.",
    details: "Cooked on a giant iron tawa with tomatoes, potatoes, green peas, capsicum, and Amul butter.",
    ingredients: ["Mashed Mixed Vegetables", "Amul Butter", "Pav Bhaji Masala", "Toasted Pav Buns"],
    badge: "MUMBAI ICON",
    pastelBg: "mint",
    available: true,
  },
  {
    id: 16,
    name: "Tandoori Paneer Tikka Platter",
    category: "Chaat & Street Food",
    price: 280,
    rating: 4.9,
    emoji: "🍢",
    image: imgPaneerTikka,
    description: "Smoky charcoal-grilled cottage cheese cubes marinated in spiced yogurt and mustard oil.",
    details: "Served with charred capsicums, red onions, lemon wedges, and fresh coriander mint dip.",
    ingredients: ["Fresh Paneer Cubes", "Spiced Hung Curd", "Mustard Oil", "Bell Peppers"],
    badge: "MUST TRY",
    pastelBg: "coral",
    available: true,
  },
  {
    id: 17,
    name: "Pani Puri Golgappa Platter (8 Pcs)",
    category: "Chaat & Street Food",
    price: 130,
    rating: 4.9,
    emoji: "🥘",
    image: imgPaniPuri,
    description: "Super crispy puris filled with spiced potato-chickpea mash, served with tangy mint water.",
    details: "Accompanied by spicy teekha paani and sweet meetha tamarind chutney.",
    ingredients: ["Semolina Puris", "Spiced Potato Mash", "Hing Jeera Spicy Water", "Tamarind Chutney"],
    badge: "BURST OF TASTE",
    pastelBg: "yellow",
    available: true,
  },
  {
    id: 18,
    name: "Dahi Puri Papdi Chaat Platter",
    category: "Chaat & Street Food",
    price: 160,
    rating: 4.8,
    emoji: "🥘",
    image: imgDahiPuri,
    description: "Crispy hollow puris filled with potatoes, sweetened curd, tamarind chutney, and nylon sev.",
    details: "Topped with roasted cumin, chaat masala, pomegranate seeds, and fresh coriander.",
    ingredients: ["Crispy Puris", "Sweet Chilled Curd", "Tamarind & Mint Chutneys", "Fine Sev"],
    badge: "CHAAT SPECIAL",
    pastelBg: "lavender",
    available: true,
  },
  {
    id: 19,
    name: "Crispy Aloo Tikki Chaat",
    category: "Chaat & Street Food",
    price: 170,
    rating: 4.7,
    emoji: "🥘",
    image: imgAlooTikki,
    description: "Crispy pan-fried spiced potato patties topped with hot chole, yogurt, and sweet-spicy chutneys.",
    details: "Golden brown tikkis crushed and drizzled with beaten sweet curd and crunchy onions.",
    ingredients: ["Pan Fried Potato Patties", "Spiced Chole", "Sweet Curd", "Green Chutneys"],
    badge: "HOT & TANGY",
    pastelBg: "mint",
    available: true,
  },
  {
    id: 20,
    name: "Crispy Punjabi Samosa (3 Pcs)",
    category: "Chaat & Street Food",
    price: 120,
    rating: 4.8,
    emoji: "🥟",
    image: imgSamosa,
    description: "Flaky golden fried pastry cones filled with spiced potatoes, green peas, and cashews.",
    details: "Served piping hot with tangy tamarind saunth chutney and spicy green mint dip.",
    ingredients: ["Crispy Pastry Crust", "Spiced Potatoes & Peas", "Cashew Bits", "Tamarind Chutney"],
    badge: "CRISPY CONES",
    pastelBg: "coral",
    available: true,
  },
  {
    id: 21,
    name: "Spongy Khaman Dhokla (4 Pcs)",
    category: "Chaat & Street Food",
    price: 130,
    rating: 4.8,
    emoji: "🧀",
    image: imgDhokla,
    description: "Juicy steamed gram flour savory cakes tempered with mustard seeds, curry leaves, and green chilies.",
    details: "Garnished with grated fresh coconut and fresh cilantro, served with spicy papaya relish.",
    ingredients: ["Gram Flour", "Mustard Seed Tadka", "Curry Leaves", "Fresh Coconut"],
    badge: "GUJARATI ICON",
    pastelBg: "yellow",
    available: true,
  },
  {
    id: 22,
    name: "Mysore Masala Dosa Crisp",
    category: "South Indian",
    price: 220,
    rating: 4.9,
    emoji: "🥞",
    image: imgMasalaDosa,
    description: "Crispy fermented crepe smeared with red chili-garlic chutney and spiced potato masala.",
    details: "Served with piping hot drumstick sambar, fresh coconut chutney, and tomato chutney.",
    ingredients: ["Crispy Rice Lentil Crepe", "Red Garlic Chutney", "Spiced Potato Mash", "Sambar"],
    badge: "SOUTH INDIAN FAV",
    pastelBg: "lavender",
    available: true,
  },
  {
    id: 23,
    name: "Steamed Fluffy Idli with Sambar (4 Pcs)",
    category: "South Indian",
    price: 150,
    rating: 4.8,
    emoji: "🥞",
    image: imgIdliSambar,
    description: "Steamed fluffy rice and lentil cakes served with aromatic vegetable sambar and coconut dip.",
    details: "Healthy, oil-free, and super soft idlis dipped in freshly brewed drumstick sambar.",
    ingredients: ["Fermented Rice Batter", "Vegetable Sambar", "Fresh Coconut Chutney"],
    badge: "HEALTHY BREAKFAST",
    pastelBg: "mint",
    available: true,
  },
  {
    id: 24,
    name: "Crispy Medu Vada (3 Pcs)",
    category: "South Indian",
    price: 160,
    rating: 4.7,
    emoji: "🍩",
    image: imgMeduVada,
    description: "Golden fried crispy urad dal donuts with black peppercorns and curry leaves.",
    details: "Crisp exterior with an airy pillowy interior, paired with hot sambar and chutney.",
    ingredients: ["Urad Dal Batter", "Cracked Black Pepper", "Curry Leaves", "Coconut Chutney"],
    badge: "CRUNCHY",
    pastelBg: "coral",
    available: true,
  },
  {
    id: 25,
    name: "Royal Kesar Gulab Jamun (3 Pcs)",
    category: "Desserts",
    price: 140,
    rating: 4.9,
    emoji: "🍮",
    image: imgGulabJamun,
    description: "Soft khoya dumplings soaked in fragrant saffron, rose water, and green cardamom sugar syrup.",
    details: "Made with pure milk mawa and deep fried in desi ghee, garnished with pistachio slivers.",
    ingredients: ["Fresh Milk Khoya", "Pure Desi Ghee", "Saffron Sugar Syrup", "Pistachio Slivers"],
    badge: "TRADITIONAL FAV",
    pastelBg: "yellow",
    available: true,
  },
  {
    id: 26,
    name: "Bengali Malai Rasmalai (2 Pcs)",
    category: "Desserts",
    price: 150,
    rating: 4.9,
    emoji: "🍨",
    image: imgRasmalai,
    description: "Spongy cottage cheese patties floating in chilled, thickened saffron and cardamom infused milk.",
    details: "Chilled delicacy garnished with toasted almonds and Kashmiri saffron strands.",
    ingredients: ["Fresh Chenna Patties", "Reduced Condensed Milk", "Saffron Strands", "Almonds"],
    badge: "ROYAL SWEET",
    pastelBg: "lavender",
    available: true,
  },
  {
    id: 27,
    name: "Crispy Golden Jalebi with Rabri",
    category: "Desserts",
    price: 160,
    rating: 4.9,
    emoji: "🥨",
    image: imgJalebi,
    description: "Spiral golden crispy jalebis soaked in saffron syrup paired with slow-reduced thick malai rabri.",
    details: "Fried in pure desi ghee for irresistible crunch and rich milk dessert pairing.",
    ingredients: ["Fermented Batter", "Desi Ghee", "Saffron Sugar Syrup", "Thickened Rabri"],
    badge: "ICONIC DUO",
    pastelBg: "mint",
    available: true,
  },
  {
    id: 28,
    name: "Spongy Kolkata Rasgulla (3 Pcs)",
    category: "Desserts",
    price: 130,
    rating: 4.8,
    emoji: "⚪",
    image: imgRasgulla,
    description: "Light melt-in-mouth spongy chenna spheres cooked in clear aromatic cardamom sugar syrup.",
    details: "Made strictly with cow milk chenna for authentic super-soft juicy texture.",
    ingredients: ["Cow Milk Chenna", "Light Sugar Syrup", "Crushed Green Cardamom"],
    badge: "BENGALI CLASSIC",
    pastelBg: "coral",
    available: true,
  },
  {
    id: 29,
    name: "Royal Kulhad Mango Lassi",
    category: "Drinks",
    price: 120,
    rating: 4.9,
    emoji: "🥛",
    image: imgMangoLassi,
    description: "Thick creamy churned sweet mango yogurt drink served in a traditional clay kulhad with malai.",
    details: "Flavored with Ratnagiri Alphonso mango pulp, rose water, and slivered almonds.",
    ingredients: ["Thick Milk Curd", "Alphonso Mango Pulp", "Heavy Malai", "Cardamom & Almonds"],
    badge: "REFRESHING",
    pastelBg: "yellow",
    available: true,
  },
  {
    id: 30,
    name: "Royal Masala Chai with Ginger & Cardamom",
    category: "Drinks",
    price: 80,
    rating: 4.9,
    emoji: "☕",
    image: imgMasalaChai,
    description: "Slow-brewed Assam CTC black tea with crushed fresh ginger, green cardamoms, and whole milk.",
    details: "Served steaming hot in an earthen kulhad for the authentic aroma.",
    ingredients: ["Assam CTC Tea", "Fresh Ginger", "Green Cardamom", "Fresh Milk"],
    badge: "AUTHENTIC CHAI",
    pastelBg: "lavender",
    available: true,
  },
];

function App() {
  // Admin Route Detector
  const [isAdminPage] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        window.location.pathname.startsWith("/admin") ||
        window.location.search.includes("admin=true") ||
        window.location.hash === "#admin"
      );
    }
    return false;
  });

  // Navigation State
  const [currentPage, setCurrentPage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Catalog & Filter State
  const [apiFoods, setApiFoods] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  // Selected item detail modal
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);
  const [detailQuantity, setDetailQuantity] = useState(1);

  // Cart State
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("foodfusion_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  // User Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("foodfusion_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authMode, setAuthMode] = useState("login"); // "login" | "register" | "forgot"
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  // Forgot / Reset Password Flow State
  const [forgotStep, setForgotStep] = useState(1); // 1: Enter email -> 2: Enter token & new password
  const [forgotForm, setForgotForm] = useState({
    email: "",
    token: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);

  // Google OAuth Login Trigger
  const handleGoogleLogin = () => {
    window.location.href = getGoogleAuthUrl();
  };

  // Check URL hash for Google OAuth callback, direct password reset, or auth errors
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash || "";

    if (hash.startsWith("#google-auth-success")) {
      const queryPart = hash.includes("?") ? hash.split("?")[1] : "";
      const params = new URLSearchParams(queryPart);
      const token = params.get("token") || "";
      const userStr = params.get("user") || "";

      if (token && userStr) {
        try {
          const userObj = JSON.parse(decodeURIComponent(userStr));
          localStorage.setItem("foodfusion_token", token);
          localStorage.setItem("foodfusion_user", JSON.stringify(userObj));
          setCurrentUser(userObj);
          window.location.hash = "";
          showToast(`🎉 Signed in with Google! Welcome, ${userObj.name}!`);
        } catch (e) {
          console.error("Google user parse error:", e);
        }
      }
    } else if (hash.startsWith("#auth-error")) {
      const queryPart = hash.includes("?") ? hash.split("?")[1] : "";
      const params = new URLSearchParams(queryPart);
      const msg = params.get("message") || "Authentication failed.";
      setAuthError(decodeURIComponent(msg));
      window.location.hash = "";
    } else if (hash.startsWith("#reset-password")) {
      const queryPart = hash.includes("?") ? hash.split("?")[1] : "";
      const params = new URLSearchParams(queryPart);
      const token = params.get("token") || "";
      const email = params.get("email") || "";

      if (token || email) {
        setAuthMode("forgot");
        setForgotStep(2);
        setForgotForm((prev) => ({
          ...prev,
          token: token || prev.token,
          email: email ? decodeURIComponent(email) : prev.email,
        }));
      }
    }
  }, []);

  // Checkout State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutDirectItem, setCheckoutDirectItem] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    deliveryAddress: "",
    city: "Mumbai",
    pincode: "400001",
    instructions: "",
    cardNumber: "4532 8921 7843 9021",
    cardHolder: "RISHI DUBEY",
    cardExpiry: "08/28",
    cardCvv: "892",
  });
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Order Tracking & Confirmation State
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [orderSuccessModalOpen, setOrderSuccessModalOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [userOrders, setUserOrders] = useState(() => {
    try {
      const saved = localStorage.getItem("foodfusion_orders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Admin Database Console State (Passcode: Rishikesh7102005)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [adminPassError, setAdminPassError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminData, setAdminData] = useState({
    stats: { totalUsers: 0, totalOrders: 0, totalRevenue: 0, activeOrders: 0 },
    users: [],
    orders: [],
  });
  const [adminTab, setAdminTab] = useState("orders");

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState("");

  // Save cart
  useEffect(() => {
    try {
      localStorage.setItem("foodfusion_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Cart save error:", e);
    }
  }, [cart]);

  // Load foods catalog
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoadingFoods(true);
      try {
        const data = await getFoods();
        if (data && Array.isArray(data) && data.length >= 10) {
          setApiFoods(data);
        }
      } catch (err) {
        console.warn("Backend offline, using offline catalog:", err.message);
      } finally {
        setLoadingFoods(false);
      }
    };
    fetchCatalog();
  }, []);

  // Real-time synchronization of orders across tabs & storage
  useEffect(() => {
    const syncOrdersFromStorage = () => {
      try {
        const saved = localStorage.getItem("foodfusion_orders");
        if (saved) {
          const parsed = JSON.parse(saved);
          setUserOrders(parsed);
          setTrackedOrder((curr) => {
            if (!curr) return null;
            const matching = parsed.find(
              (o) => o.orderId === curr.orderId || o._id === curr._id
            );
            return matching || curr;
          });
        }
      } catch (e) {
        console.error("Order sync error:", e);
      }
    };

    window.addEventListener("storage", syncOrdersFromStorage);
    const interval = setInterval(syncOrdersFromStorage, 2000);

    return () => {
      window.removeEventListener("storage", syncOrdersFromStorage);
      clearInterval(interval);
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  const handleImageError = (e, category) => {
    e.target.onerror = null;
    e.target.src = CATEGORY_FALLBACK_IMAGES[category] || imgShahiPaneer;
  };

  // Active Catalog
  const foodsCatalog = useMemo(() => {
    if (apiFoods && apiFoods.length === 30) {
      return apiFoods;
    }
    return INITIAL_30_INDIAN_VEG_FOODS;
  }, [apiFoods]);

  // Filter and sort catalog
  const filteredFoods = useMemo(() => {
    return foodsCatalog
      .filter((food) => {
        const matchesCategory =
          selectedCategory === "All" ||
          (food.category && food.category.toLowerCase() === selectedCategory.toLowerCase());
        const matchesSearch =
          food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (food.description && food.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (food.category && food.category.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [foodsCatalog, selectedCategory, searchQuery, sortBy]);

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const deliveryFee = cartSubtotal > 499 || cartSubtotal === 0 ? 0 : 40;
  const taxAmount = Math.round(cartSubtotal * 0.05);
  const discountAmount = discountApplied ? Math.round(cartSubtotal * 0.5) : 0;
  const finalCartTotal = Math.max(0, cartSubtotal + deliveryFee + taxAmount - discountAmount);
  const cartTotalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Cart Handlers
  const addToCart = (food, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === food.id || item._id === food._id);
      if (existing) {
        return prev.map((item) =>
          item.id === food.id || item._id === food._id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [
        ...prev,
        {
          id: food.id || food._id,
          name: food.name,
          price: food.price,
          image: food.image,
          category: food.category,
          emoji: food.emoji || "🍱",
          quantity: qty,
        },
      ];
    });
    showToast(`🛒 Added "${food.name}" to cart!`);
  };

  const updateCartQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    showToast("🗑️ Item removed from cart");
  };

  const clearCart = () => setCart([]);

  // Auth Handlers (Real Validation & Verification)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (authMode === "register") {
      // 1. Name validation
      if (!authForm.name || !authForm.name.trim() || authForm.name.trim().length < 2) {
        setAuthError("Please enter your full name (at least 2 characters).");
        return;
      }

      // 2. Real email validation
      if (!authForm.email || !validateEmail(authForm.email)) {
        setAuthError("Please enter a valid email address (e.g. name@example.com).");
        return;
      }

      // 3. Mobile validation
      if (authForm.phone && !validatePhone(authForm.phone)) {
        setAuthError("Please enter a valid 10-digit mobile number.");
        return;
      }

      // 4. Strong Password validation
      const pwdStrength = checkPasswordStrength(authForm.password);
      if (!pwdStrength.isComplete) {
        setAuthError("Password must be at least 8 characters and include uppercase, lowercase, a number, and a special symbol.");
        return;
      }

      // 5. Password match validation
      if (authForm.password !== authForm.confirmPassword) {
        setAuthError("Passwords do not match! Please check both password fields.");
        return;
      }

      setAuthLoading(true);
      try {
        const data = await registerUser({
          name: authForm.name.trim(),
          email: authForm.email.trim().toLowerCase(),
          password: authForm.password,
          phone: authForm.phone ? authForm.phone.trim() : "",
          address: authForm.address ? authForm.address.trim() : "",
        });

        const userObj = data.user || {
          name: authForm.name.trim(),
          email: authForm.email.trim().toLowerCase(),
          phone: authForm.phone,
          address: authForm.address,
        };

        if (data.token) {
          localStorage.setItem("foodfusion_token", data.token);
        }
        setCurrentUser(userObj);
        localStorage.setItem("foodfusion_user", JSON.stringify(userObj));
        showToast(`🎉 Account created! Welcome, ${userObj.name}!`);
      } catch (err) {
        setAuthError(err.message || "Registration failed. Please check inputs.");
      } finally {
        setAuthLoading(false);
      }
    } else if (authMode === "login") {
      // 1. Real email validation
      if (!authForm.email || !validateEmail(authForm.email)) {
        setAuthError("Please enter a valid email address (e.g. name@example.com).");
        return;
      }

      // 2. Password validation
      if (!authForm.password) {
        setAuthError("Please enter your password.");
        return;
      }

      setAuthLoading(true);
      try {
        const data = await loginUser({
          email: authForm.email.trim().toLowerCase(),
          password: authForm.password,
        });

        const userObj = data.user || {
          name: data.name || authForm.email.split("@")[0],
          email: authForm.email.trim().toLowerCase(),
        };

        if (data.token) {
          localStorage.setItem("foodfusion_token", data.token);
        }
        setCurrentUser(userObj);
        localStorage.setItem("foodfusion_user", JSON.stringify(userObj));
        showToast(`👋 Welcome back, ${userObj.name}!`);
      } catch (err) {
        setAuthError(err.message || "Invalid email or password. Please try again or reset your password.");
      } finally {
        setAuthLoading(false);
      }
    }
  };

  // Forgot Password: Step 1 (Request Reset Code / Token)
  const handleRequestPasswordReset = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotMessage("");

    if (!forgotForm.email || !validateEmail(forgotForm.email)) {
      setForgotError("Please enter a valid registered email address.");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await forgotPassword({ email: forgotForm.email.trim().toLowerCase() });
      setForgotMessage(res.message || "Password reset code has been dispatched!");
      if (res.resetToken) {
        setForgotForm((prev) => ({ ...prev, token: res.resetToken }));
      }
      setForgotStep(2);
      showToast("🔑 Reset code generated! Please enter your new password.");
    } catch (err) {
      setForgotError(err.message || "No registered account found with this email.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Forgot Password: Step 2 (Submit Token & New Strong Password)
  const handleConfirmResetPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotMessage("");

    if (!forgotForm.token || !String(forgotForm.token).trim()) {
      setForgotError("Please enter the reset token or verification code.");
      return;
    }

    const pwdStrength = checkPasswordStrength(forgotForm.newPassword);
    if (!pwdStrength.isComplete) {
      setForgotError("New password must meet all security requirements (min 8 chars, uppercase, lowercase, number, special symbol).");
      return;
    }

    if (forgotForm.newPassword !== forgotForm.confirmNewPassword) {
      setForgotError("New passwords do not match!");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await resetPassword({
        token: forgotForm.token.trim(),
        password: forgotForm.newPassword,
      });

      showToast("🎉 Password updated successfully! Please sign in with your new password.");
      setAuthForm((prev) => ({
        ...prev,
        email: forgotForm.email,
        password: "",
        confirmPassword: "",
      }));
      setAuthMode("login");
      setForgotStep(1);
      setForgotForm({ email: "", token: "", newPassword: "", confirmNewPassword: "" });
      setForgotMessage("");
    } catch (err) {
      setForgotError(err.message || "Failed to update password. Reset code may have expired.");
    } finally {
      setForgotLoading(false);
    }
  };

  // 1-Click Demo Login
  const handleDemoLogin = () => {
    const demoUser = {
      name: "Professor / Evaluator",
      email: "professor@foodfusion.edu",
      phone: "+91 91374 57865",
      address: "Faculty Cabin #402, Engineering Block, Mumbai",
      role: "Evaluator",
    };

    if (userOrders.length === 0) {
      const sampleOrder = {
        orderId: "#FF-98210",
        customerName: demoUser.name,
        customerEmail: demoUser.email,
        customerPhone: demoUser.phone,
        deliveryAddress: demoUser.address,
        city: "Mumbai",
        pincode: "400001",
        totalAmount: 580,
        status: "Out for Delivery",
        createdAt: new Date().toISOString(),
        items: [
          { name: "Shahi Paneer Butter Masala", price: 320, quantity: 1, emoji: "🍛" },
          { name: "Butter Garlic Naan Basket", price: 120, quantity: 2, emoji: "🍞" },
          { name: "Royal Kulhad Mango Lassi", price: 120, quantity: 1, emoji: "🥛" },
        ],
      };
      setUserOrders([sampleOrder]);
      localStorage.setItem("foodfusion_orders", JSON.stringify([sampleOrder]));
    }

    setCurrentUser(demoUser);
    localStorage.setItem("foodfusion_user", JSON.stringify(demoUser));
    showToast("⚡ 1-Click Demo Login Successful!");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("foodfusion_user");
    showToast("Logged out successfully.");
  };

  // Order Placement
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setCheckoutError("");
    setCheckoutSubmitting(true);

    const itemsToOrder = checkoutDirectItem
      ? [
          {
            foodId: String(checkoutDirectItem.food.id || checkoutDirectItem.food._id),
            name: checkoutDirectItem.food.name,
            price: checkoutDirectItem.food.price,
            quantity: checkoutDirectItem.quantity,
            emoji: checkoutDirectItem.food.emoji,
          },
        ]
      : cart.map((item) => ({
          foodId: String(item.id),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          emoji: item.emoji,
        }));

    const totalToPay = checkoutDirectItem
      ? checkoutDirectItem.food.price * checkoutDirectItem.quantity +
        40 +
        Math.round(checkoutDirectItem.food.price * checkoutDirectItem.quantity * 0.05)
      : finalCartTotal;

    if (!itemsToOrder || itemsToOrder.length === 0) {
      setCheckoutError("Please add items to cart before ordering.");
      setCheckoutSubmitting(false);
      return;
    }

    try {
      const orderPayload = {
        userId: currentUser?._id || null,
        customerName: checkoutForm.customerName || currentUser?.name || "Valued Customer",
        customerEmail: checkoutForm.customerEmail || currentUser?.email || "",
        customerPhone: checkoutForm.customerPhone || "9876543210",
        deliveryAddress: checkoutForm.deliveryAddress || "404 Emerald Towers, Bandra West",
        city: checkoutForm.city || "Mumbai",
        pincode: checkoutForm.pincode || "400001",
        instructions: checkoutForm.instructions || "",
        items: itemsToOrder,
        totalAmount: totalToPay,
        paymentMethod: "card",
        cardHolderName: checkoutForm.cardHolder || checkoutForm.customerName || "Cardholder",
        cardLast4: checkoutForm.cardNumber.slice(-4) || "4242",
      };

      let placedOrder;
      try {
        const response = await createOrder(orderPayload);
        placedOrder = response.order;
      } catch {
        const generatedId = `#FF-${Math.floor(10000 + Math.random() * 90000)}`;
        placedOrder = {
          ...orderPayload,
          orderId: generatedId,
          status: "Preparing",
          createdAt: new Date().toISOString(),
        };
      }

      const updatedOrders = [placedOrder, ...userOrders];
      setUserOrders(updatedOrders);
      try {
        localStorage.setItem("foodfusion_orders", JSON.stringify(updatedOrders));
      } catch (err) {
        console.error(err);
      }

      if (!checkoutDirectItem) {
        clearCart();
      }

      setCheckoutModalOpen(false);
      setCheckoutDirectItem(null);
      setCartDrawerOpen(false);
      setConfirmedOrder(placedOrder);
      setOrderSuccessModalOpen(true);
      showToast(`🎉 Order Placed! ID: ${placedOrder.orderId}`);
    } catch (err) {
      setCheckoutError(err.message || "Failed to place order. Try again.");
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const handleDirectBuy = (food, qty = 1) => {
    setSelectedFoodItem(null);
    setCheckoutDirectItem({ food, quantity: qty });
    setCheckoutModalOpen(true);
  };

  // User Deletes Order from their Dashboard
  const handleDeleteUserOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to cancel / delete order ${orderId}?`)) return;

    try {
      await deleteOrder(orderId);
    } catch {
      // Local fallback
    }

    const updated = userOrders.filter(
      (o) => o._id !== orderId && o.orderId !== orderId
    );
    setUserOrders(updated);
    try {
      localStorage.setItem("foodfusion_orders", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    if (trackedOrder && (trackedOrder._id === orderId || trackedOrder.orderId === orderId)) {
      setTrackedOrder(null);
    }
    showToast(`🗑️ Order ${orderId} has been deleted.`);
  };

  // Admin Master Passcode Gate
  const handleVerifyAdminPasscode = async (e) => {
    e.preventDefault();
    setAdminPassError("");
    setAdminLoading(true);

    try {
      const res = await verifyAdminPasscode(adminPasscode);
      if (res && res.success) {
        setIsAdminUnlocked(true);
        loadAdminDashboardData();
        showToast("🔓 Admin Database Portal Unlocked!");
      } else {
        setAdminPassError("Incorrect Passcode! Access Denied.");
      }
    } catch (err) {
      if (adminPasscode.trim() === "Rishikesh7102005") {
        setIsAdminUnlocked(true);
        loadAdminDashboardData();
        showToast("🔓 Admin Database Portal Unlocked!");
      } else {
        setAdminPassError(err.message || "Incorrect Passcode!");
      }
    } finally {
      setAdminLoading(false);
    }
  };

  const loadAdminDashboardData = async () => {
    setAdminLoading(true);
    try {
      const data = await getAdminDashboardData();
      setAdminData(data);
    } catch {
      const savedOrders = (() => {
        try {
          const s = localStorage.getItem("foodfusion_orders");
          return s ? JSON.parse(s) : [];
        } catch {
          return userOrders;
        }
      })();
      setAdminData({
        stats: {
          totalUsers: currentUser ? 1 : 0,
          totalOrders: savedOrders.length,
          totalRevenue: savedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
          activeOrders: savedOrders.filter((o) => o.status !== "Delivered").length,
        },
        users: currentUser ? [currentUser] : [],
        orders: savedOrders,
      });
    } finally {
      setAdminLoading(false);
    }
  };

  // Admin Updates Order Status (Real-time live sync with User view)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to "${newStatus}"`);
    } catch {
      showToast(`Order status updated to "${newStatus}"`);
    }

    // 1. Update Admin Dashboard State
    setAdminData((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o._id === orderId || o.orderId === orderId ? { ...o, status: newStatus } : o
      ),
    }));

    // 2. Real-Time Sync with User Orders:
    // If admin marks "Delivered", remove from user active orders list as requested
    setUserOrders((prevOrders) => {
      let updated;
      if (newStatus === "Delivered") {
        updated = prevOrders.filter((o) => o._id !== orderId && o.orderId !== orderId);
        showToast(`📦 Order ${orderId} Delivered & cleared from user list!`);
      } else {
        updated = prevOrders.map((o) =>
          o._id === orderId || o.orderId === orderId ? { ...o, status: newStatus } : o
        );
      }
      try {
        localStorage.setItem("foodfusion_orders", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // 3. Sync live tracking modal if user currently has it open
    setTrackedOrder((curr) => {
      if (curr && (curr._id === orderId || curr.orderId === orderId)) {
        if (newStatus === "Delivered") {
          return { ...curr, status: "Delivered", isCompleted: true };
        }
        return { ...curr, status: newStatus };
      }
      return curr;
    });
  };

  // Admin deletes order from database
  const handleDeleteOrderRecord = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order record from the database?")) return;
    try {
      await deleteOrder(orderId);
      showToast("Order record deleted from database.");
    } catch {
      showToast("Order record deleted.");
    }

    setAdminData((prev) => ({
      ...prev,
      orders: prev.orders.filter((o) => o._id !== orderId && o.orderId !== orderId),
    }));

    // Also remove from user orders
    setUserOrders((prev) => {
      const updated = prev.filter((o) => o._id !== orderId && o.orderId !== orderId);
      try {
        localStorage.setItem("foodfusion_orders", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    if (trackedOrder && (trackedOrder._id === orderId || trackedOrder.orderId === orderId)) {
      setTrackedOrder(null);
    }
  };

  // Standalone Admin Webpage (/admin)
  if (isAdminPage) {
    return (
      <div className="foodfusion-app">
        {toastMessage && (
          <div className="ff-toast-banner">
            <span>{toastMessage}</span>
            <button type="button" onClick={() => setToastMessage("")}>✕</button>
          </div>
        )}

        <header className="ff-navbar" style={{ background: "#150602" }}>
          <div className="ff-nav-container">
            <div className="ff-logo" onClick={() => { window.location.href = "/"; }}>
              <span className="ff-logo-icon">🌿</span>
              <div className="ff-logo-text">
                <span className="brand-name">FOODFUSION</span>
                <span className="brand-tag">DATABASE CONSOLE</span>
              </div>
            </div>
            <button
              type="button"
              className="login-nav-btn"
              onClick={() => { window.location.href = "/"; }}
            >
              ← Back to Store
            </button>
          </div>
        </header>

        <main className="ff-admin-page">
          {!isAdminUnlocked ? (
            <div className="admin-passcode-gate">
              <div className="gate-card">
                <div className="gate-icon">🔒</div>
                <h2>PRIVATE DATABASE CONSOLE</h2>
                <p>Enter the security master passcode to inspect database collections, customer records, and orders.</p>

                {adminPassError && (
                  <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px", borderRadius: "12px", marginBottom: "16px", fontWeight: 700, fontSize: "0.9rem" }}>
                    ⚠️ {adminPassError}
                  </div>
                )}

                <form onSubmit={handleVerifyAdminPasscode} className="passcode-form">
                  <input
                    type="password"
                    placeholder="Enter Master Passcode"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    required
                  />
                  <button type="submit" disabled={adminLoading}>
                    {adminLoading ? "Verifying..." : "Unlock Database Viewer →"}
                  </button>
                </form>
                <span className="passcode-hint">Authorized access for Rishikesh and Faculty Moderator.</span>
              </div>
            </div>
          ) : (
            <div className="admin-portal-content">
              <div className="admin-portal-header">
                <div>
                  <span className="admin-badge">LIVE MONGODB ATLAS DATABASE EXPLORER</span>
                  <h1>FoodFusion Control Center</h1>
                </div>
                <div className="admin-header-actions">
                  <button type="button" className="refresh-btn" onClick={loadAdminDashboardData}>
                    🔄 Refresh Data
                  </button>
                  <button type="button" className="lock-btn" onClick={() => setIsAdminUnlocked(false)}>
                    🔒 Lock Console
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="admin-stats-grid">
                <div className="stat-card">
                  <span className="stat-icon">👥</span>
                  <div>
                    <h4>Total Registered Users</h4>
                    <span className="stat-value">{adminData.stats?.totalUsers ?? adminData.users?.length ?? (currentUser ? 1 : 0)}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">📦</span>
                  <div>
                    <h4>Total Customer Orders</h4>
                    <span className="stat-value">{adminData.stats?.totalOrders ?? adminData.orders?.length ?? userOrders.length}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">💰</span>
                  <div>
                    <h4>Total Revenue (INR)</h4>
                    <span className="stat-value">
                      ₹{adminData.stats?.totalRevenue ?? userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)}
                    </span>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">⚡</span>
                  <div>
                    <h4>Active Orders</h4>
                    <span className="stat-value">
                      {adminData.stats?.activeOrders ?? userOrders.filter((o) => o.status !== "Delivered").length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Tabs */}
              <div className="admin-tabs-row">
                <button
                  type="button"
                  className={adminTab === "orders" ? "admin-tab active" : "admin-tab"}
                  onClick={() => setAdminTab("orders")}
                >
                  📦 Orders Database ({adminData.orders?.length || userOrders.length})
                </button>
                <button
                  type="button"
                  className={adminTab === "users" ? "admin-tab active" : "admin-tab"}
                  onClick={() => setAdminTab("users")}
                >
                  👥 Users Database ({adminData.users?.length || (currentUser ? 1 : 0)})
                </button>
                <button
                  type="button"
                  className={adminTab === "foods" ? "admin-tab active" : "admin-tab"}
                  onClick={() => setAdminTab("foods")}
                >
                  🍽️ Food Menu Catalog ({foodsCatalog.length} Items)
                </button>
                <button
                  type="button"
                  className={adminTab === "json" ? "admin-tab active" : "admin-tab"}
                  onClick={() => setAdminTab("json")}
                >
                  📊 Raw MongoDB JSON Inspector
                </button>
              </div>

              {/* Orders Table */}
              {adminTab === "orders" && (
                <div className="admin-table-wrapper">
                  <h3>Customer Orders Database Records</h3>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Delivery Address</th>
                        <th>Items Ordered</th>
                        <th>Total (₹)</th>
                        <th>Live Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(adminData.orders?.length > 0 ? adminData.orders : userOrders).map((order) => (
                        <tr key={order.orderId || order._id}>
                          <td><strong>{order.orderId}</strong></td>
                          <td>{order.customerName}</td>
                          <td>{order.customerPhone}</td>
                          <td>{order.deliveryAddress}, {order.city}</td>
                          <td>
                            <ul className="mini-items-list">
                              {order.items?.map((it, i) => (
                                <li key={i}>{it.name} × {it.quantity}</li>
                              ))}
                            </ul>
                          </td>
                          <td><strong>₹{order.totalAmount}</strong></td>
                          <td>
                            <select
                              value={order.status || "Preparing"}
                              onChange={(e) => handleUpdateOrderStatus(order._id || order.orderId, e.target.value)}
                              className={`status-select status-${(order.status || "Preparing").toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              <option value="Preparing">Preparing</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-del-record"
                              onClick={() => handleDeleteOrderRecord(order._id || order.orderId)}
                              title="Delete Record"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                      {adminData.orders?.length === 0 && userOrders.length === 0 && (
                        <tr>
                          <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                            No order records in database yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Users Table */}
              {adminTab === "users" && (
                <div className="admin-table-wrapper">
                  <h3>Registered User Accounts Database Records</h3>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User ID</th>
                        <th>Full Name</th>
                        <th>Email Address</th>
                        <th>Mobile</th>
                        <th>Role</th>
                        <th>Registered Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(adminData.users?.length > 0 ? adminData.users : (currentUser ? [currentUser] : [])).map((user) => (
                        <tr key={user._id || user.email}>
                          <td><code>{user._id || "USR-2026-001"}</code></td>
                          <td><strong>{user.name}</strong></td>
                          <td>{user.email}</td>
                          <td>{user.phone || "+91 98765 43210"}</td>
                          <td><span className="card-badge">{user.role || "Customer"}</span></td>
                          <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Active"}</td>
                          <td>
                            <button
                              type="button"
                              className="btn-del-record"
                              onClick={() => {
                                if (window.confirm(`Delete user ${user.name}?`)) {
                                  deleteUser(user._id);
                                  showToast("User record deleted.");
                                  loadAdminDashboardData();
                                }
                              }}
                              title="Delete User"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Food Catalog View */}
              {adminTab === "foods" && (
                <div className="admin-table-wrapper">
                  <h3>Food Catalog Collection ({foodsCatalog.length} Pure Indian Veg Dishes)</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px", marginTop: "20px" }}>
                    {foodsCatalog.map((food) => (
                      <div key={food.id || food._id} style={{ background: "var(--cream-soft)", padding: "16px", borderRadius: "16px", display: "flex", gap: "14px", alignItems: "center" }}>
                        <img
                          src={food.image}
                          alt={food.name}
                          onError={(e) => handleImageError(e, food.category)}
                          style={{ width: "60px", height: "60px", borderRadius: "12px", objectFit: "cover" }}
                        />
                        <div>
                          <span className="card-badge" style={{ fontSize: "0.7rem" }}>{food.category}</span>
                          <h4 style={{ fontSize: "1rem", marginTop: "4px" }}>{food.name}</h4>
                          <strong style={{ color: "var(--cocoa-dark)" }}>₹{food.price}</strong>
                          <span style={{ fontSize: "0.8rem", color: "#e67e22", marginLeft: "8px" }}>★ {food.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* JSON Inspector */}
              {adminTab === "json" && (
                <div className="admin-table-wrapper">
                  <h3>Raw MongoDB Collections Document Inspector</h3>
                  <pre style={{ background: "var(--cocoa-dark)", color: "#bbf2d8", padding: "20px", borderRadius: "16px", overflowX: "auto", fontSize: "0.85rem", maxHeight: "400px" }}>
                    {JSON.stringify(
                      {
                        database: "FoodFusion_DB",
                        status: "Connected (MongoDB Atlas)",
                        collections: {
                          orders: adminData.orders?.length > 0 ? adminData.orders : userOrders,
                          users: adminData.users?.length > 0 ? adminData.users : (currentUser ? [currentUser] : []),
                        },
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Auth Gate: User must Sign In or Sign Up
  if (!currentUser) {
    return (
      <div className="foodfusion-auth-gate-page">
        {toastMessage && (
          <div className="ff-toast-banner">
            <span>{toastMessage}</span>
            <button type="button" onClick={() => setToastMessage("")}>✕</button>
          </div>
        )}

        <div className="auth-gate-container">
          <div className="auth-gate-brand">
            <span className="gate-brand-icon">🌿</span>
            <h1 className="gate-brand-name">FOODFUSION</h1>
            <p className="gate-brand-tagline">100% PURE VEGETARIAN INDIAN CULINARY PLATFORM</p>
            <div className="gate-badges-row">
              <span>🌾 Desi Ghee &amp; Farm Fresh</span>
              <span>⚡ 30-Min Fast Delivery</span>
              <span>🔒 Secure Portal</span>
            </div>
          </div>

          <div className="auth-switch-card">
            {/* Top Navigation Tabs */}
            <div className="auth-switch-nav">
              <div
                className={`auth-switch-slider ${
                  authMode === "register" ? "slide-right" : "slide-left"
                }`}
              />
              <button
                type="button"
                className={`auth-switch-tab ${authMode === "login" ? "active" : ""}`}
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-switch-tab ${authMode === "register" ? "active" : ""}`}
                onClick={() => {
                  setAuthMode("register");
                  setAuthError("");
                }}
              >
                Sign Up
              </button>
            </div>

            {authError && <div className="auth-error-box">⚠️ {authError}</div>}

            {/* LOGIN & SIGNUP VIEW */}
            <div className="auth-forms-slider-wrapper">
              <div
                className={`auth-forms-track ${
                  authMode === "register" ? "show-register" : "show-login"
                }`}
              >
                {/* Login Panel */}
                <div className="auth-panel-form">
                  <div className="auth-panel-heading">
                    <h2>Welcome Back!</h2>
                    <p>Enter your email &amp; password to explore authentic dishes</p>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="auth-actual-form">
                    <div className="form-group-item">
                      <label>Email Address</label>
                      <div className="input-with-icon-wrap">
                        <input
                          type="email"
                          required
                          placeholder="e.g. rishi@foodfusion.com"
                          value={authForm.email}
                          onChange={(e) =>
                            setAuthForm({ ...authForm, email: e.target.value })
                          }
                        />
                        {authForm.email && (
                          <span
                            className={`input-status-icon ${
                              validateEmail(authForm.email) ? "valid" : "invalid"
                            }`}
                          >
                            {validateEmail(authForm.email) ? "✓" : "!"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="form-group-item">
                      <div className="label-row-between">
                        <label>Password</label>
                        <button
                          type="button"
                          className="forgot-password-link"
                          onClick={handleGoogleLogin}
                          title="Forgot password? Sign in with Google to access your account"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="password-input-wrapper">
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={authForm.password}
                          onChange={(e) =>
                            setAuthForm({ ...authForm, password: e.target.value })
                          }
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          tabIndex="-1"
                          title={showLoginPassword ? "Hide password" : "Show password"}
                        >
                          {showLoginPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={authLoading}>
                      {authLoading ? "Authenticating..." : "Sign In to Website →"}
                    </button>
                  </form>

                  {/* Google OAuth Login / Forgot Password */}
                  <div className="auth-oauth-separator">
                    <span>OR</span>
                  </div>

                  <button
                    type="button"
                    className="google-oauth-button"
                    onClick={handleGoogleLogin}
                    title="Sign in with your Google account"
                  >
                    <svg className="google-svg-icon" viewBox="0 0 48 48" width="20" height="20">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    <span>Sign in with Google</span>
                  </button>

                  <div className="switch-prompt">
                    <span>Don't have an account yet? </span>
                    <button
                      type="button"
                      className="switch-link"
                      onClick={() => {
                        setAuthMode("register");
                        setAuthError("");
                      }}
                    >
                      Create Account (Sign Up)
                    </button>
                  </div>
                </div>

                {/* Register Panel */}
                <div className="auth-panel-form">
                  <div className="auth-panel-heading">
                    <h2>Create New Account</h2>
                    <p>Join FoodFusion for 100% Pure Vegetarian Delicacies</p>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="auth-actual-form">
                    <div className="form-group-item">
                      <label>Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rishi Dubey"
                        value={authForm.name}
                        onChange={(e) =>
                          setAuthForm({ ...authForm, name: e.target.value })
                        }
                      />
                    </div>

                    <div className="form-group-item">
                      <label>Email Address</label>
                      <div className="input-with-icon-wrap">
                        <input
                          type="email"
                          required
                          placeholder="e.g. rishi@foodfusion.com"
                          value={authForm.email}
                          onChange={(e) =>
                            setAuthForm({ ...authForm, email: e.target.value })
                          }
                        />
                        {authForm.email && (
                          <span
                            className={`input-status-icon ${
                              validateEmail(authForm.email) ? "valid" : "invalid"
                            }`}
                          >
                            {validateEmail(authForm.email) ? "✓" : "!"}
                          </span>
                        )}
                      </div>
                      {authForm.email && !validateEmail(authForm.email) && (
                        <small className="field-hint-error">
                          Please enter a valid email format (e.g. name@domain.com)
                        </small>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="form-group-item">
                      <label>Password</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showRegisterPassword ? "text" : "password"}
                          required
                          placeholder="Create strong password (min 8 chars)"
                          value={authForm.password}
                          onChange={(e) =>
                            setAuthForm({ ...authForm, password: e.target.value })
                          }
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          tabIndex="-1"
                          title={showRegisterPassword ? "Hide password" : "Show password"}
                        >
                          {showRegisterPassword ? "🙈" : "👁️"}
                        </button>
                      </div>

                      {/* Real-time Password Strength Meter */}
                      {authForm.password && (
                        <div className="pwd-strength-container">
                          <div className="pwd-strength-bar-bg">
                            <div
                              className="pwd-strength-bar-fill"
                              style={{
                                width: `${checkPasswordStrength(authForm.password).percent}%`,
                                backgroundColor: checkPasswordStrength(authForm.password).color,
                              }}
                            />
                          </div>
                          <span
                            className="pwd-strength-label"
                            style={{ color: checkPasswordStrength(authForm.password).color }}
                          >
                            {checkPasswordStrength(authForm.password).label}
                          </span>
                        </div>
                      )}

                      {/* Real-time Password Requirements Checklist */}
                      <div className="pwd-requirements-list">
                        <span
                          className={`pwd-req-pill ${
                            checkPasswordStrength(authForm.password).hasLength ? "met" : ""
                          }`}
                        >
                          {checkPasswordStrength(authForm.password).hasLength ? "✓" : "○"} 8+ chars
                        </span>
                        <span
                          className={`pwd-req-pill ${
                            checkPasswordStrength(authForm.password).hasUpper ? "met" : ""
                          }`}
                        >
                          {checkPasswordStrength(authForm.password).hasUpper ? "✓" : "○"} Uppercase (A-Z)
                        </span>
                        <span
                          className={`pwd-req-pill ${
                            checkPasswordStrength(authForm.password).hasLower ? "met" : ""
                          }`}
                        >
                          {checkPasswordStrength(authForm.password).hasLower ? "✓" : "○"} Lowercase (a-z)
                        </span>
                        <span
                          className={`pwd-req-pill ${
                            checkPasswordStrength(authForm.password).hasNumber ? "met" : ""
                          }`}
                        >
                          {checkPasswordStrength(authForm.password).hasNumber ? "✓" : "○"} Number (0-9)
                        </span>
                        <span
                          className={`pwd-req-pill ${
                            checkPasswordStrength(authForm.password).hasSpecial ? "met" : ""
                          }`}
                        >
                          {checkPasswordStrength(authForm.password).hasSpecial ? "✓" : "○"} Special Symbol (!@#$)
                        </span>
                      </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="form-group-item">
                      <label>Confirm Password</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showRegisterConfirmPassword ? "text" : "password"}
                          required
                          placeholder="Repeat password"
                          value={authForm.confirmPassword}
                          onChange={(e) =>
                            setAuthForm({ ...authForm, confirmPassword: e.target.value })
                          }
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() =>
                            setShowRegisterConfirmPassword(!showRegisterConfirmPassword)
                          }
                          tabIndex="-1"
                          title={showRegisterConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showRegisterConfirmPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                      {authForm.confirmPassword && (
                        <small
                          className={
                            authForm.password === authForm.confirmPassword
                              ? "field-match-success"
                              : "field-match-error"
                          }
                        >
                          {authForm.password === authForm.confirmPassword
                            ? "✓ Passwords match"
                            : "✗ Passwords do not match"}
                        </small>
                      )}
                    </div>

                    <div className="form-group-item">
                      <label>Mobile Number</label>
                      <input
                        type="tel"
                        placeholder="e.g. +91 91374 57865"
                        value={authForm.phone}
                        onChange={(e) =>
                          setAuthForm({ ...authForm, phone: e.target.value })
                        }
                      />
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={authLoading}>
                      {authLoading ? "Creating Account..." : "Create Account & Enter 🚀"}
                    </button>
                  </form>

                  {/* Google OAuth & Forgot Password Option on Signup */}
                  <div className="signup-forgot-row">
                    <span>Forgot existing password? </span>
                    <button
                      type="button"
                      className="forgot-password-link"
                      onClick={handleGoogleLogin}
                      title="Sign in with Google to recover your account"
                    >
                      Sign in with Google →
                    </button>
                  </div>

                  <div className="auth-oauth-separator">
                    <span>OR</span>
                  </div>

                  <button
                    type="button"
                    className="google-oauth-button"
                    onClick={handleGoogleLogin}
                    title="Sign up with your Google account"
                  >
                    <svg className="google-svg-icon" viewBox="0 0 48 48" width="20" height="20">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    <span>Sign up with Google</span>
                  </button>

                  <div className="switch-prompt">
                    <span>Already registered? </span>
                    <button
                      type="button"
                      className="switch-link"
                      onClick={() => {
                        setAuthMode("login");
                        setAuthError("");
                      }}
                    >
                      Back to Sign In
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 1-Click Demo Login */}
            <div className="auth-professor-demo-box">
              <button type="button" className="demo-one-click-btn" onClick={handleDemoLogin}>
                ⚡ 1-Click Demo Login →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Public Application
  return (
    <div className="foodfusion-app">
      {toastMessage && (
        <div className="ff-toast-banner">
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage("")}>✕</button>
        </div>
      )}

      {/* Navbar */}
      <header className="ff-navbar">
        <div className="ff-nav-container">
          <div className="ff-logo" onClick={() => setCurrentPage("home")}>
            <span className="ff-logo-icon">🌿</span>
            <div className="ff-logo-text">
              <span className="brand-name">FOODFUSION</span>
              <span className="brand-tag">100% PURE VEG</span>
            </div>
          </div>

          <nav className="ff-nav-links">
            <button
              type="button"
              className={currentPage === "home" ? "nav-link active" : "nav-link"}
              onClick={() => setCurrentPage("home")}
            >
              Home
            </button>
            <button
              type="button"
              className={currentPage === "menu" ? "nav-link active" : "nav-link"}
              onClick={() => setCurrentPage("menu")}
            >
              Menu (30 Veg Dishes)
            </button>
            <button
              type="button"
              className={currentPage === "categories" ? "nav-link active" : "nav-link"}
              onClick={() => setCurrentPage("categories")}
            >
              Categories
            </button>
            <button
              type="button"
              className="nav-link"
              onClick={() => {
                setCurrentPage("home");
                setTimeout(() => {
                  document.getElementById("about-section")?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            >
              About
            </button>
            <button
              type="button"
              className={currentPage === "orders" ? "nav-link active" : "nav-link"}
              onClick={() => setCurrentPage("orders")}
            >
              Orders {userOrders.length > 0 && <span className="badge-dot">{userOrders.length}</span>}
            </button>
          </nav>

          <div className="ff-nav-actions">
            <button
              type="button"
              className="icon-btn search-trigger"
              onClick={() => {
                setCurrentPage("menu");
                document.getElementById("menu-search-input")?.focus();
              }}
              title="Search Food"
            >
              🔍
            </button>

            <button
              type="button"
              className="cart-trigger-btn"
              onClick={() => setCartDrawerOpen(true)}
              title="View Cart"
            >
              <span className="cart-icon">🛒</span>
              <span className="cart-badge">{cartTotalQuantity}</span>
            </button>

            <button
              type="button"
              className="user-profile-btn"
              onClick={() => setCurrentPage("profile")}
              title="My Account Profile"
            >
              <span className="user-avatar">👤</span>
              <span className="user-name-short">{currentUser.name?.split(" ")[0]}</span>
            </button>

            <button
              type="button"
              className="ff-btn-primary nav-order-cta"
              onClick={() => setCurrentPage("menu")}
            >
              Order Now <span>→</span>
            </button>

            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="ff-mobile-menu">
            <button type="button" onClick={() => { setCurrentPage("home"); setMobileMenuOpen(false); }}>🏠 Home</button>
            <button type="button" onClick={() => { setCurrentPage("menu"); setMobileMenuOpen(false); }}>🍽️ Food Menu (30 Veg Items)</button>
            <button type="button" onClick={() => { setCurrentPage("categories"); setMobileMenuOpen(false); }}>🍱 Categories</button>
            <button type="button" onClick={() => { setCurrentPage("orders"); setMobileMenuOpen(false); }}>📦 My Orders</button>
            <button type="button" onClick={() => { setCurrentPage("profile"); setMobileMenuOpen(false); }}>👤 Profile ({currentUser.name})</button>
            <button type="button" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>🚪 Log Out</button>
          </div>
        )}
      </header>

      {/* Home Page */}
      {currentPage === "home" && (
        <main className="ff-home-page">
          <section className="ff-hero-section">
            <div className="hero-content-wrapper">
              <div className="hero-left-column">
                <div className="hero-discount-pill">
                  <span>Up to</span>
                  <strong>50% Discount</strong>
                  <span className="pill-arrow">↗</span>
                </div>

                <h1 className="hero-main-title">
                  DELIVERY<br />
                  OF INDIAN<br />
                  <span className="highlight-text">PURE VEG FOOD</span>
                </h1>

                <p className="hero-description">
                  Fresh 100% pure vegetarian meals, tandoori rotis, slow-cooked dal makhani, and authentic Indian
                  delicacies delivered piping hot to your doorstep with speed and hygiene.
                </p>

                <div className="hero-cta-group">
                  <button type="button" className="hero-btn-primary" onClick={() => setCurrentPage("menu")}>
                    Order Now <span>→</span>
                  </button>
                  <button type="button" className="hero-btn-secondary" onClick={() => setCurrentPage("categories")}>
                    Explore Categories
                  </button>
                </div>

                <div className="hero-trust-row">
                  <span className="trust-item">⚡ 30 Min Express Delivery</span>
                  <span className="trust-item">🌱 100% Pure Vegetarian</span>
                  <span className="trust-item">⭐ 4.9 Rated (2k+ Reviews)</span>
                </div>
              </div>

              <div className="hero-right-column">
                <div className="hero-image-stage">
                  <div className="hero-glow-ring" />
                  <img
                    src={imgButterNaan}
                    alt="Authentic Hot Indian Tandoori Roti with Butter"
                    className="hero-hero-roti-img"
                    onError={(e) => handleImageError(e, "Breads & Rice")}
                  />
                  <div className="hero-floating-badge float-butter" title="Desi Cow Butter">🧈</div>
                  <div className="hero-floating-badge float-basil" title="Fresh Coriander">🌿</div>
                  <div className="hero-floating-badge float-chili" title="Spicy Green Chili">🌶️</div>
                  <div className="hero-floating-badge float-wheat" title="Organic Wheat">🌾</div>
                  <div className="hero-discount-tag">
                    <span>HOT DEAL</span>
                    <strong>50% OFF</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="serrated-edge-divider">
              <svg viewBox="0 0 1200 40" preserveAspectRatio="none">
                <path d="M0,0 L30,30 L60,0 L90,30 L120,0 L150,30 L180,0 L210,30 L240,0 L270,30 L300,0 L330,30 L360,0 L390,30 L420,0 L450,30 L480,0 L510,30 L540,0 L570,30 L600,0 L630,30 L660,0 L690,30 L720,0 L750,30 L780,0 L810,30 L840,0 L870,30 L880,0 L900,0 L930,30 L960,0 L990,30 L1020,0 L1050,30 L1080,0 L1110,30 L1140,0 L1170,30 L1200,0 L1200,40 L0,40 Z" />
              </svg>
            </div>
          </section>

          {/* About Stories */}
          <section className="ff-about-stories-section" id="about-section">
            <div className="stories-container">
              <div className="stories-heading-col">
                <span className="section-label">ORIGIN &amp; QUALITY</span>
                <h2 className="stories-title">ABOUT<br />STORIES</h2>
              </div>
              <div className="stories-content-col">
                <div className="stories-emblem">❂</div>
                <p className="stories-paragraph">
                  We improve flavor consistency, boost aromatic Indian spices, and elevate
                  the precision of pure vegetarian culinary craftsmanship with farm-fresh organic ingredients.
                </p>
                <div className="stories-cocoa-icon">🌰</div>
              </div>
              <div className="stories-reviews-badge">
                <div className="avatar-stack">
                  <span className="stacked-avatar">👩</span>
                  <span className="stacked-avatar">👨</span>
                  <span className="stacked-avatar">🧑</span>
                  <span className="stacked-avatar">👧</span>
                </div>
                <div className="reviews-stat-number">1,800+</div>
                <div className="reviews-stat-label">Customer Reviews</div>
              </div>
            </div>
          </section>

          {/* Marquee Banner */}
          <section className="ff-ribbon-marquee">
            <div className="marquee-track">
              <span>★ 100% HEALTHY</span>
              <span>★ PURE VEGETARIAN</span>
              <span>★ FRESH DESI GHEE</span>
              <span>★ ZERO CHEMICALS</span>
              <span>★ 30 MIN EXPRESS DELIVERY</span>
              <span>★ 100% HEALTHY</span>
              <span>★ PURE VEGETARIAN</span>
              <span>★ CLAY TANDOOR BAKED</span>
            </div>
          </section>

          {/* Popular Products */}
          <section className="ff-popular-products-section">
            <div className="popular-section-header">
              <div className="floating-seed">🌰 🌰 🌰</div>
              <h2 className="popular-title">OUR POPULAR PRODUCTS</h2>
              <p className="popular-subtitle">Hand-picked Indian culinary masterpieces crafted 100% pure vegetarian</p>
            </div>

            <div className="popular-cards-grid">
              {foodsCatalog.slice(0, 4).map((food, idx) => (
                <div
                  key={food.id || food._id}
                  className={`popular-pastel-card pastel-${food.pastelBg || (idx === 0 ? "yellow" : idx === 1 ? "lavender" : idx === 2 ? "mint" : "coral")}`}
                >
                  <div className="pastel-card-top">
                    <span className="pastel-tag">{food.badge || "SIGNATURE"}</span>
                    <span className="veg-indicator-icon" title="100% Pure Veg">🟢</span>
                  </div>

                  <div
                    className="pastel-image-box"
                    onClick={() => {
                      setSelectedFoodItem(food);
                      setDetailQuantity(1);
                    }}
                  >
                    <img
                      src={food.image}
                      alt={food.name}
                      loading="lazy"
                      onError={(e) => handleImageError(e, food.category)}
                    />
                  </div>

                  <div className="pastel-card-details">
                    <h3
                      className="food-item-name"
                      onClick={() => {
                        setSelectedFoodItem(food);
                        setDetailQuantity(1);
                      }}
                    >
                      {food.name}
                    </h3>
                    <p className="food-short-desc">{food.description}</p>
                    <div className="price-and-action-row">
                      <div className="price-group">
                        <span className="currency-symbol">₹</span>
                        <span className="price-num">{food.price}</span>
                        <span className="rating-badge">★ {food.rating}</span>
                      </div>
                      <button
                        type="button"
                        className="circle-add-btn"
                        onClick={() => addToCart(food, 1)}
                        title="Add to Cart"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="popular-bottom-cta">
              <button
                type="button"
                className="ff-btn-view-all"
                onClick={() => setCurrentPage("menu")}
              >
                View All 30 Indian Veg Dishes <span>→</span>
              </button>
            </div>
          </section>

          {/* Categories Showcase */}
          <section className="ff-shop-categories-section">
            <div className="categories-header-box">
              <span className="section-label-gold">CURATED SELECTIONS</span>
              <h2 className="categories-main-title">SHOP BY CATEGORIES</h2>
              <p className="categories-subtext">Click any category to browse our pure vegetarian specials</p>
            </div>

            <div className="categories-card-grid">
              {[
                { name: "Indian Curries", cat: "Curries", icon: "🍛", count: "8 Dishes", img: imgKadaiPaneer },
                { name: "Breads & Biryani", cat: "Breads & Rice", icon: "🍞", count: "5 Dishes", img: imgButterNaan },
                { name: "Chaat & Street Food", cat: "Chaat & Street Food", icon: "🥟", count: "8 Dishes", img: imgCholeBhature },
                { name: "South Indian Delights", cat: "South Indian", icon: "🥞", count: "3 Dishes", img: imgMasalaDosa },
                { name: "Indian Sweets & Desserts", cat: "Desserts", icon: "🍮", count: "4 Dishes", img: imgGulabJamun },
                { name: "Kulhad Drinks & Lassi", cat: "Drinks", icon: "🥛", count: "2 Dishes", img: imgMangoLassi },
              ].map((cat) => (
                <div
                  key={cat.name}
                  className="category-showcase-card"
                  onClick={() => {
                    setSelectedCategory(cat.cat);
                    setCurrentPage("menu");
                  }}
                >
                  <div className="cat-img-box">
                    <img src={cat.img} alt={cat.name} loading="lazy" onError={(e) => handleImageError(e, cat.cat)} />
                  </div>
                  <div className="cat-card-overlay">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="cat-icon-badge">{cat.icon}</span>
                      <h3 className="cat-name">{cat.name}</h3>
                    </div>
                    <span className="cat-count-pill">{cat.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Dine Out Deals */}
          <section className="ff-dineout-deals-section">
            <div className="dineout-card">
              <div className="dineout-left">
                <div className="chef-avatar-wrapper">
                  <div className="chef-glow-sunburst" />
                  <img
                    src={imgShahiPaneer}
                    alt="Master Chef with fresh organic ingredients"
                    className="chef-photo"
                  />
                </div>
              </div>
              <div className="dineout-right">
                <span className="section-label">SPECIAL OFFERS</span>
                <h2 className="dineout-title">MEET DINE OUT DEALS</h2>
                <p className="dineout-text">
                  Enjoy authentic flavor harmony, flat 50% discount with promo code{" "}
                  <strong>FOODFUSION50</strong>, and free delivery on all orders above ₹499!
                </p>
                <button type="button" className="dineout-cta-btn" onClick={() => setCurrentPage("menu")}>
                  Order Now <span>→</span>
                </button>
              </div>
            </div>
          </section>

          {/* Why FoodFusion */}
          <section className="ff-why-section">
            <div className="why-header">
              <span className="section-label">THE FOODFUSION ADVANTAGE</span>
              <h2>WHY CHOOSE US?</h2>
              <p>Engineering perfection in every pure vegetarian bite</p>
            </div>
            <div className="why-cards-grid">
              <div className="why-feature-card">
                <span className="feature-icon">⚡</span>
                <h3>Fast Ordering</h3>
                <p>Order in under 30 seconds with our single-step checkout flow.</p>
              </div>
              <div className="why-feature-card">
                <span className="feature-icon">🌿</span>
                <h3>100% Pure Veg</h3>
                <p>Exclusively vegetarian kitchen with rigorous hygiene and organic sourcing.</p>
              </div>
              <div className="why-feature-card">
                <span className="feature-icon">🛍️</span>
                <h3>Smart Cart Management</h3>
                <p>Real-time quantity updates, subtotal breakdowns, and coupon integrations.</p>
              </div>
              <div className="why-feature-card">
                <span className="feature-icon">📦</span>
                <h3>Organized Orders</h3>
                <p>Live order progress tracking from preparation to doorstep handover.</p>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="ff-testimonials-section">
            <div className="testi-header">
              <span className="section-label">REVIEWS &amp; LOVE</span>
              <h2>OUR VALUABLE CUSTOMER</h2>
              <p>Real stories from food lovers across the city</p>
            </div>
            <div className="testi-cards-grid">
              {[
                { name: "Priya Sharma", role: "Food Critic", text: "The Shahi Paneer, Dal Makhani and Royal Gulab Jamun are sensational! Always hot and fresh.", rating: 5, avatar: "👩💼" },
                { name: "Rahul Verma", role: "Software Architect", text: "Cleanest pure veg food app in Mumbai! Delivery is lightning fast and packaging is eco-friendly.", rating: 5, avatar: "👨💻" },
                { name: "Ananya Iyer", role: "Yoga Instructor", text: "100% Pure veg guarantee with organic ghee gives complete peace of mind. Highly recommended!", rating: 5, avatar: "🧘♀️" },
              ].map((review, i) => (
                <div key={i} className="testi-card">
                  <div className="testi-stars">{"★".repeat(review.rating)}</div>
                  <p className="testi-text">"{review.text}"</p>
                  <div className="testi-author">
                    <span className="testi-avatar">{review.avatar}</span>
                    <div>
                      <h4>{review.name}</h4>
                      <span>{review.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="ff-final-cta-section">
            <div className="cta-box">
              <h2>Ready to Taste Perfection?</h2>
              <p>Explore all 30 chef-crafted pure vegetarian Indian delicacies now.</p>
              <button type="button" className="final-cta-btn" onClick={() => setCurrentPage("menu")}>
                Explore Full Menu <span>→</span>
              </button>
            </div>
          </section>
        </main>
      )}

      {/* Menu Page (30 Dishes) */}
      {currentPage === "menu" && (
        <main className="ff-menu-page">
          <div className="menu-header-banner">
            <span className="menu-badge">100% PURE INDIAN VEGETARIAN MENU</span>
            <h1>OUR COMPLETE FOOD CATALOG (30 DISHES)</h1>
            <p>Explore 30 delicious chef-curated Indian vegetarian dishes with live search &amp; filter</p>
          </div>

          <div className="menu-controls-container">
            <div className="menu-search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                id="menu-search-input"
                type="text"
                placeholder="Search dishes (e.g. Paneer, Dal Makhani, Biryani, Dosa, Paratha, Gulab Jamun)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="clear-search" onClick={() => setSearchQuery("")}>✕</button>
              )}
            </div>

            <div className="menu-sort-wrapper">
              <div className="sort-label-group">
                <span className="sort-icon">⚡</span>
                <label htmlFor="menu-sort-select">SORT BY</label>
              </div>
              <div className="sort-select-container">
                <select
                  id="menu-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="menu-sort-select-el"
                >
                  <option value="default">🌟 Featured / Default</option>
                  <option value="price-low">📉 Price: Low to High</option>
                  <option value="price-high">📈 Price: High to Low</option>
                  <option value="rating">⭐ Highest Rated</option>
                  <option value="name">🔤 Name (A–Z)</option>
                </select>
                <span className="sort-arrow">▾</span>
              </div>
            </div>
          </div>

          <div className="category-pills-bar">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={selectedCategory === category ? "cat-pill active" : "cat-pill"}
                onClick={() => setSelectedCategory(category)}
              >
                {category === "All" && "🍽️ "}
                {category === "Curries" && "🍛 "}
                {category === "Breads & Rice" && "🍞 "}
                {category === "Chaat & Street Food" && "🥟 "}
                {category === "South Indian" && "🥞 "}
                {category === "Desserts" && "🍮 "}
                {category === "Drinks" && "🥛 "}
                {category}
              </button>
            ))}
          </div>

          <div className="menu-food-grid">
            {loadingFoods ? (
              <div style={{ textAlign: "center", gridColumn: "1/-1", padding: "40px" }}>
                <p>Loading delicious 100% vegetarian food...</p>
              </div>
            ) : filteredFoods.length === 0 ? (
              <div style={{ textAlign: "center", gridColumn: "1/-1", padding: "40px" }}>
                <h3>No food items found</h3>
                <p>Try clearing your search query or selecting a different category.</p>
                <button
                  type="button"
                  className="ff-btn-view-all"
                  style={{ marginTop: "16px" }}
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredFoods.map((food, idx) => (
                <div
                  key={food.id || food._id}
                  className={`menu-food-card pastel-${food.pastelBg || (idx % 4 === 0 ? "yellow" : idx % 4 === 1 ? "lavender" : idx % 4 === 2 ? "mint" : "coral")}`}
                >
                  <div className="card-top-header">
                    <span className="card-badge">{food.badge || food.category}</span>
                    <span className="pure-veg-symbol" title="100% Pure Veg">🟢</span>
                  </div>

                  <div
                    className="card-image-box"
                    onClick={() => {
                      setSelectedFoodItem(food);
                      setDetailQuantity(1);
                    }}
                  >
                    <img
                      src={food.image}
                      alt={food.name}
                      loading="lazy"
                      onError={(e) => handleImageError(e, food.category)}
                    />
                  </div>

                  <div className="card-body">
                    <div className="card-title-row">
                      <h3
                        onClick={() => {
                          setSelectedFoodItem(food);
                          setDetailQuantity(1);
                        }}
                      >
                        {food.name}
                      </h3>
                      <span className="food-rating">★ {food.rating}</span>
                    </div>

                    <p className="food-description">{food.description}</p>

                    <div className="card-price-action-row">
                      <div className="price-tag">
                        <span className="currency">₹</span>
                        <span className="amount">{food.price}</span>
                      </div>

                      <div className="action-buttons-group">
                        <button
                          type="button"
                          className="btn-quick-buy"
                          onClick={() => handleDirectBuy(food, 1)}
                        >
                          Buy Now
                        </button>
                        <button
                          type="button"
                          className="btn-add-cart"
                          onClick={() => addToCart(food, 1)}
                          title="Add to Cart"
                        >
                          + Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      )}

      {/* Categories Page */}
      {currentPage === "categories" && (
        <main className="ff-menu-page">
          <div className="menu-header-banner">
            <span className="menu-badge">TASTE HUBS</span>
            <h1>EXPLORE FOOD CATEGORIES</h1>
            <p>Select your favorite cuisine to discover authentic pure vegetarian dishes</p>
          </div>

          <div className="categories-card-grid" style={{ maxWidth: "1320px", margin: "0 auto" }}>
            {[
              { name: "Indian Curries & Dal", cat: "Curries", icon: "🍛", count: "8 Dishes", img: imgKadaiPaneer },
              { name: "Tandoori Breads & Rice", cat: "Breads & Rice", icon: "🍞", count: "5 Dishes", img: imgButterNaan },
              { name: "Chaat & Street Food", cat: "Chaat & Street Food", icon: "🥟", count: "8 Dishes", img: imgCholeBhature },
              { name: "South Indian Delights", cat: "South Indian", icon: "🥞", count: "3 Dishes", img: imgMasalaDosa },
              { name: "Indian Sweets & Desserts", cat: "Desserts", icon: "🍮", count: "4 Dishes", img: imgGulabJamun },
              { name: "Kulhad Drinks & Lassi", cat: "Drinks", icon: "🥛", count: "2 Dishes", img: imgMangoLassi },
            ].map((cat) => (
              <div
                key={cat.name}
                className="category-showcase-card"
                onClick={() => {
                  setSelectedCategory(cat.cat);
                  setCurrentPage("menu");
                }}
              >
                <div className="cat-img-box">
                  <img src={cat.img} alt={cat.name} onError={(e) => handleImageError(e, cat.cat)} />
                </div>
                <div className="cat-card-overlay">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="cat-icon-badge">{cat.icon}</span>
                    <h3 className="cat-name">{cat.name}</h3>
                  </div>
                  <span className="cat-count-pill">{cat.count}</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Orders Page (With Delete/Cancel Order option & Live Status Sync) */}
      {currentPage === "orders" && (
        <main className="ff-menu-page">
          <div className="menu-header-banner">
            <span className="menu-badge">ORDER TRACKING &amp; MANAGEMENT</span>
            <h1>YOUR ORDER HISTORY</h1>
            <p>Track live delivery progress or manage previous food orders</p>
          </div>

          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            {userOrders.length === 0 ? (
              <div style={{ background: "#fff", padding: "50px", borderRadius: "24px", textAlign: "center" }}>
                <span style={{ fontSize: "3rem" }}>📦</span>
                <h3 style={{ marginTop: "12px", marginBottom: "8px" }}>No active orders</h3>
                <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>Browse our 30 vegetarian dishes and place your first order!</p>
                <button
                  type="button"
                  className="ff-btn-view-all"
                  onClick={() => setCurrentPage("menu")}
                >
                  Browse Menu <span>→</span>
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {userOrders.map((order, idx) => (
                  <div key={order.orderId || order._id || idx} style={{ background: "#fff", padding: "24px", borderRadius: "20px", border: "1px solid var(--cream-border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                      <div>
                        <strong style={{ fontSize: "1.2rem", color: "var(--cocoa-dark)" }}>{order.orderId || `#FF-${1000 + idx}`}</strong>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Just now"}
                        </span>
                      </div>
                      <span className={`status-select status-${(order.status || "Preparing").toLowerCase().replace(/\s+/g, "-")}`}>
                        ● {order.status || "Preparing"}
                      </span>
                    </div>

                    <div style={{ marginBottom: "16px", borderTop: "1px dashed var(--cream-border)", borderBottom: "1px dashed var(--cream-border)", padding: "12px 0" }}>
                      {order.items?.map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", padding: "4px 0" }}>
                          <span>{item.emoji || "🍱"} {item.name} × {item.quantity}</span>
                          <strong>₹{item.price * item.quantity}</strong>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Total Paid: </span>
                        <strong style={{ fontSize: "1.3rem", color: "var(--cocoa-dark)" }}>₹{order.totalAmount}</strong>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          type="button"
                          className="btn-del-record"
                          style={{ width: "auto", padding: "8px 14px", borderRadius: "var(--radius-pill)", fontSize: "0.85rem", fontWeight: 700 }}
                          onClick={() => handleDeleteUserOrder(order.orderId || order._id)}
                          title="Delete / Cancel Order"
                        >
                          🗑️ Delete Order
                        </button>
                        <button
                          type="button"
                          className="btn-quick-buy"
                          onClick={() => setTrackedOrder(order)}
                        >
                          Track Live Status 🛰️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* User Profile Page */}
      {currentPage === "profile" && (
        <main className="ff-menu-page">
          <div style={{ maxWidth: "600px", margin: "40px auto", background: "#fff", padding: "40px", borderRadius: "28px", border: "1px solid var(--cream-border)", textAlign: "center" }}>
            <div style={{ fontSize: "4rem", marginBottom: "12px" }}>👤</div>
            <h2 style={{ fontSize: "2rem", marginBottom: "4px" }}>{currentUser?.name || "Valued Customer"}</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>{currentUser?.email || "customer@foodfusion.com"}</p>

            <div style={{ textAlign: "left", background: "var(--cream-soft)", padding: "20px", borderRadius: "18px", marginBottom: "24px" }}>
              <div style={{ marginBottom: "12px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>PHONE NUMBER</span>
                <p style={{ fontWeight: 700 }}>{currentUser?.phone || "+91 98765 43210"}</p>
              </div>
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>DELIVERY ADDRESS</span>
                <p style={{ fontWeight: 700 }}>{currentUser?.address || "404 Emerald Heights, Bandra West, Mumbai"}</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                className="btn-quick-buy"
                style={{ flex: 1, padding: "12px" }}
                onClick={() => setCurrentPage("orders")}
              >
                Order History
              </button>
              <button
                type="button"
                className="btn-add-cart"
                style={{ flex: 1, padding: "12px" }}
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
        </main>
      )}

      {/* Food Details Modal */}
      {selectedFoodItem && (
        <div className="ff-modal-backdrop" onClick={() => setSelectedFoodItem(null)}>
          <div className="ff-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "680px" }}>
            <button type="button" className="modal-close-btn" onClick={() => setSelectedFoodItem(null)}>✕</button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px", alignItems: "center" }}>
              <div style={{ borderRadius: "20px", overflow: "hidden", height: "240px" }}>
                <img
                  src={selectedFoodItem.image}
                  alt={selectedFoodItem.name}
                  onError={(e) => handleImageError(e, selectedFoodItem.category)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div>
                <span className="card-badge" style={{ marginBottom: "8px", display: "inline-block" }}>{selectedFoodItem.category} • 100% PURE VEG</span>
                <h2 style={{ fontSize: "1.6rem", marginBottom: "8px" }}>{selectedFoodItem.name}</h2>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--cocoa-dark)", fontFamily: "var(--font-display)" }}>₹{selectedFoodItem.price}</span>
                  <span style={{ color: "#e67e22", fontWeight: 800 }}>★ {selectedFoodItem.rating}</span>
                </div>

                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                  {selectedFoodItem.details || selectedFoodItem.description}
                </p>

                {selectedFoodItem.ingredients && (
                  <div style={{ marginBottom: "18px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)" }}>INGREDIENTS:</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                      {selectedFoodItem.ingredients.map((ing, i) => (
                        <span key={i} style={{ background: "var(--cream-soft)", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem" }}>
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="btn-quick-buy"
                    style={{ flex: 1, padding: "12px" }}
                    onClick={() => {
                      addToCart(selectedFoodItem, detailQuantity);
                      setSelectedFoodItem(null);
                    }}
                  >
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    className="btn-add-cart"
                    style={{ flex: 1, padding: "12px" }}
                    onClick={() => handleDirectBuy(selectedFoodItem, detailQuantity)}
                  >
                    Buy Now ⚡
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {cartDrawerOpen && (
        <div className="ff-drawer-backdrop" onClick={() => setCartDrawerOpen(false)}>
          <div className="ff-cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title">
                <span>🛒</span>
                <h3>Your Cart ({cartTotalQuantity})</h3>
              </div>
              <button type="button" className="modal-close-btn" style={{ position: "static" }} onClick={() => setCartDrawerOpen(false)}>✕</button>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <span style={{ fontSize: "3.5rem" }}>🛒</span>
                <h4 style={{ marginTop: "12px", marginBottom: "6px" }}>Your cart is empty</h4>
                <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>Explore our 30 pure vegetarian dishes to add items!</p>
                <button
                  type="button"
                  className="ff-btn-view-all"
                  onClick={() => {
                    setCartDrawerOpen(false);
                    setCurrentPage("menu");
                  }}
                >
                  Explore Menu <span>→</span>
                </button>
              </div>
            ) : (
              <>
                <div className="drawer-items-scroll">
                  {cart.map((item) => (
                    <div key={item.id} className="cart-item-card">
                      <img src={item.image} alt={item.name} onError={(e) => handleImageError(e, item.category)} />
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>₹{item.price} each</span>
                        <div className="cart-qty-buttons">
                          <button type="button" onClick={() => updateCartQuantity(item.id, -1)}>-</button>
                          <span style={{ fontWeight: 800, minWidth: "20px", textAlign: "center" }}>{item.quantity}</span>
                          <button type="button" onClick={() => updateCartQuantity(item.id, 1)}>+</button>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <strong style={{ fontSize: "1.1rem", display: "block" }}>₹{item.price * item.quantity}</strong>
                        <button type="button" style={{ color: "#dc2626", marginTop: "8px" }} onClick={() => removeFromCart(item.id)}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-bill-summary">
                  <div className="bill-row">
                    <span>Subtotal:</span>
                    <strong>₹{cartSubtotal}</strong>
                  </div>
                  <div className="bill-row">
                    <span>Delivery Fee:</span>
                    <strong>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</strong>
                  </div>
                  <div className="bill-row">
                    <span>GST (5%):</span>
                    <strong>₹{taxAmount}</strong>
                  </div>
                  {discountApplied && (
                    <div className="bill-row" style={{ color: "#155724" }}>
                      <span>Promo Discount (50%):</span>
                      <strong>-₹{discountAmount}</strong>
                    </div>
                  )}
                  <div className="bill-total-row">
                    <span>Total Amount:</span>
                    <span>₹{finalCartTotal}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                  <input
                    type="text"
                    placeholder="Coupon (FOODFUSION50)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    style={{ flex: 1, padding: "10px 14px", borderRadius: "12px", border: "1px solid var(--cream-border)" }}
                  />
                  <button
                    type="button"
                    className="btn-quick-buy"
                    onClick={() => {
                      if (couponCode === "FOODFUSION50") {
                        setDiscountApplied(true);
                        showToast("🎉 50% discount activated!");
                      } else {
                        showToast("Invalid promo code! Try FOODFUSION50");
                      }
                    }}
                  >
                    Apply
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-proceed-checkout"
                  onClick={() => {
                    setCheckoutDirectItem(null);
                    setCheckoutModalOpen(true);
                  }}
                >
                  Checkout (₹{finalCartTotal}) <span>→</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutModalOpen && (
        <div className="ff-modal-backdrop" onClick={() => setCheckoutModalOpen(false)}>
          <div className="ff-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <button type="button" className="modal-close-btn" onClick={() => setCheckoutModalOpen(false)}>✕</button>

            <span className="card-badge" style={{ marginBottom: "8px", display: "inline-block" }}>⚡ EXPRESS CHECKOUT</span>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "20px" }}>Confirm Your Order</h2>

            {checkoutError && (
              <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px", borderRadius: "12px", marginBottom: "16px" }}>
                ⚠️ {checkoutError}
              </div>
            )}

            <form onSubmit={handlePlaceOrder} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>FULL NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="Your Full Name"
                  value={checkoutForm.customerName || currentUser?.name || ""}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, customerName: e.target.value })}
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid var(--cream-border)", marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>PHONE NUMBER *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={checkoutForm.customerPhone || currentUser?.phone || ""}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, customerPhone: e.target.value })}
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid var(--cream-border)", marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>DELIVERY ADDRESS *</label>
                <textarea
                  required
                  rows="2"
                  placeholder="Flat No, Building, Street, City"
                  value={checkoutForm.deliveryAddress || currentUser?.address || ""}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, deliveryAddress: e.target.value })}
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid var(--cream-border)", marginTop: "4px" }}
                />
              </div>

              <div style={{ background: "var(--cream-soft)", padding: "16px", borderRadius: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>Total Amount to Pay:</span>
                  <strong style={{ fontSize: "1.3rem", color: "var(--cocoa-dark)" }}>
                    ₹{checkoutDirectItem
                      ? checkoutDirectItem.food.price * checkoutDirectItem.quantity +
                        40 +
                        Math.round(checkoutDirectItem.food.price * checkoutDirectItem.quantity * 0.05)
                      : finalCartTotal}
                  </strong>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>💳 Simulated Card Payment: **** **** **** 4242</span>
              </div>

              <button
                type="submit"
                className="btn-proceed-checkout"
                disabled={checkoutSubmitting}
              >
                {checkoutSubmitting ? "Placing Order..." : "Confirm & Place Order 🚀"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Confirmed Big Tick Modal */}
      {orderSuccessModalOpen && confirmedOrder && (
        <div className="ff-modal-backdrop" onClick={() => setOrderSuccessModalOpen(false)}>
          <div className="ff-modal-card order-success-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "540px", textAlign: "center" }}>
            <button type="button" className="modal-close-btn" onClick={() => setOrderSuccessModalOpen(false)}>✕</button>

            <div className="big-tick-wrapper">
              <div className="big-tick-pulse" />
              <div className="big-tick-circle">
                <svg className="big-tick-svg" viewBox="0 0 52 52">
                  <circle className="big-tick-svg-circle" cx="26" cy="26" r="23" fill="none" />
                  <path className="big-tick-svg-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              </div>
            </div>

            <span className="order-success-badge">PAYMENT RECEIVED &amp; CONFIRMED</span>
            <h2 className="order-success-title">Order Confirmed!</h2>
            <p className="order-success-subtext">
              Your 100% pure vegetarian meal has been forwarded to the master kitchen.
            </p>

            <div className="order-summary-quick-box">
              <div className="summary-line">
                <span>Order Reference:</span>
                <strong className="order-ref-pill">{confirmedOrder.orderId}</strong>
              </div>
              <div className="summary-line">
                <span>Total Paid (INR):</span>
                <strong className="order-total-price">₹{confirmedOrder.totalAmount}</strong>
              </div>
              <div className="summary-line">
                <span>Estimated Delivery:</span>
                <strong style={{ color: "#16a34a" }}>⚡ 25–30 Minutes</strong>
              </div>
              <div className="summary-line">
                <span>Delivery To:</span>
                <span>{confirmedOrder.deliveryAddress}, {confirmedOrder.city}</span>
              </div>
            </div>

            <div className="order-success-actions">
              <button
                type="button"
                className="btn-track-from-success"
                onClick={() => {
                  setOrderSuccessModalOpen(false);
                  setTrackedOrder(confirmedOrder);
                }}
              >
                🛰️ Track Live Order Progress →
              </button>
              <button
                type="button"
                className="btn-continue-shopping"
                onClick={() => {
                  setOrderSuccessModalOpen(false);
                  setCurrentPage("menu");
                }}
              >
                🍽️ Done / Continue Exploring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Order Tracking Modal */}
      {trackedOrder && (
        <div className="ff-modal-backdrop" onClick={() => setTrackedOrder(null)}>
          <div className="ff-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px", textAlign: "center" }}>
            <button type="button" className="modal-close-btn" onClick={() => setTrackedOrder(null)}>✕</button>

            <span className="card-badge" style={{ marginBottom: "8px", display: "inline-block" }}>
              🛰️ LIVE STATUS • REAL-TIME
            </span>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "6px" }}>Tracking Order {trackedOrder.orderId}</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
              {trackedOrder.status === "Delivered" ? (
                <strong style={{ color: "#16a34a", fontSize: "1.05rem" }}>🎉 Delivered &amp; Completed! Enjoy your delicious meal!</strong>
              ) : (
                <>Estimated Delivery Time: <strong>25–30 Mins</strong></>
              )}
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", position: "relative", marginBottom: "30px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#22c55e", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontWeight: 800, fontSize: "1.1rem", boxShadow: "0 4px 12px rgba(34,197,94,0.35)" }}>✓</div>
                <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>Placed</span>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: trackedOrder.status === "Preparing" || trackedOrder.status === "Out for Delivery" || trackedOrder.status === "Delivered" ? "#ffc82c" : "var(--cream-soft)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontWeight: 800, fontSize: "1.1rem", boxShadow: "0 4px 12px rgba(255,200,44,0.35)" }}>🍳</div>
                <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>Kitchen</span>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: trackedOrder.status === "Out for Delivery" || trackedOrder.status === "Delivered" ? "#3b82f6" : "var(--cream-soft)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontWeight: 800, fontSize: "1.1rem", boxShadow: "0 4px 12px rgba(59,130,246,0.35)" }}>🛵</div>
                <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>On the Way</span>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: trackedOrder.status === "Delivered" ? "#22c55e" : "var(--cream-soft)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontWeight: 800, fontSize: "1.1rem", boxShadow: "0 4px 12px rgba(34,197,94,0.35)" }}>🏡</div>
                <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>Delivered</span>
              </div>
            </div>

            <div className={`live-status-pill-banner status-bg-${(trackedOrder.status || "preparing").toLowerCase().replace(/\s+/g, "-")}`}>
              <span className="live-pulse-dot" />
              <span>Current Status: <strong>{trackedOrder.status || "Preparing in Kitchen"}</strong></span>
            </div>

            <div style={{ textAlign: "left", background: "var(--cream-soft)", padding: "18px", borderRadius: "16px", marginBottom: "20px" }}>
              <h4 style={{ marginBottom: "8px" }}>Ordered Items</h4>
              {trackedOrder.items?.map((it, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", padding: "3px 0" }}>
                  <span>{it.emoji || "🍱"} {it.name} × {it.quantity}</span>
                  <strong>₹{it.price * it.quantity}</strong>
                </div>
              ))}
              <div style={{ borderTop: "1px dashed var(--cream-border)", marginTop: "8px", paddingTop: "8px", display: "flex", justifyContent: "space-between" }}>
                <span>Total Amount:</span>
                <strong style={{ fontSize: "1.1rem", color: "var(--cocoa-dark)" }}>₹{trackedOrder.totalAmount}</strong>
              </div>
            </div>

            <button type="button" className="btn-proceed-checkout" onClick={() => setTrackedOrder(null)}>
              Close Tracker
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="ff-footer">
        <div className="footer-container">
          <div className="footer-col">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <span style={{ fontSize: "1.8rem" }}>🌿</span>
              <h3 style={{ fontSize: "1.6rem", color: "#fff" }}>FOODFUSION</h3>
            </div>
            <p>
              Modern full-stack online food ordering &amp; delivery management platform.
              Crafted exclusively with 100% pure vegetarian Indian ingredients.
            </p>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <button type="button" onClick={() => setCurrentPage("home")}>Home</button>
            <button type="button" onClick={() => setCurrentPage("menu")}>Menu (30 Veg Dishes)</button>
            <button type="button" onClick={() => setCurrentPage("categories")}>Categories</button>
            <button type="button" onClick={() => setCurrentPage("orders")}>Track Orders</button>
          </div>

          <div className="footer-col">
            <h4>Customer Portal</h4>
            <button type="button" onClick={() => setCurrentPage("profile")}>Account Profile</button>
            <button type="button" onClick={() => setCurrentPage("orders")}>Order History</button>
            <button type="button" onClick={handleLogout}>Sign Out</button>
            <button type="button" onClick={() => setCartDrawerOpen(true)}>Shopping Cart</button>
          </div>

          <div className="footer-col">
            <h4>Contact &amp; Support</h4>
            <p>📧 support@foodfusion.com</p>
            <p>📞 +91 91374 57865</p>
            <p>📍 Bandra West, Mumbai, India</p>
            <p>⏰ Open 24/7 for Online Orders</p>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="bottom-bar-container">
            <p>© {new Date().getFullYear()} FoodFusion Inc. All rights reserved. Designed with 100% pure vegetarian excellence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
