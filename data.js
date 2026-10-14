// 12-week (84-day) program data — vegetarian Indian meal plan (~1400 kcal/day)
const MEAL_SLOTS = [
  { id: "wake", name: "On waking", time: "6:30 AM", icon: "🌅" },
  { id: "bf", name: "Breakfast", time: "8:30 AM", icon: "🍳" },
  { id: "mid", name: "Mid-morning", time: "11:00 AM", icon: "🍎" },
  { id: "lunch", name: "Lunch", time: "1:30 PM", icon: "🍛" },
  { id: "eve", name: "Evening snack", time: "5:00 PM", icon: "🍵" },
  { id: "dinner", name: "Dinner", time: "7:30 PM", icon: "🥗" },
];

// Per day: [wake, bf, mid, lunch, eve, dinner] — t: food, k: kcal
const MEAL_DAYS = [
  [
    { t: "Warm water + half a lemon", k: 5 },
    { t: "Moong dal chilla (2) + mint chutney", k: 280 },
    { t: "1 apple", k: 80 },
    { t: "2 rotis (no ghee) + lauki sabzi + 1 bowl dal + salad", k: 430 },
    { t: "Green tea + 10 soaked almonds", k: 80 },
    { t: "Mixed veg soup + paneer bhurji (75g) + 1 roti", k: 380 },
  ],
  [
    { t: "Methi seed water (soaked overnight)", k: 5 },
    { t: "Veg oats upma, 1 bowl", k: 250 },
    { t: "1 small banana", k: 90 },
    { t: "1 bowl brown rice + 1 bowl rajma + cucumber-tomato salad", k: 450 },
    { t: "Roasted chana 30g + lemon water", k: 110 },
    { t: "2 rotis + palak sabzi + 1 glass buttermilk", k: 350 },
  ],
  [
    { t: "Warm water + 1 tsp honey", k: 25 },
    { t: "Besan veggie chilla (2) + 100g curd", k: 290 },
    { t: "1 orange / mosambi", k: 60 },
    { t: "2 rotis + bhindi sabzi + arhar dal + salad", k: 440 },
    { t: "Green tea + 1 handful roasted makhana", k: 90 },
    { t: "Paneer/tofu tikka (100g) + grilled veggies + soup", k: 370 },
  ],
  [
    { t: "Jeera water", k: 5 },
    { t: "Veg poha, 1 bowl + 15g peanuts", k: 270 },
    { t: "1 bowl papaya", k: 70 },
    { t: "1 bowl moong dal khichdi + curd + salad", k: 400 },
    { t: "1 glass coconut water + 5 walnut halves", k: 100 },
    { t: "2 rotis + lauki-chana dal + veg raita", k: 380 },
  ],
  [
    { t: "Ajwain water", k: 5 },
    { t: "Idli (3) + 1 bowl sambar", k: 260 },
    { t: "1 guava", k: 70 },
    { t: "2 rotis + mixed dal + tori sabzi + salad", k: 430 },
    { t: "Green tea + 1 handful roasted chana", k: 110 },
    { t: "Veg dalia khichdi, 1.5 bowls + buttermilk", k: 360 },
  ],
  [
    { t: "Warm water + lemon + ½ tsp ginger juice", k: 8 },
    { t: "Sprouts salad, 1 large bowl + 1 brown toast", k: 250 },
    { t: "1 bowl watermelon / muskmelon", k: 50 },
    { t: "1 bowl rice + low-oil kadhi + stuffed capsicum + salad", k: 450 },
    { t: "Masala buttermilk + 8 almonds", k: 120 },
    { t: "Paneer-veg roti wrap + soup", k: 350 },
  ],
  [
    { t: "5 soaked almonds + warm water", k: 40 },
    { t: "Moong dal idli with fruit & curd bowl", k: 260 },
    { t: "1 kiwi / pear", k: 60 },
    { t: "2 rotis + lauki chana dal + light palak paneer + salad", k: 460 },
    { t: "Herbal tea + 2 Marie biscuits", k: 70 },
    { t: "Mixed veg soup + moong dal + 1 roti", k: 330 },
  ],
];

const PHASES = [
  { name: "Phase 1: Foundation", weeks: "Weeks 1–4", goal: "Build the habit, prepare your body" },
  { name: "Phase 2: Fat Burn", weeks: "Weeks 5–8", goal: "Raise stamina and calorie burn" },
  { name: "Phase 3: Toning", weeks: "Weeks 9–12", goal: "Shape up and build strength" },
];

