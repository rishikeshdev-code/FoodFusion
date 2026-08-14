const mongoose = require("mongoose");
const path = require("path");
const dns = require("dns");
require("dotenv").config({ path: path.join(__dirname, ".env") });

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (dnsErr) {
  // Use default system resolver if custom DNS cannot be configured
}

const Food = require("./models/food");

const foods = [
  {
    name: "Veg Cheese Pizza",
    category: "Pizza",
    price: 279,
    rating: 4.8,
    emoji: "🍕",
    description:
      "Cheesy pizza topped with fresh vegetables and Italian herbs.",
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
    name: "French Fries",
    category: "Burgers",
    price: 119,
    rating: 4.6,
    emoji: "🍟",
    description:
      "Crispy golden French fries seasoned with salt and herbs.",
    details:
      "Golden and crispy potato fries prepared fresh and lightly seasoned for the perfect crunchy snack.",
    ingredients: ["Potato", "Salt", "Black Pepper", "Herbs", "Oil"],
  },

  {
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

  {
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

/* =====================================================
   SEED DATABASE
===================================================== */

const seedFoods = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;
    await mongoose.connect(mongoUri);

    console.log("MongoDB connected successfully ✅");

    /* Remove existing food data */
    await Food.deleteMany({});

    console.log("Existing food data cleared.");

    /* Insert new food data */
    const insertedFoods = await Food.insertMany(foods);

    console.log(
      `${insertedFoods.length} food items inserted successfully 🍽️`
    );

    await mongoose.connection.close();

    console.log("Database connection closed.");

    process.exit(0);
  } catch (error) {
    console.error("Food seeding failed ❌");
    console.error(error.message);

    await mongoose.connection.close();

    process.exit(1);
  }
};

seedFoods();