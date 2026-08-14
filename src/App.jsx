import { useEffect, useState, useMemo } from "react";
import "./App.css";
import {
  loginUser,
  registerUser,
  createOrder,
  getAdminDashboardData,
  updateOrderStatus,
  verifyAdminPasscode,
  deleteUser,
  deleteOrder,
} from "./api";

// Food categories for filtering
const categories = [
  "All",
  "Pizza",
  "Burgers",
  "Indian",
  "Chinese",
  "Pasta",
  "Desserts",
  "Drinks",
];

// Fallback food catalog (26 Vegetarian items & Drinks)
const foodItems = [
  {
    id: 40,
    name: "Veg Cheese Pizza",
    category: "Pizza",
    price: 279,
    rating: 4.8,
    emoji: "🍕",
    description: "Cheesy pizza topped with fresh vegetables and Italian herbs.",
    details:
      "A delicious crispy pizza topped with melted mozzarella, tomato, capsicum, onion and aromatic Italian herbs.",
    ingredients: [
      "Pizza Dough",
      "Mozzarella Cheese",
      "Tomato",
      "Capsicum",
      "Onion",
      "Oregano",
    ],
  },

  {
    id: 41,
    name: "Veg Burger",
    category: "Burgers",
    price: 169,
    rating: 4.7,
    emoji: "🍔",
    description:
      "Crispy vegetable patty burger with fresh vegetables and special sauce.",
    details:
      "A soft toasted burger bun filled with a crispy vegetable patty, fresh lettuce, tomato, onion and creamy special sauce.",
    ingredients: [
      "Burger Bun",
      "Veg Patty",
      "Lettuce",
      "Tomato",
      "Onion",
      "Special Sauce",
    ],
  },

  {
    id: 42,
    name: "French Fries",
    category: "Burgers",
    price: 119,
    rating: 4.6,
    emoji: "🍟",
    description: "Crispy golden French fries seasoned with salt and herbs.",
    details:
      "Golden and crispy potato fries prepared fresh and lightly seasoned for the perfect crunchy snack.",
    ingredients: ["Potato", "Salt", "Black Pepper", "Herbs", "Oil"],
  },

  {
    id: 43,
    name: "Veg Tacos",
    category: "Indian",
    price: 179,
    rating: 4.7,
    emoji: "🌮",
    description:
      "Crispy taco shells filled with seasoned vegetables and cheese.",
    details:
      "Crunchy taco shells filled with flavorful vegetables, lettuce, tomato, cheese and a creamy Mexican-style sauce.",
    ingredients: [
      "Taco Shell",
      "Capsicum",
      "Lettuce",
      "Tomato",
      "Cheese",
      "Mexican Sauce",
    ],
  },

  {
    id: 44,
    name: "Veg Wrap",
    category: "Indian",
    price: 149,
    rating: 4.7,
    emoji: "🌯",
    description:
      "Soft wrap filled with fresh vegetables, paneer and creamy sauce.",
    details:
      "A soft tortilla wrap packed with seasoned vegetables, grilled paneer, lettuce and flavorful creamy sauce.",
    ingredients: [
      "Tortilla",
      "Paneer",
      "Capsicum",
      "Lettuce",
      "Onion",
      "Creamy Sauce",
    ],
  },

  {
    id: 45,
    name: "White Sauce Pasta",
    category: "Pasta",
    price: 189,
    rating: 4.8,
    emoji: "🍝",
    description:
      "Creamy pasta cooked with vegetables, herbs and melted cheese.",
    details:
      "Soft pasta tossed in a rich and creamy white sauce with fresh vegetables, Italian herbs and melted cheese.",
    ingredients: [
      "Pasta",
      "Milk",
      "Cheese",
      "Capsicum",
      "Corn",
      "Italian Herbs",
    ],
  },

  {
    id: 46,
    name: "Veg Hakka Noodles",
    category: "Chinese",
    price: 159,
    rating: 4.7,
    emoji: "🍜",
    description:
      "Stir-fried noodles loaded with fresh vegetables and Chinese sauces.",
    details:
      "Delicious noodles stir-fried with cabbage, carrot, capsicum, spring onion and flavorful Indo-Chinese sauces.",
    ingredients: [
      "Noodles",
      "Cabbage",
      "Carrot",
      "Capsicum",
      "Soy Sauce",
      "Spring Onion",
    ],
  },

  {
    id: 47,
    name: "Veg Fried Rice",
    category: "Chinese",
    price: 149,
    rating: 4.7,
    emoji: "🍚",
    description:
      "Fragrant fried rice tossed with colorful fresh vegetables.",
    details:
      "Fluffy rice stir-fried with carrots, peas, capsicum, spring onions and flavorful Chinese sauces.",
    ingredients: [
      "Rice",
      "Carrot",
      "Peas",
      "Capsicum",
      "Spring Onion",
      "Soy Sauce",
    ],
  },

  {
    id: 48,
    name: "Paneer Curry",
    category: "Indian",
    price: 229,
    rating: 4.9,
    emoji: "🍛",
    description:
      "Soft paneer cooked in a rich and flavorful Indian curry.",
    details:
      "Tender paneer cubes cooked in creamy tomato and onion gravy with aromatic Indian spices and fresh coriander.",
    ingredients: [
      "Paneer",
      "Tomato",
      "Onion",
      "Cream",
      "Indian Spices",
      "Coriander",
    ],
  },

  {
    id: 49,
    name: "Fresh Veg Salad",
    category: "Indian",
    price: 99,
    rating: 4.6,
    emoji: "🥗",
    description:
      "Fresh and crunchy vegetables tossed with lemon and herbs.",
    details:
      "A refreshing combination of crisp lettuce, cucumber, tomato, carrot and onion finished with lemon juice and herbs.",
    ingredients: [
      "Lettuce",
      "Cucumber",
      "Tomato",
      "Carrot",
      "Onion",
      "Lemon",
    ],
  },

  {
    id: 50,
    name: "Pav Bhaji",
    category: "Indian",
    price: 159,
    rating: 4.8,
    emoji: "🥘",
    description:
      "Spicy mashed vegetable curry served with buttery toasted pav.",
    details:
      "A popular Mumbai-style dish made with mashed vegetables, aromatic spices and buttery toasted pav.",
    ingredients: [
      "Potato",
      "Peas",
      "Cauliflower",
      "Tomato",
      "Pav Bhaji Masala",
      "Butter",
    ],
  },

  {
    id: 51,
    name: "Samosa",
    category: "Indian",
    price: 59,
    rating: 4.6,
    emoji: "🔺",
    description:
      "Crispy golden pastry filled with spicy potato and peas.",
    details:
      "A classic Indian snack with a crispy golden shell filled with seasoned potatoes, peas and aromatic spices.",
    ingredients: [
      "Flour",
      "Potato",
      "Peas",
      "Green Chili",
      "Cumin",
      "Indian Spices",
    ],
  },

  {
    id: 52,
    name: "Masala Dosa",
    category: "Indian",
    price: 129,
    rating: 4.8,
    emoji: "🥞",
    description:
      "Crispy South Indian dosa filled with flavorful masala potatoes.",
    details:
      "A thin and crispy dosa served with spiced potato filling, coconut chutney and traditional sambar.",
    ingredients: [
      "Rice",
      "Urad Dal",
      "Potato",
      "Onion",
      "Mustard Seeds",
      "Spices",
    ],
  },

  {
    id: 53,
    name: "Idli Sambar",
    category: "Indian",
    price: 109,
    rating: 4.7,
    emoji: "🍘",
    description:
      "Soft steamed idlis served with hot flavorful sambar.",
    details:
      "Soft and fluffy steamed rice cakes served with aromatic vegetable sambar and fresh coconut chutney.",
    ingredients: [
      "Rice",
      "Urad Dal",
      "Lentils",
      "Vegetables",
      "Tamarind",
      "Spices",
    ],
  },

  {
    id: 54,
    name: "Chole Bhature",
    category: "Indian",
    price: 179,
    rating: 4.8,
    emoji: "🫓",
    description:
      "Spicy chickpea curry served with fluffy fried bhature.",
    details:
      "A delicious North Indian combination of spicy chickpea curry served with soft, fluffy and golden bhature.",
    ingredients: [
      "Chickpeas",
      "Flour",
      "Tomato",
      "Onion",
      "Chole Masala",
      "Yogurt",
    ],
  },

  {
    id: 55,
    name: "Veg Momos",
    category: "Chinese",
    price: 139,
    rating: 4.7,
    emoji: "🥟",
    description:
      "Steamed dumplings filled with seasoned fresh vegetables.",
    details:
      "Soft steamed dumplings filled with finely chopped vegetables and served with spicy red chutney.",
    ingredients: [
      "Flour",
      "Cabbage",
      "Carrot",
      "Capsicum",
      "Garlic",
      "Chili Sauce",
    ],
  },

  {
    id: 56,
    name: "Spring Rolls",
    category: "Chinese",
    price: 129,
    rating: 4.6,
    emoji: "🥠",
    description:
      "Crispy rolls stuffed with seasoned vegetables.",
    details:
      "Golden crispy spring rolls packed with crunchy cabbage, carrots, capsicum and flavorful Chinese seasoning.",
    ingredients: [
      "Spring Roll Sheets",
      "Cabbage",
      "Carrot",
      "Capsicum",
      "Soy Sauce",
      "Pepper",
    ],
  },

  {
    id: 57,
    name: "Garlic Bread",
    category: "Pizza",
    price: 129,
    rating: 4.7,
    emoji: "🥖",
    description:
      "Crispy garlic bread topped with butter, herbs and cheese.",
    details:
      "Freshly baked bread brushed with garlic butter, Italian herbs and melted cheese.",
    ingredients: [
      "Bread",
      "Garlic",
      "Butter",
      "Cheese",
      "Oregano",
      "Parsley",
    ],
  },

  {
    id: 58,
    name: "Cheese Nachos",
    category: "Burgers",
    price: 149,
    rating: 4.7,
    emoji: "🧀",
    description:
      "Crunchy nachos loaded with melted cheese and flavorful toppings.",
    details:
      "Crispy tortilla chips covered with melted cheese, jalapeños, tomato salsa and a creamy dip.",
    ingredients: [
      "Tortilla Chips",
      "Cheese",
      "Jalapeño",
      "Tomato",
      "Salsa",
      "Cream",
    ],
  },

  {
    id: 59,
    name: "Chocolate Cake",
    category: "Desserts",
    price: 129,
    rating: 4.8,
    emoji: "🍰",
    description:
      "Soft and rich chocolate cake with creamy chocolate frosting.",
    details:
      "A moist chocolate cake layered with smooth chocolate cream and finished with rich chocolate frosting.",
    ingredients: [
      "Flour",
      "Cocoa",
      "Chocolate",
      "Sugar",
      "Milk",
      "Cream",
    ],
  },

  // =========================
  // DRINKS
  // =========================

  {
    id: 60,
    name: "Hot Coffee",
    category: "Drinks",
    price: 89,
    rating: 4.6,
    emoji: "☕",
    description:
      "Freshly brewed hot coffee with a rich and aromatic flavor.",
    details:
      "A comforting cup of freshly brewed coffee made with premium coffee beans and served hot.",
    ingredients: ["Coffee", "Milk", "Sugar", "Water"],
  },

  {
    id: 61,
    name: "Cold Coffee",
    category: "Drinks",
    price: 119,
    rating: 4.7,
    emoji: "🥤",
    description:
      "Creamy chilled coffee blended with milk and ice.",
    details:
      "A refreshing cold coffee made with rich coffee, chilled milk, sugar and ice, blended until smooth and creamy.",
    ingredients: ["Coffee", "Milk", "Sugar", "Ice", "Cream"],
  },

  {
    id: 62,
    name: "Milkshake",
    category: "Drinks",
    price: 139,
    rating: 4.8,
    emoji: "🧋",
    description:
      "Thick and creamy milkshake blended with rich flavors.",
    details:
      "A smooth and creamy milkshake prepared with chilled milk, ice cream and delicious flavoring.",
    ingredients: [
      "Milk",
      "Ice Cream",
      "Sugar",
      "Flavor Syrup",
      "Ice",
    ],
  },

  {
    id: 63,
    name: "Green Tea",
    category: "Drinks",
    price: 79,
    rating: 4.5,
    emoji: "🍵",
    description:
      "Light and refreshing green tea with a delicate herbal flavor.",
    details:
      "A soothing cup of freshly brewed green tea prepared with premium green tea leaves.",
    ingredients: ["Green Tea Leaves", "Water", "Honey", "Lemon"],
  },

  {
    id: 64,
    name: "Mango Juice",
    category: "Drinks",
    price: 109,
    rating: 4.7,
    emoji: "🧃",
    description:
      "Sweet and refreshing mango juice made from ripe mangoes.",
    details:
      "A naturally sweet and refreshing mango drink prepared from ripe, juicy mangoes.",
    ingredients: ["Mango", "Water", "Sugar", "Ice"],
  },

  {
    id: 65,
    name: "Masala Chai",
    category: "Drinks",
    price: 69,
    rating: 4.6,
    emoji: "🫖",
    description:
      "Classic Indian tea brewed with milk and aromatic spices.",
    details:
      "A comforting Indian masala chai prepared with black tea, milk, ginger and aromatic spices.",
    ingredients: [
      "Black Tea",
      "Milk",
      "Ginger",
      "Cardamom",
      "Cinnamon",
    ],
  },
];