// 3 phases × 7 weekdays
const EX_WEEK = [
  [
    { title: "Brisk walk + stretching", items: ["Warm-up 5 min", "Brisk walk 30 min", "Stretching 5 min"] },
    { title: "Basic strength", items: ["Squats 2×10", "Wall push-ups 2×10", "Glute bridge 2×10", "Plank 2×20 sec"] },
    { title: "Yoga + walk", items: ["Surya Namaskar 5 rounds", "Bhujangasana, Tadasana, Vrikshasana", "Walk 20 min"] },
    { title: "Light cardio", items: ["March in place 10 min", "Step-ups 2×1 min", "Walk 20 min"] },
    { title: "Basic strength", items: ["Squats 2×12", "Knee push-ups 2×8", "Lunges 2×8", "Crunches 2×10"] },
    { title: "Long walk", items: ["Easy walk 45 min", "Pranayama 5 min"] },
    { title: "Rest day", rest: true, items: ["Light stretching 10 min", "Anulom-Vilom 5 min"] },
  ],
  [
    { title: "Brisk walk / jog", items: ["Warm-up 5 min", "Jog-walk intervals 35 min", "Cool-down 5 min"] },
    { title: "Full-body strength", items: ["Squats 3×12", "Push-ups 3×8", "Lunges 3×10", "Plank 3×30 sec", "Tricep dips 2×10"] },
    { title: "HIIT (20 min)", items: ["Jumping jacks 30 sec", "High knees 30 sec", "Mountain climbers 30 sec", "Rest 30 sec", "× 8 rounds"] },
    { title: "Yoga + core", items: ["Surya Namaskar 10 rounds", "Navasana 3×15 sec", "Bicycle crunch 3×12"] },
    { title: "Full-body strength", items: ["Goblet squats 3×12", "Push-ups 3×10", "Reverse lunges 3×10", "Superman 3×12"] },
    { title: "Long walk / cycling", items: ["Walk or cycle 50 min"] },
    { title: "Rest day", rest: true, items: ["Yoga nidra 10 min", "Light stretching"] },
  ],
  [
    { title: "Cardio 40 min", items: ["Warm-up 5 min", "Jog / cycle 30 min", "Cool-down 5 min"] },
    { title: "Strength (upper + core)", items: ["Push-ups 4×10", "Tricep dips 3×12", "Plank 3×45 sec", "Leg raises 3×12", "Russian twists 3×20"] },
    { title: "HIIT (25 min)", items: ["Burpees 30 sec", "Jump squats 30 sec", "Mountain climbers 30 sec", "Rest 20 sec", "× 10 rounds"] },
    { title: "Yoga + core", items: ["Surya Namaskar 12 rounds", "Virabhadrasana, Trikonasana", "Plank hold 1 min"] },
    { title: "Strength (lower body)", items: ["Jump squats 4×12", "Walking lunges 4×12", "Glute bridge 4×15", "Calf raises 3×20"] },
    { title: "Long jog / walk", items: ["Jog-walk 60 min"] },
    { title: "Rest day", rest: true, items: ["Stretching 15 min", "Pranayama 10 min"] },
  ],
];

const TIPS = [
  "Start your day with a glass of warm water.",
  "Drink a glass of water 15 minutes before each meal.",
  "Chew slowly — at least 20 times per bite.",
  "Finish dinner 2–3 hours before sleeping.",
  "Sleep 7–8 hours; good sleep speeds up fat loss.",
  "Keep sweets, fried food and cold drinks to a minimum.",
  "Weigh yourself once a week, same time of day.",
  "Take the stairs and walk 10 minutes after meals.",
  "Include protein (dal, paneer, sprouts) in every meal.",
  "Missed a day? Don't worry — just restart tomorrow.",
];

// Non-veg swaps: day index -> { slot index: meal }. Used when diet = "nonveg".
const NONVEG_SWAPS = {
  0: { 3: { t: "2 rotis + chicken curry (100g, light) + salad", k: 450 } },
  1: { 1: { t: "2 egg-white omelette + 1 brown toast + veggies", k: 230 }, 5: { t: "Grilled fish (120g) + sautéed veggies + 1 roti", k: 380 } },
  2: { 5: { t: "Grilled chicken breast (100g) + veggies + soup", k: 340 } },
  3: { 1: { t: "2 boiled eggs + veg poha, small bowl", k: 290 }, 3: { t: "1 bowl rice + fish curry (light) + salad", k: 440 } },
  4: { 5: { t: "Chicken clear soup + egg bhurji (2 eggs) + 1 roti", k: 370 } },
  5: { 3: { t: "2 rotis + egg curry (2 eggs) + salad", k: 440 } },
  6: { 5: { t: "Chicken & veg stew + 1 roti", k: 340 } },
};
