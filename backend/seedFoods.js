const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const Food = require("./models/food");

const foods = [
  /* =====================================================
     VEGETARIAN
  ===================================================== */

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
    name: "Peri Peri Fries",
    category: "Burgers",
    price: 119,
    rating: 4.6,
    emoji: "🍟",
    description:
      "Crispy golden fries coated with spicy peri peri seasoning.",
    details:
      "Golden and crispy potato fries tossed with flavorful peri peri seasoning for a spicy and crunchy snack.",
    ingredients: [
      "Potato",
      "Peri Peri Seasoning",
      "Salt",
      "Paprika",
      "Oil",
    ],
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
      "A soft tortilla wrap packed with seasoned vegetables, grilled paneer, lettuce and a flavorful creamy sauce.",
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
      "Tender paneer cubes cooked in a creamy tomato and onion gravy with aromatic Indian spices and fresh coriander.",
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
    name: "Veg Manchurian Soup",
    category: "Chinese",
    price: 139,
    rating: 4.7,
    emoji: "🍲",
    description:
      "Warm and flavorful Indo-Chinese soup with vegetable dumplings.",
    details:
      "A comforting hot soup filled with vegetable Manchurian balls, fresh vegetables, garlic and flavorful Indo-Chinese spices.",
    ingredients: [
      "Vegetable Manchurian",
      "Cabbage",
      "Carrot",
      "Garlic",
      "Soy Sauce",
      "Spring Onion",
    ],
  },

  {
    name: "Grilled Veg Sandwich",
    category: "Burgers",
    price: 129,
    rating: 4.6,
    emoji: "🥪",
    description:
      "Crispy grilled sandwich filled with fresh vegetables and cheese.",
    details:
      "Golden grilled bread packed with crunchy vegetables, melted cheese, herbs and a flavorful sandwich spread.",
    ingredients: [
      "Bread",
      "Cheese",
      "Capsicum",
      "Tomato",
      "Onion",
      "Sandwich Spread",
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
    name: "Vanilla Ice Cream",
    category: "Desserts",
    price: 89,
    rating: 4.7,
    emoji: "🍦",
    description:
      "Smooth and creamy vanilla ice cream served chilled.",
    details:
      "Classic creamy vanilla ice cream made with rich milk and natural vanilla flavour for a refreshing sweet treat.",
    ingredients: [
      "Milk",
      "Cream",
      "Sugar",
      "Vanilla",
    ],
  },

  {
    name: "Masala Dosa",
    category: "Indian",
    price: 149,
    rating: 4.8,
    emoji: "🥞",
    description:
      "Crispy golden dosa filled with flavorful potato masala.",
    details:
      "A thin and crispy South Indian dosa filled with spiced potato masala and served with coconut chutney and sambar.",
    ingredients: [
      "Rice Batter",
      "Potato",
      "Onion",
      "Mustard Seeds",
      "Curry Leaves",
      "Spices",
    ],
  },

  /* =====================================================
     NON-VEG
  ===================================================== */

  {
    name: "Chicken Biryani",
    category: "Non-Veg",
    price: 249,
    rating: 4.9,
    emoji: "🍗",
    description:
      "Aromatic basmati rice cooked with tender chicken and rich spices.",
    details:
      "Fragrant basmati rice layered with tender chicken, caramelized onions, saffron and aromatic biryani spices.",
    ingredients: [
      "Basmati Rice",
      "Chicken",
      "Onion",
      "Saffron",
      "Biryani Spices",
      "Coriander",
    ],
  },

  {
    name: "Chicken Tikka",
    category: "Non-Veg",
    price: 229,
    rating: 4.8,
    emoji: "🍢",
    description:
      "Juicy grilled chicken pieces marinated with aromatic spices.",
    details:
      "Tender chicken pieces marinated in yogurt and Indian spices, grilled until smoky and lightly charred.",
    ingredients: [
      "Chicken",
      "Yogurt",
      "Ginger",
      "Garlic",
      "Tikka Spices",
      "Lemon",
    ],
  },

  {
    name: "Chicken Burger",
    category: "Non-Veg",
    price: 199,
    rating: 4.8,
    emoji: "🍔",
    description:
      "Crispy chicken patty burger with fresh vegetables and sauce.",
    details:
      "A toasted burger bun filled with a crispy chicken patty, fresh lettuce, tomato, cheese and creamy sauce.",
    ingredients: [
      "Burger Bun",
      "Chicken Patty",
      "Lettuce",
      "Tomato",
      "Cheese",
      "Special Sauce",
    ],
  },

  {
    name: "Chicken Wings",
    category: "Non-Veg",
    price: 219,
    rating: 4.7,
    emoji: "🍗",
    description:
      "Crispy chicken wings tossed in a flavorful spicy sauce.",
    details:
      "Juicy chicken wings fried until crispy and coated with a delicious spicy and tangy sauce.",
    ingredients: [
      "Chicken Wings",
      "Chilli Sauce",
      "Garlic",
      "Pepper",
      "Spices",
      "Oil",
    ],
  },

  {
    name: "Butter Chicken",
    category: "Non-Veg",
    price: 269,
    rating: 4.9,
    emoji: "🍛",
    description:
      "Tender chicken cooked in a creamy tomato and butter gravy.",
    details:
      "Succulent chicken pieces simmered in a rich tomato-based gravy with butter, cream and aromatic Indian spices.",
    ingredients: [
      "Chicken",
      "Tomato",
      "Butter",
      "Cream",
      "Garam Masala",
      "Coriander",
    ],
  },

  {
    name: "Chicken Tandoori",
    category: "Non-Veg",
    price: 279,
    rating: 4.9,
    emoji: "🍗",
    description:
      "Juicy chicken marinated in spices and roasted in a tandoor.",
    details:
      "Classic tandoori chicken marinated with yogurt, herbs and spices, then roasted until smoky and beautifully charred.",
    ingredients: [
      "Chicken",
      "Yogurt",
      "Ginger",
      "Garlic",
      "Tandoori Spices",
      "Lemon",
    ],
  },

  {
    name: "Chicken Kebab",
    category: "Non-Veg",
    price: 239,
    rating: 4.8,
    emoji: "🍢",
    description:
      "Juicy spiced chicken kebabs grilled until tender and smoky.",
    details:
      "Tender minced chicken blended with herbs and spices, shaped into kebabs and grilled for a delicious smoky flavour.",
    ingredients: [
      "Chicken",
      "Onion",
      "Coriander",
      "Ginger",
      "Garlic",
      "Spices",
    ],
  },

  {
    name: "Chicken Noodles",
    category: "Non-Veg",
    price: 189,
    rating: 4.7,
    emoji: "🍜",
    description:
      "Stir-fried noodles tossed with chicken and fresh vegetables.",
    details:
      "Hakka-style noodles stir-fried with tender chicken, cabbage, carrot, capsicum and flavorful Chinese sauces.",
    ingredients: [
      "Noodles",
      "Chicken",
      "Cabbage",
      "Carrot",
      "Capsicum",
      "Soy Sauce",
    ],
  },

  {
    name: "Chicken Fried Rice",
    category: "Non-Veg",
    price: 199,
    rating: 4.7,
    emoji: "🍚",
    description:
      "Flavorful fried rice cooked with tender chicken and vegetables.",
    details:
      "Fragrant rice stir-fried with tender chicken pieces, vegetables, spring onions and savory Chinese sauces.",
    ingredients: [
      "Rice",
      "Chicken",
      "Carrot",
      "Capsicum",
      "Spring Onion",
      "Soy Sauce",
    ],
  },

  {
    name: "Fish Fry",
    category: "Non-Veg",
    price: 229,
    rating: 4.8,
    emoji: "🐟",
    description:
      "Crispy fried fish coated with aromatic spices.",
    details:
      "Fresh fish fillets marinated with Indian spices and lemon, then fried until crispy and golden.",
    ingredients: [
      "Fish",
      "Red Chilli",
      "Turmeric",
      "Lemon",
      "Ginger Garlic",
      "Spices",
    ],
  },

  {
    name: "Fish Curry",
    category: "Non-Veg",
    price: 249,
    rating: 4.8,
    emoji: "🐟",
    description:
      "Tender fish cooked in a flavorful traditional curry.",
    details:
      "Fresh fish pieces gently cooked in a rich and aromatic curry prepared with tomatoes, spices and fresh herbs.",
    ingredients: [
      "Fish",
      "Tomato",
      "Onion",
      "Coconut",
      "Turmeric",
      "Spices",
    ],
  },

  {
    name: "Chicken Wrap",
    category: "Non-Veg",
    price: 179,
    rating: 4.7,
    emoji: "🌯",
    description:
      "Soft wrap filled with grilled chicken and fresh vegetables.",
    details:
      "A soft tortilla packed with juicy grilled chicken, lettuce, tomato, onion and creamy garlic sauce.",
    ingredients: [
      "Tortilla",
      "Chicken",
      "Lettuce",
      "Tomato",
      "Onion",
      "Garlic Sauce",
    ],
  },

  {
    name: "Chicken Pizza",
    category: "Non-Veg",
    price: 299,
    rating: 4.8,
    emoji: "🍕",
    description:
      "Cheesy pizza topped with seasoned chicken and fresh vegetables.",
    details:
      "A crispy pizza base loaded with mozzarella cheese, seasoned chicken, onion, capsicum and aromatic herbs.",
    ingredients: [
      "Pizza Dough",
      "Chicken",
      "Mozzarella",
      "Onion",
      "Capsicum",
      "Oregano",
    ],
  },

  {
    name: "Egg Masala",
    category: "Non-Veg",
    price: 159,
    rating: 4.7,
    emoji: "🥚",
    description:
      "Boiled eggs cooked in a spicy and flavorful Indian masala.",
    details:
      "Boiled eggs simmered in a rich onion and tomato gravy seasoned with aromatic Indian spices.",
    ingredients: [
      "Egg",
      "Tomato",
      "Onion",
      "Ginger",
      "Garlic",
      "Indian Spices",
    ],
  },

  {
    name: "Chicken Curry",
    category: "Non-Veg",
    price: 239,
    rating: 4.8,
    emoji: "🍲",
    description:
      "Tender chicken simmered in a rich traditional Indian curry.",
    details:
      "Tender chicken pieces slowly cooked with onion, tomato, ginger, garlic and aromatic Indian spices.",
    ingredients: [
      "Chicken",
      "Onion",
      "Tomato",
      "Ginger",
      "Garlic",
      "Garam Masala",
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