function App() {
  const [apiFoods, setApiFoods] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(false);

  const activeFoodItems = useMemo(() => {
    const source = apiFoods.length > 0 ? apiFoods : foodItems;

    const nonVegWords = [
      "chicken",
      "mutton",
      "fish",
      "prawn",
      "prawns",
      "shrimp",
      "seafood",
      "egg",
      "eggs",
      "meat",
      "beef",
      "pork",
      "lamb",
      "bacon",
      "ham",
      "turkey",
      "non-veg",
      "non veg",
      "nonveg",
    ];

    return source
      .filter((food) => {
        const name = String(food.name || "").toLowerCase();
        const category = String(food.category || "").toLowerCase();
        const description = String(food.description || "").toLowerCase();

        const ingredients = Array.isArray(food.ingredients)
          ? food.ingredients.join(" ").toLowerCase()
          : "";

        const text = `${name} ${category} ${description} ${ingredients}`;

        return !nonVegWords.some((word) => text.includes(word));
      })
      .map((food) => ({
        ...food,
        id: food.id || food._id,
      }));
  }, [apiFoods]);

  // Active page navigation
  const [page, setPage] = useState("home");

  // Admin Portal state & secret database access URL parameters
  const [isAdminMode] = useState(() => {
    const s = window.location.search.toLowerCase();
    return (
      s.includes("admin=true") ||
      s.includes("db=rishikesh") ||
      s.includes("admin=rishikesh7102006") ||
      s.includes("database=true")
    );
  });
  const [adminPasscode, setAdminPasscode] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassError, setAdminPassError] = useState("");
  const [adminTab, setAdminTab] = useState("users");
  const [adminPortalData, setAdminPortalData] = useState({
    stats: {},
    users: [],
    orders: [],
  });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");

  // User Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("foodfusion_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authMode, setAuthMode] = useState("register"); // Default to Sign Up
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Bag Entrance Animation & Gate State
  const [isBagOpening, setIsBagOpening] = useState(false);
  const [showGatedAuthForm, setShowGatedAuthForm] = useState(false);
  const [entranceUnlocking, setEntranceUnlocking] = useState(false);
  const [unlockStatusText, setUnlockStatusText] = useState("");

  // Search & Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Cart Management
  const [cart, setCart] = useState([]);

  // Direct Buy ("Buy Now") Modal State
  const [directBuyFood, setDirectBuyFood] = useState(null);
  const [directBuyStep, setDirectBuyStep] = useState(1);
  const [directBuyForm, setDirectBuyForm] = useState({
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    city: "Mumbai",
    pincode: "400001",
    instructions: "",
    quantity: 1,
  });
  const [cardForm, setCardForm] = useState({
    cardNumber: "4532 8921 7843 9021",
    cardHolder: "",
    expiry: "08/28",
    cvv: "892",
  });
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [directBuySubmitting, setDirectBuySubmitting] = useState(false);
  const [directBuyOrderSuccess, setDirectBuyOrderSuccess] = useState(null);
  const [directBuyError, setDirectBuyError] = useState("");

  // Load menu items
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoadingFoods(true);
        const response = await fetch("http://localhost:5000/api/foods");
        if (!response.ok) throw new Error("Failed to fetch foods");
        const data = await response.json();
        if (data.success && isMounted) {
          setApiFoods(data.foods);
        }
      } catch (err) {
        console.error("Food fetch error:", err);
      } finally {
        if (isMounted) setLoadingFoods(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync admin portal data if in admin mode
  useEffect(() => {
    if (isAdminMode && isAdminAuthenticated) {
      fetchAdminPortalData();
    }
  }, [isAdminMode, isAdminAuthenticated]);

  const fetchAdminPortalData = async () => {
    try {
      setAdminLoading(true);
      const data = await getAdminDashboardData();
      setAdminPortalData(data);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminPasscodeSubmit = async (e) => {
    e.preventDefault();
    setAdminPassError("");
    if (adminPasscode === "REMOVED_SECRET") {
      setIsAdminAuthenticated(true);
      fetchAdminPortalData();
      return;
    }
    try {
      const res = await verifyAdminPasscode(adminPasscode);
      if (res.success) {
        setIsAdminAuthenticated(true);
        fetchAdminPortalData();
      } else {
        setAdminPassError(
          res.message || "Invalid passcode! Use REMOVED_SECRET."
        );
      }
    } catch {
      setAdminPassError(
        "Passcode verification failed. Enter REMOVED_SECRET."
      );
    }
  };

  // OTP Verification State
  const [authStep, setAuthStep] = useState("form"); // "form" | "otp"
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [userEnteredOtp, setUserEnteredOtp] = useState("");
  const [pendingUserData, setPendingUserData] = useState(null);
  const [emailNotificationToast, setEmailNotificationToast] = useState("");
  const [smsNotificationToast, setSmsNotificationToast] = useState("");

  // Auth Handler: Initiate OTP
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      if (authMode === "login") {
        const res = await loginUser({
          email: authForm.email,
          password: authForm.password,
        });
        const userData = {
          ...res.user,
          token: res.token,
          rawPassword: authForm.password,
        };
        dispatchRealtimeOtp(userData, `Welcome back, ${res.user.name}!`);
      } else {
        const res = await registerUser({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
          phone: authForm.phone,
        });
        const userData = {
          ...res.user,
          token: res.token || "demo_jwt_token",
          rawPassword: authForm.password,
        };
        dispatchRealtimeOtp(
          userData,
          `Account created! Welcome, ${res.user.name}!`
        );
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setAuthError(err.message || "Authentication failed. Please check inputs.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Dispatch OTP and simulate real-time email & phone SMS sending
  const dispatchRealtimeOtp = (userData, message) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setPendingUserData({ userData, message });
    setUserEnteredOtp("");
    setAuthStep("otp");

    // Real-time Email Toast
    setEmailNotificationToast(
      `📧 Real-Time Email Sent to ${userData.email}: Your FoodFusion Access OTP is ${code}`
    );

    // Real-time Phone SMS Toast
    setSmsNotificationToast(
      `💬 Phone SMS Message to ${
        userData.phone || "Mobile Phone"
      }: FoodFusion Security Code is ${code}`
    );
  };

  // Verify OTP submission
  const handleOtpVerify = (e) => {
    e.preventDefault();
    if (userEnteredOtp.trim() === generatedOtp) {
      setEmailNotificationToast("");
      setSmsNotificationToast("");
      setAuthStep("form");
      triggerEntranceUnlock(pendingUserData.userData, pendingUserData.message);
    } else {
      setAuthError(
        "Invalid OTP Code! Please check your email and phone message notifications."
      );
    }
  };

  const resendOtp = () => {
    if (pendingUserData) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setUserEnteredOtp("");
      setAuthError("");
      setEmailNotificationToast(
        `📧 NEW Email Sent to ${pendingUserData.userData.email}: Your OTP Code is ${code}`
      );
      setSmsNotificationToast(
        `💬 NEW SMS Message to ${
          pendingUserData.userData.phone || "Mobile Phone"
        }: Your OTP Code is ${code}`
      );
    }
  };

  const triggerEntranceUnlock = (userData, message) => {
    setShowGatedAuthForm(false);
    setEntranceUnlocking(true);
    setUnlockStatusText("🔐 Validating Security OTP Token...");

    setTimeout(() => {
      setUnlockStatusText("⚡ Synchronizing MongoDB User Database...");
    }, 500);

    setTimeout(() => {
      setUnlockStatusText(`✨ ${message}`);
    }, 1000);

    setTimeout(() => {
      setCurrentUser(userData);
      localStorage.setItem("foodfusion_user", JSON.stringify(userData));
      setEntranceUnlocking(false);
    }, 1600);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("foodfusion_user");
    setShowGatedAuthForm(false);
    setIsBagOpening(false);
    setPage("home");
  };

  // Direct Buy Flow Trigger
  const openDirectBuy = (food) => {
    if (!currentUser) {
      setShowGatedAuthForm(true);
      return;
    }
    setDirectBuyFood(food);
    setDirectBuyStep(1);
    setDirectBuyError("");
    setDirectBuyForm({
      customerName: currentUser?.name || "Rishi Dubey",
      customerPhone: currentUser?.phone || "9876543210",
      deliveryAddress: "Flat 402, Sunshine Towers, Mumbai",
      city: "Mumbai",
      pincode: "400001",
      instructions: "",
      quantity: 1,
    });
    setCardForm({
      cardNumber: "4532 8921 7843 9021",
      cardHolder: (currentUser?.name || "RISHI DUBEY").toUpperCase(),
      expiry: "08/28",
      cvv: "892",
    });
  };

  const handleDirectBuySubmit = async (e) => {
    e.preventDefault();
    setDirectBuySubmitting(true);
    setDirectBuyError("");

    try {
      const orderPayload = {
        userId: currentUser?.id || currentUser?._id || null,
        customerName: directBuyForm.customerName,
        customerEmail: currentUser?.email || "",
        customerPhone: directBuyForm.customerPhone,
        deliveryAddress: directBuyForm.deliveryAddress,
        city: directBuyForm.city,
        pincode: directBuyForm.pincode,
        instructions: directBuyForm.instructions,
        items: [
          {
            foodId: String(directBuyFood.id || directBuyFood._id),
            name: directBuyFood.name,
            price: directBuyFood.price,
            quantity: directBuyForm.quantity,
            emoji: directBuyFood.emoji,
          },
        ],
        totalAmount: directBuyFood.price * directBuyForm.quantity + 40,
        paymentMethod: "card",
        cardHolderName: cardForm.cardHolder,
        cardLast4: cardForm.cardNumber.replace(/\s+/g, "").slice(-4) || "4242",
      };

      const res = await createOrder(orderPayload);
      setDirectBuyOrderSuccess(res.order);
      setDirectBuyStep(3);
    } catch (err) {
      console.error("Direct buy error:", err);
      setDirectBuyError(err.message || "Failed to place order");
    } finally {
      setDirectBuySubmitting(false);
    }
  };

  // Cart operations
  const addToCart = (food, amount = 1) => {
    setCart((curr) => {
      const existing = curr.find((i) => i.id === food.id);
      if (existing) {
        return curr.map((i) =>
          i.id === food.id ? { ...i, quantity: i.quantity + amount } : i
        );
      }
      return [...curr, { ...food, quantity: amount }];
    });
  };

  const increaseQuantity = (id) => {
    setCart((curr) =>
      curr.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i))
    );
  };

  const decreaseQuantity = (id) => {
    setCart((curr) =>
      curr
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((curr) => curr.filter((i) => i.id !== id));
  };

  const openFoodDetails = (food) => {
    setSelectedFood(food);
    setQuantity(1);
    setPage("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToMenu = () => {
    setPage("menu");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToCart = () => {
    setPage("cart");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const filteredFood = useMemo(() => {
    return activeFoodItems
      .filter((food) => {
        const matchesSearch =
          food.name.toLowerCase().includes(search.toLowerCase()) ||
          food.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory =
          selectedCategory === "All" || food.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "low") return a.price - b.price;
        if (sortBy === "high") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        return 0;
      });
  }, [activeFoodItems, search, selectedCategory, sortBy]);

  /* =====================================================
  ADMIN SERVER WEBPAGE (?admin=true) DIRECT RENDER
  ===================================================== */
  if (isAdminMode) {
    if (!isAdminAuthenticated) {
      return (
        <div className="admin-passcode-backdrop">
          <div className="admin-passcode-box">
            <span style={{ fontSize: "3rem" }}>🔒</span>
            <h2 style={{ color: "#ffffff", margin: "12px 0 6px" }}>
              FoodFusion Server Portal
            </h2>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.88rem",
                marginBottom: "18px",
              }}
            >
              Restricted Admin Access. Enter passcode to view user &amp; order
              database.
            </p>

            {adminPassError && (
              <div className="auth-error-banner">⚠️ {adminPassError}</div>
            )}

            <form onSubmit={handleAdminPasscodeSubmit}>
              <input
                type="password"
                required
                placeholder="Enter admin passcode"
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(0,0,0,0.5)",
                  color: "#fff",
                  marginBottom: "16px",
                  textAlign: "center",
                  fontSize: "1.1rem",
                }}
              />
              <button
                type="submit"
                className="primary-btn"
                style={{ width: "100%" }}
              >
                Unlock Admin Portal ⚡
              </button>
            </form>
          </div>
        </div>
      );
    }

    const { stats = {}, users = [], orders = [] } = adminPortalData;

    const filteredUsers = users.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(adminSearch.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(adminSearch.toLowerCase())) ||
        (u.phone && u.phone.includes(adminSearch))
    );

    const filteredOrders = orders.filter(
      (o) =>
        (o.orderId &&
          o.orderId.toLowerCase().includes(adminSearch.toLowerCase())) ||
        (o.customerName &&
          o.customerName.toLowerCase().includes(adminSearch.toLowerCase())) ||
        (o.customerPhone && o.customerPhone.includes(adminSearch)) ||
        (o.status && o.status.toLowerCase().includes(adminSearch.toLowerCase()))
    );

    const handleStatusChange = async (orderId, newStatus) => {
      try {
        await updateOrderStatus(orderId, newStatus);
        fetchAdminPortalData();
      } catch (err) {
        alert(err.message || "Failed to update order status");
      }
    };

    const handleDeleteUser = async (userId) => {
      if (
        !window.confirm(
          "Are you sure you want to delete this user record from the database?"
        )
      )
        return;
      try {
        await deleteUser(userId);
      } catch (err) {
        console.error("Delete user error:", err);
      } finally {
        setAdminPortalData((prev) => ({
          ...prev,
          users: (prev.users || []).filter((u) => (u._id || u.id) !== userId),
          stats: {
            ...prev.stats,
            totalUsers: Math.max(
              0,
              ((prev.stats && prev.stats.totalUsers) ||
                (prev.users || []).length) - 1
            ),
          },
        }));
      }
    };

    const handleDeleteOrder = async (orderId) => {
      if (
        !window.confirm(
          "Are you sure you want to delete this order record from the database?"
        )
      )
        return;
      try {
        await deleteOrder(orderId);
      } catch (err) {
        console.error("Delete order error:", err);
      } finally {
        setAdminPortalData((prev) => ({
          ...prev,
          orders: (prev.orders || []).filter((o) => (o._id || o.id) !== orderId),
          stats: {
            ...prev.stats,
            totalOrders: Math.max(
              0,
              ((prev.stats && prev.stats.totalOrders) ||
                (prev.orders || []).length) - 1
            ),
          },
        }));
      }
    };

    return (
      <main className="admin-server-page">
        <div className="admin-header-banner">
          <div className="admin-title-area">
            <span className="section-label">SECRET SERVER DATABASE PORTAL</span>
            <h1>Live User Data &amp; Order Control</h1>
            <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
              MongoDB Backend API:{" "}
              <code>http://localhost:5000/api/admin/dashboard</code>
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              className="primary-btn"
              onClick={fetchAdminPortalData}
              disabled={adminLoading}
            >
              {adminLoading ? "🔄 Refreshing..." : "🔄 Sync Live Server Data"}
            </button>
            <a
              href="/"
              style={{
                padding: "10px 18px",
                borderRadius: "9999px",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              ← Return to Main Website
            </a>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="users-metrics-grid" style={{ marginBottom: "28px" }}>
          <div className="metric-card">
            <span className="metric-icon">👥</span>
            <div>
              <h3>{stats.totalUsers || users.length}</h3>
              <p>Total Registered Users</p>
            </div>
          </div>

          <div className="metric-card">
            <span className="metric-icon">📦</span>
            <div>
              <h3>{stats.totalOrders || orders.length}</h3>
              <p>Total Orders Placed</p>
            </div>
          </div>

          <div className="metric-card">
            <span className="metric-icon">💰</span>
            <div>
              <h3>₹{stats.totalRevenue || 0}</h3>
              <p>Total Revenue</p>
            </div>
          </div>

          <div className="metric-card">
            <span className="metric-icon">🔥</span>
            <div>
              <h3>{stats.activeOrders || 0}</h3>
              <p>Active Live Orders</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            justify: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div className="admin-tabs-nav">
            <button
              type="button"
              className={`admin-tab-btn ${adminTab === "users" ? "active" : ""}`}
              onClick={() => setAdminTab("users")}
            >
              👥 Registered Users ({users.length})
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${
                adminTab === "orders" ? "active" : ""
              }`}
              onClick={() => setAdminTab("orders")}
            >
              📦 Orders Database ({orders.length})
            </button>
          </div>

          <div className="search-box" style={{ maxWidth: "340px" }}>
            <span>🔎</span>
            <input
              type="text"
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              placeholder="Search user or order data..."
            />
          </div>
        </div>

        {/* Tab 1: User Database */}
        {adminTab === "users" && (
          <div className="users-table-container">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Email Address</th>
                  <th>Contact Phone</th>
                  <th>User Password</th>
                  <th>Account Role</th>
                  <th>Registered Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "var(--text-muted)",
                      }}
                    >
                      No matching user records found in MongoDB.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id || u.id}>
                      <td className="user-name-cell">
                        <span className="user-avatar-circle">
                          {u.name ? u.name.charAt(0).toUpperCase() : "👤"}
                        </span>
                        <strong>{u.name || "User"}</strong>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phone || "—"}</td>
                      <td>
                        <span
                          style={{
                            fontFamily: "monospace",
                            background: "rgba(255,201,60,0.15)",
                            color: "#ffc93c",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            border: "1px solid rgba(255,201,60,0.35)",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                          }}
                        >
                          🔑 {u.rawPassword || u.password || "REMOVED_SECRET"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`role-badge ${
                            u.role === "admin" ? "admin" : "user"
                          }`}
                        >
                          {u.role === "admin" ? "⚡ Admin" : "👤 User"}
                        </span>
                      </td>
                      <td>
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("en-IN")
                          : "Recent"}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-delete-btn"
                          onClick={() => handleDeleteUser(u._id || u.id)}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Orders Database */}
        {adminTab === "orders" && (
          <div className="users-table-container">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Customer Info</th>
                  <th>Items Ordered</th>
                  <th>Total Paid</th>
                  <th>Card Payment</th>
                  <th>Order Status</th>
                  <th>Placed At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "var(--text-muted)",
                      }}
                    >
                      No order records found in MongoDB yet. Place an order via
                      'Buy Now' to populate.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o._id || o.id}>
                      <td>
                        <strong style={{ color: "#ffc93c" }}>
                          {o.orderId}
                        </strong>
                      </td>
                      <td>
                        <strong>{o.customerName}</strong>
                        <div
                          style={{
                            fontSize: "0.82rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          📞 {o.customerPhone}
                        </div>
                        <div
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--text-faint)",
                          }}
                        >
                          📍 {o.deliveryAddress}
                        </div>
                      </td>
                      <td>
                        {o.items?.map((item, idx) => (
                          <div key={idx} style={{ fontSize: "0.85rem" }}>
                            {item.emoji} {item.name} (x{item.quantity})
                          </div>
                        ))}
                      </td>
                      <td>
                        <strong style={{ color: "#3ecf8e" }}>
                          ₹{o.totalAmount}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.85rem" }}>
                          💳 •••• {o.cardLast4 || "4242"}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-faint)",
                          }}
                        >
                          {o.cardHolderName}
                        </div>
                      </td>
                      <td>
                        <select
                          className="status-badge-select"
                          value={o.status}
                          onChange={(e) =>
                            handleStatusChange(o._id || o.id, e.target.value)
                          }
                        >
                          <option value="Preparing">👨‍🍳 Preparing</option>
                          <option value="Out for Delivery">
                            🛵 Out for Delivery
                          </option>
                          <option value="Delivered">✅ Delivered</option>
                          <option value="Cancelled">❌ Cancelled</option>
                        </select>
                      </td>
                      <td>
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleString("en-IN", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "Just now"}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-delete-btn"
                          onClick={() => handleDeleteOrder(o._id || o.id)}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    );
  }

  const handleBagClick = () => {
    if (isBagOpening || showGatedAuthForm) return;
    setIsBagOpening(true);
    setTimeout(() => {
      setShowGatedAuthForm(true);
      setIsBagOpening(false);
    }, 700);
  };

  return (
    <div className="app">
      {/* Real-time Email & SMS Toast Banners */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 999999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "420px",
        }}
      >
        {emailNotificationToast && (
          <div
            style={{
              background: "linear-gradient(135deg, #1c1917, #292524)",
              border: "1px solid #ffc93c",
              borderRadius: "14px",
              padding: "14px 20px",
              color: "#fff",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(255,201,60,0.3)",
              animation: "fadeIn 0.3s ease-out",
            }}
          >
            <div
              style={{
                display: "flex",
                justify: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#ffc93c",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                📩 REAL-TIME EMAIL INBOX NOTIFICATION
              </span>
              <button
                type="button"
                onClick={() => setEmailNotificationToast("")}
                style={{ color: "#aaa", fontSize: "1.1rem" }}
              >
                ×
              </button>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "0.9rem",
                lineHeight: "1.4",
                color: "#fff",
              }}
            >
              {emailNotificationToast}
            </p>
          </div>
        )}

        {smsNotificationToast && (
          <div
            style={{
              background: "linear-gradient(135deg, #091e3a, #2f80ed)",
              border: "1px solid #64b5f6",
              borderRadius: "14px",
              padding: "14px 20px",
              color: "#fff",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(47,128,237,0.4)",
              animation: "fadeIn 0.35s ease-out",
            }}
          >
            <div
              style={{
                display: "flex",
                justify: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#90caf9",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                💬 REAL-TIME PHONE SMS NOTIFICATION
              </span>
              <button
                type="button"
                onClick={() => setSmsNotificationToast("")}
                style={{ color: "#aaa", fontSize: "1.1rem" }}
              >
                ×
              </button>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "0.9rem",
                lineHeight: "1.4",
                color: "#fff",
              }}
            >
              {smsNotificationToast}
            </p>
          </div>
        )}
      </div>

      {/* Strict Bag Entrance Overlay Gate if user not logged in */}
      {!currentUser && (
        <div className="bag-entrance-gate">
          <div className="bag-gate-content">
            {!showGatedAuthForm ? (
              <div
                className={`bag-wrapper-3d ${isBagOpening ? "opening" : ""}`}
                onClick={handleBagClick}
              >
                <div className="gourmet-bag-handles" />
                <div className="gourmet-bag-body">
                  <div className="bag-logo-emblem">🍱</div>
                  <div className="bag-light-burst" />
                </div>
                <div className="bag-shadow" />
              </div>
            ) : (
              <div className="bag-gated-auth-card">
                <span className="gated-badge-lock">
                  🔒 AUTHENTICATION REQUIRED TO ENTER
                </span>
                <div className="auth-modal-header">
                  <span className="auth-flame">🔥</span>
                  <h2>Welcome to FoodFusion</h2>
                  <p>
                    {authStep === "otp"
                      ? `Enter the 6-digit OTP code sent to ${pendingUserData?.userData?.email}`
                      : "Sign up or log in to unlock the website & gourmet food ordering"}
                  </p>
                </div>

                {authStep === "form" ? (
                  <>
                    <div className="auth-tabs">
                      <button
                        type="button"
                        className={
                          authMode === "register"
                            ? "auth-tab active"
                            : "auth-tab"
                        }
                        onClick={() => {
                          setAuthMode("register");
                          setAuthError("");
                        }}
                      >
                        ✨ Sign Up
                      </button>
                      <button
                        type="button"
                        className={
                          authMode === "login" ? "auth-tab active" : "auth-tab"
                        }
                        onClick={() => {
                          setAuthMode("login");
                          setAuthError("");
                        }}
                      >
                        🔑 Log In
                      </button>
                    </div>

                    {authError && (
                      <div className="auth-error-banner">⚠️ {authError}</div>
                    )}

                    <form onSubmit={handleAuthSubmit} className="auth-form">
                      {authMode === "register" && (
                        <div className="form-group">
                          <label>Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Enter your full name"
                            value={authForm.name}
                            onChange={(e) =>
                              setAuthForm({ ...authForm, name: e.target.value })
                            }
                          />
                        </div>
                      )}

                      <div className="form-group">
                        <label>Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. alex@example.com"
                          value={authForm.email}
                          onChange={(e) =>
                            setAuthForm({ ...authForm, email: e.target.value })
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Password</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={authForm.password}
                          onChange={(e) =>
                            setAuthForm({
                              ...authForm,
                              password: e.target.value,
                            })
                          }
                        />
                      </div>

                      {authMode === "register" && (
                        <div className="form-group">
                          <label>Mobile Phone</label>
                          <input
                            type="text"
                            placeholder="10-digit mobile number"
                            maxLength="10"
                            value={authForm.phone}
                            onChange={(e) =>
                              setAuthForm({
                                ...authForm,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        className="primary-btn auth-submit-btn"
                        disabled={authLoading}
                      >
                        {authLoading
                          ? "Sending OTP..."
                          : authMode === "register"
                          ? "Send OTP Code →"
                          : "Send Login OTP →"}
                      </button>
                    </form>
                  </>
                ) : (
                  <form onSubmit={handleOtpVerify} className="auth-form">
                    {authError && (
                      <div className="auth-error-banner">⚠️ {authError}</div>
                    )}

                    <div className="form-group" style={{ textAlign: "center" }}>
                      <label
                        style={{
                          fontSize: "0.95rem",
                          color: "#ffc93c",
                          display: "block",
                          marginBottom: "10px",
                        }}
                      >
                        Enter 6-Digit Email OTP
                      </label>
                      <input
                        type="text"
                        required
                        maxLength="6"
                        placeholder="••••••"
                        value={userEnteredOtp}
                        onChange={(e) => setUserEnteredOtp(e.target.value)}
                        style={{
                          textAlign: "center",
                          fontSize: "1.8rem",
                          letterSpacing: "8px",
                          fontWeight: 800,
                          padding: "12px",
                          borderRadius: "14px",
                          border: "1px solid #ffc93c",
                          background: "rgba(0,0,0,0.5)",
                          color: "#fff",
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="primary-btn auth-submit-btn"
                    >
                      Verify OTP &amp; Unlock Website ⚡
                    </button>

                    <div
                      style={{
                        display: "flex",
                        justify: "space-between",
                        marginTop: "14px",
                      }}
                    >
                      <button
                        type="button"
                        className="text-btn"
                        onClick={() => setAuthStep("form")}
                      >
                        ← Change Email
                      </button>
                      <button
                        type="button"
                        className="text-btn"
                        onClick={resendOtp}
                      >
                        🔄 Resend OTP
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unlock entrance splash message */}
      {entranceUnlocking && (
        <div className="entrance-unlock-overlay">
          <div className="unlock-portal-card">
            <h2>FoodFusion Portal</h2>
            <p className="unlock-status-msg">{unlockStatusText}</p>
          </div>
        </div>
      )}

      {/* Direct Buy Checkout Modal */}
      {directBuyFood && (
        <div
          className="auth-modal-backdrop"
          onClick={(e) => {
            if (e.target.className === "auth-modal-backdrop")
              setDirectBuyFood(null);
          }}
        >
          <div className="auth-modal-card" style={{ maxWidth: "540px" }}>
            <button
              type="button"
              className="auth-close-btn"
              onClick={() => setDirectBuyFood(null)}
            >
              ×
            </button>

            <div className="checkout-step-pills">
              <span
                className={`step-pill ${
                  directBuyStep === 1
                    ? "active"
                    : directBuyStep > 1
                    ? "completed"
                    : ""
                }`}
              >
                1. 📍 Order &amp; Details
              </span>
              <span
                className={`step-pill ${
                  directBuyStep === 2
                    ? "active"
                    : directBuyStep > 2
                    ? "completed"
                    : ""
                }`}
              >
                2. 💳 Select Card
              </span>
              <span
                className={`step-pill ${
                  directBuyStep === 3 ? "active" : ""
                }`}
              >
                3. 🎉 Confirmed
              </span>
            </div>

            {directBuyStep === 1 && (
              <div>
                <div
                  style={{
                    display: "flex",
                    gap: "14px",
                    alignItems: "center",
                    background: "rgba(255,255,255,0.05)",
                    padding: "14px",
                    borderRadius: "14px",
                    marginBottom: "16px",
                  }}
                >
                  <span style={{ fontSize: "2.4rem" }}>
                    {directBuyFood.emoji}
                  </span>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#fff" }}>
                      {directBuyFood.name}
                    </h3>
                    <p
                      style={{
                        margin: "2px 0 0",
                        color: "var(--text-muted)",
                        fontSize: "0.84rem",
                      }}
                    >
                      {directBuyFood.category} · ₹{directBuyFood.price} each
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "rgba(0,0,0,0.4)",
                      padding: "4px 10px",
                      borderRadius: "20px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setDirectBuyForm({
                          ...directBuyForm,
                          quantity: Math.max(1, directBuyForm.quantity - 1),
                        })
                      }
                      style={{ color: "#fff", fontWeight: 800 }}
                    >
                      -
                    </button>
                    <span
                      style={{
                        fontWeight: 800,
                        padding: "0 4px",
                        color: "#ffc93c",
                      }}
                    >
                      {directBuyForm.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setDirectBuyForm({
                          ...directBuyForm,
                          quantity: directBuyForm.quantity + 1,
                        })
                      }
                      style={{ color: "#fff", fontWeight: 800 }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <h4
                  style={{
                    color: "#ffc93c",
                    marginBottom: "10px",
                    fontSize: "0.95rem",
                  }}
                >
                  📍 Address &amp; Delivery Details Filling Section
                </h4>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setDirectBuyStep(2);
                  }}
                  className="auth-form"
                >
                  <div className="form-group">
                    <label>Recipient Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={directBuyForm.customerName}
                      onChange={(e) =>
                        setDirectBuyForm({
                          ...directBuyForm,
                          customerName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    <div className="form-group">
                      <label>Mobile Phone</label>
                      <input
                        type="text"
                        required
                        placeholder="10-digit phone number"
                        maxLength="10"
                        value={directBuyForm.customerPhone}
                        onChange={(e) =>
                          setDirectBuyForm({
                            ...directBuyForm,
                            customerPhone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        required
                        value={directBuyForm.city}
                        onChange={(e) =>
                          setDirectBuyForm({
                            ...directBuyForm,
                            city: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Full Delivery Address</label>
                    <input
                      type="text"
                      required
                      placeholder="Flat No, House/Building, Street, Landmark"
                      value={directBuyForm.deliveryAddress}
                      onChange={(e) =>
                        setDirectBuyForm({
                          ...directBuyForm,
                          deliveryAddress: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Delivery Instructions (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Ring bell twice, leave with guard"
                      value={directBuyForm.instructions}
                      onChange={(e) =>
                        setDirectBuyForm({
                          ...directBuyForm,
                          instructions: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justify: "space-between",
                      padding: "10px 0",
                      borderTop: "1px dashed rgba(255,255,255,0.15)",
                      marginTop: "8px",
                    }}
                  >
                    <span>Total Amount Payable:</span>
                    <strong style={{ fontSize: "1.2rem", color: "#ffc93c" }}>
                      ₹
                      {directBuyFood.price * directBuyForm.quantity + 40}
                    </strong>
                  </div>

                  <button
                    type="submit"
                    className="primary-btn"
                    style={{ width: "100%", marginTop: "8px", padding: "11px" }}
                  >
                    Proceed to Card Payment →
                  </button>
                </form>
              </div>
            )}

            {directBuyStep === 2 && (
              <div>
                <h4
                  style={{
                    color: "#ffc93c",
                    textAlign: "center",
                    marginBottom: "14px",
                  }}
                >
                  💳 Select Card &amp; Pay
                </h4>

                <div className="card-3d-container" style={{ height: "190px" }}>
                  <div
                    className={`interactive-credit-card ${
                      isCardFlipped ? "flipped" : ""
                    }`}
                  >
                    <div className="card-face front">
                      <div className="card-chip-row">
                        <div className="card-chip" />
                        <div className="card-brand-logo">VISA</div>
                      </div>
                      <div className="card-number-preview">
                        {cardForm.cardNumber || "•••• •••• •••• ••••"}
                      </div>
                      <div className="card-bottom-row">
                        <div className="card-holder-preview">
                          <p>Card Holder</p>
                          <h5>{cardForm.cardHolder || "YOUR NAME"}</h5>
                        </div>
                        <div className="card-expiry-preview">
                          <p>Expires</p>
                          <h5>{cardForm.expiry || "MM/YY"}</h5>
                        </div>
                      </div>
                    </div>

                    <div className="card-face back">
                      <div className="card-magnetic-stripe" />
                      <div className="card-cvv-stripe">
                        {cardForm.cvv || "•••"}
                      </div>
                      <p
                        style={{
                          textAlign: "right",
                          fontSize: "0.68rem",
                          color: "rgba(255,255,255,0.5)",
                          margin: "10px 20px 0",
                        }}
                      >
                        CVV CODE
                      </p>
                    </div>
                  </div>
                </div>

                {directBuyError && (
                  <div className="auth-error-banner">⚠️ {directBuyError}</div>
                )}

                <form onSubmit={handleDirectBuySubmit} className="auth-form">
                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Name on card"
                      value={cardForm.cardHolder}
                      onFocus={() => setIsCardFlipped(false)}
                      onChange={(e) =>
                        setCardForm({ ...cardForm, cardHolder: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      required
                      placeholder="4532 8921 7843 9021"
                      maxLength="19"
                      value={cardForm.cardNumber}
                      onFocus={() => setIsCardFlipped(false)}
                      onChange={(e) =>
                        setCardForm({ ...cardForm, cardNumber: e.target.value })
                      }
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        maxLength="5"
                        value={cardForm.expiry}
                        onFocus={() => setIsCardFlipped(false)}
                        onChange={(e) =>
                          setCardForm({ ...cardForm, expiry: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV Code</label>
                      <input
                        type="password"
                        required
                        placeholder="892"
                        maxLength="3"
                        value={cardForm.cvv}
                        onFocus={() => setIsCardFlipped(true)}
                        onBlur={() => setIsCardFlipped(false)}
                        onChange={(e) =>
                          setCardForm({ ...cardForm, cvv: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div
                    style={{ display: "flex", gap: "10px", marginTop: "12px" }}
                  >
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => setDirectBuyStep(1)}
                      style={{ flex: 1 }}
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="primary-btn"
                      disabled={directBuySubmitting}
                      style={{ flex: 2, padding: "11px" }}
                    >
                      {directBuySubmitting
                        ? "Processing..."
                        : `Pay ₹${
                            directBuyFood.price * directBuyForm.quantity + 40
                          } & Confirm 🔒`}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {directBuyStep === 3 && directBuyOrderSuccess && (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <span
                  style={{
                    fontSize: "3rem",
                    display: "block",
                    marginBottom: "10px",
                  }}
                >
                  🎉
                </span>
                <h2
                  style={{ color: "#3ecf8e", fontSize: "1.6rem", margin: 0 }}
                >
                  Order Confirmed!
                </h2>
                <p
                  style={{
                    color: "var(--text-muted)",
                    marginBottom: "16px",
                    fontSize: "0.9rem",
                  }}
                >
                  Thank you,{" "}
                  <strong>{directBuyOrderSuccess.customerName}</strong>! Your
                  order is saved in MongoDB.
                </p>

                <div
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    padding: "14px",
                    borderRadius: "14px",
                    textAlign: "left",
                    marginBottom: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justify: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <span>Order Ref ID:</span>
                    <strong style={{ color: "#ffc93c" }}>
                      {directBuyOrderSuccess.orderId}
                    </strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justify: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <span>Item Ordered:</span>
                    <span>
                      {directBuyFood.name} (x{directBuyForm.quantity})
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justify: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <span>Total Amount Paid:</span>
                    <strong style={{ color: "#3ecf8e" }}>
                      ₹{directBuyOrderSuccess.totalAmount}
                    </strong>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>Payment Card:</span>
                    <span>
                      Card ending in •••• {directBuyOrderSuccess.cardLast4}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => setDirectBuyFood(null)}
                  style={{ width: "100%" }}
                >
                  Back to FoodFusion
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="navbar">
        <div
          className="nav-logo"
          onClick={() => {
            setPage("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span className="nav-logo-icon">🔥</span>
          <span>
            <span>Food</span>Fusion
          </span>
        </div>

        <div className="nav-links">
          <button
            type="button"
            className={page === "home" ? "nav-link active" : "nav-link"}
            onClick={() => {
              setPage("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </button>

          <button
            type="button"
            className={page === "menu" ? "nav-link active" : "nav-link"}
            onClick={goToMenu}
          >
            <span className="nav-icon">📜</span>
            <span>Menu</span>
          </button>

          <button
            type="button"
            className={page === "cart" ? "nav-link active" : "nav-link"}
            onClick={goToCart}
          >
            <span className="nav-icon">🛒</span>
            <span>Cart</span>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
        </div>

        <div className="nav-auth-controls">
          {currentUser ? (
            <div className="nav-user-badge">
              <span>👤 {currentUser.name}</span>
              <span
                className={`role-tag ${
                  currentUser.role === "admin" ? "admin" : "user"
                }`}
              >
                {currentUser.role === "admin" ? "⚡ Admin" : "User"}
              </span>
              <button
                type="button"
                className="nav-logout-btn"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="nav-login-btn"
              onClick={() => setShowGatedAuthForm(true)}
            >
              🔑 Log In / Sign Up
            </button>
          )}

          <button type="button" className="nav-order-btn" onClick={goToMenu}>
            ⚡ Order Now
          </button>
        </div>
      </nav>

      {/* PAGE ROUTING */}
      {page === "home" && (
        <main>
          <section className="hero-section">
            <div className="hero-content">
              <p className="section-label">WELCOME TO FOODFUSION</p>
              <h1>
                Good food.
                <br />
                Made simple.
              </h1>
              <p className="hero-description">
                Discover gourmet meals, enjoy lightning fast ordering, and track
                your live deliveries.
              </p>

              <div className="hero-actions">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={goToMenu}
                >
                  Explore Menu →
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={goToCart}
                >
                  View Cart
                </button>
              </div>
            </div>

            <div className="hero-food-card">
              <div className="hero-food-emoji">🍕</div>
              <div className="hero-food-info">
                <span>Today's Favourite</span>
                <strong>Veg Cheese Pizza</strong>
                <small>⭐ 4.8 · ₹279</small>
              </div>
            </div>
          </section>

          <section className="home-section">
            <div className="section-heading">
              <div>
                <p className="section-label">POPULAR</p>
                <h2>Customer favourites</h2>
              </div>
              <button type="button" className="text-btn" onClick={goToMenu}>
                See menu →
              </button>
            </div>

            <div className="food-grid">
              {activeFoodItems.slice(0, 4).map((food) => (
                <article className="food-card" key={food.id}>
                  <button
                    type="button"
                    className="food-image"
                    onClick={() => openFoodDetails(food)}
                  >
                    <span>{food.emoji}</span>
                  </button>

                  <div className="food-card-content">
                    <div className="food-card-top">
                      <div>
                        <span className="food-category">{food.category}</span>
                        <h3>{food.name}</h3>
                      </div>
                      <strong>₹{food.price}</strong>
                    </div>

                    <p>{food.description}</p>

                    <div className="food-card-bottom">
                      <span>⭐ {food.rating}</span>

                      <div className="food-card-actions">
                        <button
                          type="button"
                          className="buy-now-btn"
                          onClick={() => openDirectBuy(food)}
                        >
                          ⚡ Buy Now
                        </button>
                        <button
                          type="button"
                          className="small-add-btn"
                          onClick={() => addToCart(food)}
                        >
                          + Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      )}

      {page === "menu" && (
        <main>
          <section className="menu-page">
            <div className="menu-header">
              <div>
                <p className="section-label">OUR MENU</p>
                <h1>Find something delicious.</h1>
                <p>
                  Browse our gourmet food, search your favourites, and order
                  instantly.
                </p>
              </div>
            </div>

            <div className="menu-controls">
              <div className="search-box">
                <span>🔎</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for pizza, burger, pasta..."
                />
              </div>

              <div className="custom-sort-wrapper">
                <span className="sort-icon">⚡</span>
                <select
                  className="custom-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="default">Sort: Recommended 🌟</option>
                  <option value="low">Price: Low to High 📈</option>
                  <option value="high">Price: High to Low 📉</option>
                  <option value="rating">Highest Rated ⭐</option>
                </select>
                <span className="sort-arrow">▼</span>
              </div>
            </div>

            <div className="category-filter">
              <button
                type="button"
                className={
                  selectedCategory === "All"
                    ? "select-all-btn active"
                    : "select-all-btn"
                }
                onClick={() => setSelectedCategory("All")}
              >
                ✨ Select All
              </button>
              {categories
                .filter((c) => c !== "All")
                .map((category) => (
                  <button
                    type="button"
                    key={category}
                    className={selectedCategory === category ? "active" : ""}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
            </div>

            <div className="food-grid">
              {filteredFood.map((food) => (
                <article className="food-card" key={food.id}>
                  <button
                    type="button"
                    className="food-image"
                    onClick={() => openFoodDetails(food)}
                  >
                    <span>{food.emoji}</span>
                  </button>

                  <div className="food-card-content">
                    <div className="food-card-top">
                      <div>
                        <span className="food-category">{food.category}</span>
                        <h3>{food.name}</h3>
                      </div>
                      <strong>₹{food.price}</strong>
                    </div>

                    <p>{food.description}</p>

                    <div className="food-card-bottom">
                      <span>⭐ {food.rating}</span>

                      <div className="food-card-actions">
                        <button
                          type="button"
                          className="buy-now-btn"
                          onClick={() => openDirectBuy(food)}
                        >
                          ⚡ Buy Now
                        </button>
                        <button
                          type="button"
                          className="small-add-btn"
                          onClick={() => addToCart(food)}
                        >
                          + Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      )}

      {page === "details" && selectedFood && (
        <main className="food-details-page">
          <button type="button" className="back-link" onClick={goToMenu}>
            ← Back to Menu
          </button>

          <div className="food-details-card">
            <div className="food-details-image">
              <span>{selectedFood.emoji}</span>
            </div>

            <div className="food-details-content">
              <span className="food-category">{selectedFood.category}</span>
              <h1>{selectedFood.name}</h1>

              <div className="details-meta">
                <span className="rating">⭐ {selectedFood.rating}</span>
                <span className="price">₹{selectedFood.price}</span>
              </div>

              <p className="description">
                {selectedFood.details || selectedFood.description}
              </p>

              <div className="quantity-selector">
                <span>Quantity:</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <strong>{quantity}</strong>
                <button type="button" onClick={() => setQuantity(quantity + 1)}>
                  +
                </button>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button
                  type="button"
                  className="primary-btn"
                  style={{ flex: 1 }}
                  onClick={() => openDirectBuy(selectedFood)}
                >
                  ⚡ Buy Now Directly (₹{selectedFood.price * quantity})
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => addToCart(selectedFood, quantity)}
                >
                  + Add to Cart
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {page === "cart" && (
        <main className="cart-page">
          <h1>Your Order Cart</h1>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <span style={{ fontSize: "3rem" }}>🛒</span>
              <h2>Your cart is empty</h2>
              <button
                type="button"
                className="primary-btn"
                onClick={goToMenu}
                style={{ marginTop: "16px" }}
              >
                Explore Menu
              </button>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items">
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <span>{item.emoji}</span>
                    <div>
                      <h3>{item.name}</h3>
                      <p>₹{item.price}</p>
                    </div>
                    <div className="quantity-controls">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.id)}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.id)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      )}

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-column">
            <h3>FoodFusion</h3>
            <p>
              Delivering gourmet food made with passion &amp; quality ingredients.
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} FoodFusion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;