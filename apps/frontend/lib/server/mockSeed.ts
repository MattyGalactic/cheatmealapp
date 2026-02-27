import type { MenuItemRecord, RestaurantRecord } from "@cheatmeal/types";

type ProfileKey =
  | "chipotle"
  | "chickfila"
  | "mcdonalds"
  | "tacoBell"
  | "panera"
  | "wendys"
  | "subway"
  | "fiveGuys"
  | "shakeShack"
  | "starbucks"
  | "jerseyMikes"
  | "cava"
  | "zaxbys"
  | "canes"
  | "popeyes"
  | "whataburger"
  | "pandaExpress"
  | "blazePizza"
  | "dominos"
  | "papaJohns"
  | "qdoba"
  | "sweetgreen"
  | "crackerBarrel"
  | "bww"
  | "burgerKing"
  | "kfc";

type MenuTuple = [name: string, calories: number, proteinGrams: number, priceUsd: number];
type RestaurantTuple = [
  id: string,
  name: string,
  address: string,
  latitude: number,
  longitude: number,
  ratingWeight: number,
  distanceMiles: number,
  menuProfile: ProfileKey,
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function estimateMacros(name: string, calories: number, proteinGrams: number): { carbsGrams: number; fatGrams: number } {
  const lowerName = name.toLowerCase();
  const dessertLike = /(cookie|brownie|cake|muffin|pie|parfait|shake|mcflurry|custard|frosty|treat)/.test(lowerName);
  const friedLike = /(fried|fries|crispy|breaded|nugget|finger|wing|sandwich|burger|pizza|quesadilla|mac|cheese)/.test(
    lowerName,
  );
  const saladLike = /(salad|bowl|greens|veggie|vegetable|fruit|beans|grilled)/.test(lowerName);

  let fatCaloriesRatio = 0.34;
  if (dessertLike) fatCaloriesRatio = 0.3;
  else if (friedLike) fatCaloriesRatio = 0.42;
  else if (saladLike) fatCaloriesRatio = 0.26;

  const proteinCalories = proteinGrams * 4;
  const fatGrams = Math.max(1, Math.round((calories * fatCaloriesRatio) / 9));
  const remainingCalories = Math.max(calories - proteinCalories - fatGrams * 9, 0);
  const carbsGrams = Math.max(0, Math.round(remainingCalories / 4));

  return { carbsGrams, fatGrams };
}

function menuItemsForRestaurant(restaurantId: string, tuples: MenuTuple[]): MenuItemRecord[] {
  return tuples.map(([name, calories, proteinGrams, priceUsd], index) => {
    const { carbsGrams, fatGrams } = estimateMacros(name, calories, proteinGrams);

    return {
      id: `${restaurantId}-${String(index + 1).padStart(2, "0")}-${slugify(name)}`,
      restaurantId,
      name,
      calories,
      proteinGrams,
      carbsGrams,
      fatGrams,
      priceUsd,
    };
  });
}

const menuProfiles: Record<ProfileKey, MenuTuple[]> = {
  chipotle: [
    ["Chicken Salad Bowl", 420, 35, 10.95],
    ["Steak Bowl (Light Rice)", 510, 32, 12.45],
    ["Double Chicken Bowl (Fajita Veg)", 540, 58, 13.95],
    ["Chicken Burrito", 740, 42, 11.45],
    ["Steak Burrito", 790, 39, 12.95],
    ["Veggie Burrito Bowl", 610, 18, 10.25],
    ["Kids Build Your Own (Chicken)", 360, 22, 6.95],
    ["Side of Black Beans", 150, 8, 2.25],
    ["Chips and Guacamole", 770, 9, 5.25],
    ["Chicken Quesadilla", 830, 38, 11.95],
  ],
  chickfila: [
    ["12 ct Grilled Nuggets", 200, 38, 8.49],
    ["8 ct Nuggets", 250, 28, 5.49],
    ["Grilled Chicken Sandwich", 390, 28, 6.99],
    ["Spicy Chicken Sandwich", 460, 28, 6.89],
    ["Cool Wrap", 660, 43, 10.19],
    ["Egg White Grill", 300, 27, 5.79],
    ["Grilled Filet", 150, 25, 4.59],
    ["Kale Crunch Side", 170, 4, 3.19],
    ["Waffle Potato Fries (Medium)", 420, 5, 2.89],
    ["Chocolate Chunk Cookie", 370, 4, 1.89],
  ],
  mcdonalds: [
    ["Egg McMuffin", 310, 17, 4.39],
    ["Hamburger", 250, 12, 2.39],
    ["Cheeseburger", 300, 15, 2.79],
    ["McDouble", 400, 22, 3.49],
    ["McChicken", 400, 14, 3.29],
    ["10 pc Chicken McNuggets", 410, 23, 6.19],
    ["Filet-O-Fish", 390, 16, 5.29],
    ["Quarter Pounder with Cheese", 520, 30, 6.59],
    ["Large Fries", 480, 7, 3.99],
    ["McFlurry with OREO", 510, 12, 4.99],
  ],
  tacoBell: [
    ["Crunchy Taco", 170, 8, 1.99],
    ["Chicken Soft Taco", 170, 10, 2.49],
    ["Cheesy Roll Up", 180, 5, 1.49],
    ["Bean Burrito", 360, 13, 2.89],
    ["Chicken Quesadilla", 510, 27, 5.79],
    ["Crunchwrap Supreme", 530, 16, 5.49],
    ["Power Bowl - Chicken", 470, 26, 7.99],
    ["Chipotle Ranch Grilled Chicken Burrito", 510, 21, 3.49],
    ["Nachos BellGrande", 740, 19, 6.49],
    ["Cinnamon Twists", 170, 1, 1.79],
  ],
  panera: [
    ["Turkey Chili (Cup)", 300, 21, 6.49],
    ["Greek Salad", 390, 12, 8.99],
    ["Caesar Salad with Chicken", 470, 33, 11.79],
    ["Mediterranean Veggie Sandwich", 510, 17, 10.49],
    ["Chipotle Chicken Avocado Melt", 760, 46, 12.99],
    ["Bacon Turkey Bravo", 840, 36, 13.29],
    ["Broccoli Cheddar Soup (Bowl)", 360, 14, 7.29],
    ["Mac and Cheese", 480, 16, 8.49],
    ["Kitchen Sink Cookie", 820, 8, 4.29],
    ["Fruit Cup", 150, 1, 3.99],
  ],
  wendys: [
    ["Grilled Chicken Wrap", 320, 26, 5.29],
    ["Jr. Hamburger", 250, 13, 2.39],
    ["Jr. Cheeseburger Deluxe", 340, 16, 2.99],
    ["Spicy Chicken Sandwich", 490, 27, 6.49],
    ["Dave's Single", 590, 29, 7.19],
    ["10 pc Crispy Nuggets", 420, 23, 5.79],
    ["Baked Potato (Plain)", 270, 7, 3.29],
    ["Small Chili", 240, 17, 3.49],
    ["Medium Fries", 350, 5, 2.99],
    ["Small Frosty", 330, 9, 2.29],
  ],
  subway: [
    ["6-inch Turkey Breast", 280, 18, 6.99],
    ["6-inch Rotisserie Chicken", 330, 24, 7.49],
    ["6-inch Veggie Delite", 240, 8, 5.99],
    ["Footlong Oven Roasted Turkey", 560, 36, 10.99],
    ["Footlong Steak and Cheese", 760, 42, 12.49],
    ["Protein Bowl - Chicken", 420, 30, 11.49],
    ["Chopped Salad (Turkey)", 220, 16, 8.49],
    ["Baked Lay's Chips", 150, 2, 1.79],
    ["Chocolate Chip Cookie", 210, 2, 1.19],
    ["Footlong Meatball Marinara", 940, 40, 11.99],
  ],
  fiveGuys: [
    ["Little Hamburger", 540, 24, 8.49],
    ["Little Cheeseburger", 610, 28, 9.19],
    ["Hamburger", 840, 39, 10.29],
    ["Cheeseburger", 980, 45, 11.09],
    ["Bacon Cheeseburger", 1060, 51, 12.29],
    ["Little Cajun Fries", 530, 8, 4.99],
    ["Regular Fries", 950, 15, 6.19],
    ["Veggie Sandwich", 440, 13, 6.99],
    ["Hot Dog", 520, 18, 6.49],
    ["Milkshake", 670, 15, 5.99],
  ],
  shakeShack: [
    ["Hamburger", 400, 20, 7.49],
    ["Cheeseburger", 450, 24, 8.19],
    ["ShackBurger", 500, 28, 8.99],
    ["SmokeShack", 570, 31, 9.69],
    ["Chicken Shack", 590, 29, 8.99],
    ["Avocado Bacon Chicken", 670, 34, 10.99],
    ["Fries", 470, 6, 4.49],
    ["Cheese Fries", 710, 12, 5.79],
    ["Single Scoop Frozen Custard", 300, 7, 4.69],
    ["Vanilla Shake", 680, 16, 6.49],
  ],
  starbucks: [
    ["Egg White & Roasted Pepper Bites", 170, 13, 5.45],
    ["Turkey Bacon Egg White Sandwich", 230, 17, 5.75],
    ["Spinach Feta Egg White Wrap", 290, 20, 5.95],
    ["Bacon & Gruyere Egg Bites", 300, 19, 5.95],
    ["Chicken Maple Butter Sandwich", 550, 27, 6.95],
    ["Protein Box - Eggs and Gouda", 530, 26, 7.95],
    ["Tomato & Mozzarella Focaccia", 390, 15, 6.75],
    ["Butter Croissant", 250, 5, 3.95],
    ["Blueberry Muffin", 360, 6, 3.75],
    ["Chocolate Chip Cookie", 360, 4, 3.45],
  ],
  jerseyMikes: [
    ["Mini Turkey and Provolone", 420, 21, 7.49],
    ["Regular Turkey and Provolone", 690, 33, 10.49],
    ["Mini Club Sub", 500, 28, 8.49],
    ["Regular Chicken Philly", 740, 39, 11.99],
    ["Regular Tuna Fish", 860, 34, 10.99],
    ["Mini Veggie", 380, 14, 6.99],
    ["Sub in a Tub - Turkey", 320, 24, 9.99],
    ["Chips", 210, 3, 1.99],
    ["Cookie", 220, 3, 1.79],
    ["Regular Roast Beef and Provolone", 730, 37, 11.49],
  ],
  cava: [
    ["Greens and Grains Bowl (Chicken)", 560, 38, 13.25],
    ["Harissa Avocado Bowl", 790, 24, 14.49],
    ["Spicy Lamb and Avocado Pita", 720, 33, 14.99],
    ["Chicken and RightRice Bowl", 510, 41, 13.75],
    ["Falafel Greens Bowl", 470, 16, 12.49],
    ["Kids Pita with Chicken", 390, 22, 7.49],
    ["Side Crazy Feta", 180, 5, 3.49],
    ["Side Hummus", 160, 5, 3.29],
    ["Pita Chips", 240, 4, 2.99],
    ["Greek Yogurt Berry Parfait", 280, 10, 4.49],
  ],
  zaxbys: [
    ["Grilled Chicken Sandwich", 430, 35, 7.99],
    ["Chicken Fingerz (5 pc)", 540, 36, 8.49],
    ["Traditional Wings (5 pc)", 470, 32, 8.99],
    ["Boneless Wings (5 pc)", 420, 24, 7.99],
    ["Zalad - Grilled Chicken", 540, 34, 10.99],
    ["Big Zax Snak Meal", 960, 31, 11.49],
    ["Texas Toast", 150, 4, 1.49],
    ["Crinkle Fries (Regular)", 360, 5, 2.79],
    ["Nibbler", 320, 14, 3.29],
    ["Chocolate Chip Cookie", 170, 2, 1.29],
  ],
  canes: [
    ["The Box Combo", 1290, 43, 11.99],
    ["The Caniac Combo (trimmed)", 1400, 65, 15.99],
    ["3 Finger Combo", 1020, 33, 9.99],
    ["Sandwich Combo", 1240, 39, 10.99],
    ["Kids Combo", 670, 21, 6.99],
    ["Chicken Fingers (4 pc)", 520, 34, 7.49],
    ["Crinkle-Cut Fries", 390, 5, 2.69],
    ["Texas Toast", 150, 4, 1.29],
    ["Coleslaw", 150, 1, 1.29],
    ["Cane's Sauce", 190, 0, 0.49],
  ],
  popeyes: [
    ["Blackened Tenders (3 pc)", 170, 26, 5.99],
    ["Classic Chicken Sandwich", 700, 28, 5.99],
    ["Spicy Chicken Sandwich", 700, 28, 5.99],
    ["3 pc Signature Chicken (Mixed)", 640, 40, 8.49],
    ["5 pc Tenders Combo", 1120, 42, 11.99],
    ["Red Beans and Rice (Regular)", 250, 8, 2.99],
    ["Mashed Potatoes with Cajun Gravy", 150, 3, 2.79],
    ["Cajun Fries (Regular)", 270, 4, 2.99],
    ["Biscuit", 210, 3, 1.29],
    ["Apple Pie", 320, 3, 1.99],
  ],
  whataburger: [
    ["Whataburger Jr.", 310, 15, 4.19],
    ["Whataburger", 590, 29, 6.49],
    ["Double Meat Whataburger", 835, 47, 8.29],
    ["Grilled Chicken Sandwich", 430, 31, 6.99],
    ["Whatachick'n Sandwich", 560, 26, 6.79],
    ["Taquito with Cheese", 440, 17, 3.99],
    ["Chicken Apple Cranberry Salad", 470, 36, 8.99],
    ["Medium Fries", 420, 6, 2.89],
    ["Onion Rings", 430, 6, 3.49],
    ["Chocolate Shake (Small)", 520, 11, 3.99],
  ],
  pandaExpress: [
    ["String Bean Chicken Breast", 210, 14, 6.49],
    ["Kung Pao Chicken", 290, 16, 6.49],
    ["Mushroom Chicken", 220, 13, 6.49],
    ["Black Pepper Angus Steak", 180, 19, 7.29],
    ["Grilled Teriyaki Chicken", 300, 36, 7.29],
    ["Orange Chicken", 490, 25, 6.99],
    ["Beijing Beef", 470, 18, 6.99],
    ["Chow Mein", 510, 13, 4.49],
    ["Super Greens", 150, 6, 4.49],
    ["Fried Rice", 520, 11, 4.49],
  ],
  blazePizza: [
    ["Build Your Own 11-inch Pizza", 760, 31, 11.95],
    ["Pepperoni Pizza", 900, 38, 12.45],
    ["Meat Eater Pizza", 1050, 50, 13.95],
    ["Veg Out Pizza", 710, 24, 12.45],
    ["BBQ Chicken Pizza", 860, 39, 13.45],
    ["Caesar Side Salad", 220, 6, 4.95],
    ["Simple Pie (Cheese)", 680, 26, 10.95],
    ["Cheesy Bread", 820, 22, 7.95],
    ["Brownie", 340, 4, 2.95],
    ["Keto Crust Meat Pizza", 640, 44, 14.95],
  ],
  dominos: [
    ["Cheese Pizza (2 slices)", 540, 22, 5.99],
    ["Pepperoni Pizza (2 slices)", 620, 26, 6.49],
    ["Pacific Veggie Pizza (2 slices)", 500, 18, 6.99],
    ["Chicken Alfredo Pasta", 620, 23, 8.49],
    ["Boneless Chicken (8 pc)", 520, 24, 7.99],
    ["Wings (8 pc)", 640, 42, 9.99],
    ["Parmesan Bread Bites", 500, 12, 5.99],
    ["Garden Salad", 180, 5, 4.99],
    ["Lava Crunch Cakes (2 pc)", 720, 8, 6.49],
    ["Thin Crust Cheese Pizza (2 slices)", 380, 17, 5.99],
  ],
  papaJohns: [
    ["Cheese Pizza (2 slices)", 560, 23, 5.99],
    ["Pepperoni Pizza (2 slices)", 640, 27, 6.49],
    ["Garden Fresh Pizza (2 slices)", 520, 18, 6.49],
    ["The Works Pizza (2 slices)", 700, 31, 6.99],
    ["Grilled Buffalo Wings (8 pc)", 620, 44, 10.49],
    ["Cheesesticks", 720, 20, 7.99],
    ["Chicken Poppers", 460, 25, 7.49],
    ["Garden Salad", 170, 5, 4.99],
    ["Chocolate Chip Cookie", 210, 2, 1.79],
    ["Thin Crust BBQ Chicken (2 slices)", 470, 24, 6.99],
  ],
  qdoba: [
    ["Chicken Protein Bowl", 500, 39, 11.95],
    ["Steak Burrito Bowl", 610, 34, 12.45],
    ["Impossible Fajita Bowl", 620, 22, 12.95],
    ["Chicken Quesadilla", 820, 39, 11.49],
    ["Chicken Burrito", 760, 37, 10.99],
    ["3-Cheese Nachos with Chicken", 980, 38, 12.49],
    ["Tortilla Soup (Cup)", 210, 9, 4.49],
    ["Side Brown Rice", 180, 4, 2.49],
    ["Side Queso", 150, 5, 2.29],
    ["Chocolate Chunk Cookie", 320, 4, 2.49],
  ],
  sweetgreen: [
    ["Chicken Pesto Parm Bowl", 630, 35, 14.95],
    ["Harvest Bowl", 705, 20, 14.49],
    ["Shroomami Bowl", 550, 17, 13.95],
    ["Kale Caesar (Chicken)", 490, 32, 14.25],
    ["Hot Honey Chicken Plate", 610, 39, 15.25],
    ["Build Your Own Bowl (Chicken + Greens)", 460, 34, 13.95],
    ["Miso Glazed Salmon Bowl", 590, 31, 16.95],
    ["Side Roasted Sweet Potatoes", 180, 2, 3.49],
    ["Side Black Lentils", 150, 9, 3.49],
    ["Crispy Rice Treat", 220, 2, 3.29],
  ],
  crackerBarrel: [
    ["Grilled Chicken Tenderloins", 320, 44, 11.99],
    ["House Salad with Grilled Chicken", 420, 30, 10.99],
    ["Turkey and Dressing", 780, 31, 13.99],
    ["Chicken n' Dumplins", 450, 19, 10.49],
    ["Country Fried Steak", 960, 38, 14.49],
    ["Meatloaf", 850, 34, 13.79],
    ["Macaroni n' Cheese", 270, 9, 3.29],
    ["Fried Apples", 170, 1, 3.29],
    ["Mashed Potatoes with Gravy", 220, 4, 3.29],
    ["Coca-Cola Cake", 790, 8, 5.49],
  ],
  bww: [
    ["Traditional Wings (6 pc)", 430, 34, 9.99],
    ["Boneless Wings (6 pc)", 480, 24, 8.99],
    ["Naked Tenders", 260, 38, 8.99],
    ["Chicken Caesar Salad", 510, 31, 11.99],
    ["All-American Cheeseburger", 950, 46, 13.99],
    ["Buffalo Ranch Chicken Wrap", 790, 34, 12.49],
    ["French Fries (Regular)", 420, 6, 4.49],
    ["Carrots and Celery", 150, 2, 2.99],
    ["Mozzarella Sticks", 610, 23, 8.49],
    ["Cheesecake Bites", 520, 8, 6.99],
  ],
  burgerKing: [
    ["Hamburger", 250, 13, 2.19],
    ["Cheeseburger", 300, 15, 2.59],
    ["Whopper Jr.", 330, 15, 3.79],
    ["Whopper", 670, 31, 7.29],
    ["Impossible Whopper", 630, 28, 8.49],
    ["Original Chicken Sandwich", 680, 28, 6.99],
    ["8 pc Chicken Fries", 260, 15, 4.29],
    ["Medium French Fries", 370, 5, 2.99],
    ["Garden Side Salad", 160, 5, 3.49],
    ["Hershey's Sundae Pie", 310, 4, 2.49],
  ],
  kfc: [
    ["Kentucky Grilled Chicken Breast", 210, 38, 4.99],
    ["Original Recipe Chicken Breast", 390, 39, 4.99],
    ["Extra Crispy Tenders (3 pc)", 420, 29, 6.49],
    ["Chicken Pot Pie", 720, 26, 6.99],
    ["Famous Bowl", 740, 26, 6.49],
    ["Mashed Potatoes and Gravy", 150, 3, 2.79],
    ["Cole Slaw", 170, 1, 2.79],
    ["Mac and Cheese", 190, 5, 2.99],
    ["Biscuit", 180, 4, 1.19],
    ["Cookie Cake Slice", 300, 3, 2.29],
  ],
};

const restaurantSeed: RestaurantTuple[] = [
  ["chipotle-green-hills", "Chipotle", "2126 Abbott Martin Rd, Nashville, TN 37215", 36.1058, -86.8165, 1.05, 5.2, "chipotle"],
  ["chipotle-midtown", "Chipotle", "112 21st Ave S, Nashville, TN 37203", 36.1497, -86.8011, 1.04, 2.2, "chipotle"],
  ["chickfila-west-end", "Chick-fil-A", "2109 West End Ave, Nashville, TN 37203", 36.1517, -86.8024, 1.1, 2.1, "chickfila"],
  ["chickfila-harding", "Chick-fil-A", "675 Harding Pl, Nashville, TN 37211", 36.0865, -86.7259, 1.08, 8.4, "chickfila"],
  ["mcdonalds-charlotte", "McDonald's", "5700 Charlotte Pike, Nashville, TN 37209", 36.151, -86.8655, 0.97, 6.1, "mcdonalds"],
  ["mcdonalds-nolensville", "McDonald's", "3736 Nolensville Pike, Nashville, TN 37211", 36.0985, -86.7323, 0.95, 7.4, "mcdonalds"],
  ["tacobell-thompson", "Taco Bell", "718 Thompson Ln, Nashville, TN 37204", 36.1128, -86.7601, 0.96, 4.7, "tacoBell"],
  ["tacobell-charlotte", "Taco Bell", "5814 Charlotte Pike, Nashville, TN 37209", 36.1516, -86.8718, 0.95, 6.8, "tacoBell"],
  ["panera-green-hills", "Panera Bread", "4014 Hillsboro Pike, Nashville, TN 37215", 36.1031, -86.8146, 1.02, 5.0, "panera"],
  ["panera-white-bridge", "Panera Bread", "73 White Bridge Rd, Nashville, TN 37205", 36.1402, -86.8512, 1.0, 5.8, "panera"],
  ["wendys-west-end", "Wendy's", "1813 West End Ave, Nashville, TN 37203", 36.1515, -86.7991, 0.97, 1.9, "wendys"],
  ["subway-demonbreun", "Subway", "1516 Demonbreun St, Nashville, TN 37203", 36.1539, -86.7926, 0.98, 1.7, "subway"],
  ["fiveguys-west-end", "Five Guys", "2029 West End Ave, Nashville, TN 37203", 36.1515, -86.8015, 1.03, 2.0, "fiveGuys"],
  ["shakeshack-green-hills", "Shake Shack", "2112 Abbott Martin Rd, Nashville, TN 37215", 36.1061, -86.8168, 1.06, 5.2, "shakeShack"],
  ["starbucks-12south", "Starbucks", "2501 12th Ave S, Nashville, TN 37204", 36.127, -86.79, 1.01, 2.9, "starbucks"],
  ["starbucks-midtown", "Starbucks", "1800 West End Ave, Nashville, TN 37203", 36.1523, -86.7976, 1.0, 1.8, "starbucks"],
  ["jerseymikes-madison", "Jersey Mike's", "2137 Gallatin Pike N, Madison, TN 37115", 36.2597, -86.714, 1.0, 9.8, "jerseyMikes"],
  ["cava-gulch", "CAVA", "600 12th Ave S, Nashville, TN 37203", 36.1512, -86.7887, 1.07, 1.4, "cava"],
  ["zaxbys-antioch", "Zaxby's", "4223 Century Farms Ter, Antioch, TN 37013", 36.0412, -86.6568, 0.96, 9.6, "zaxbys"],
  ["canes-belle-meade", "Raising Cane's", "6802 Charlotte Pike, Nashville, TN 37209", 36.1423, -86.8852, 1.01, 8.1, "canes"],
  ["popeyes-nolensville", "Popeyes", "4473 Nolensville Pike, Nashville, TN 37211", 36.0731, -86.7166, 0.94, 8.8, "popeyes"],
  ["whataburger-hermitage", "Whataburger", "5604 Old Hickory Blvd, Hermitage, TN 37076", 36.2045, -86.6208, 0.97, 9.9, "whataburger"],
  ["pandaexpress-whitebridge", "Panda Express", "6800 Charlotte Pike, Nashville, TN 37209", 36.1417, -86.8869, 0.99, 8.2, "pandaExpress"],
  ["blazepizza-hillsboro", "Blaze Pizza", "2313 21st Ave S, Nashville, TN 37212", 36.1257, -86.8016, 1.02, 3.3, "blazePizza"],
  ["dominos-belmont", "Domino's", "1707 21st Ave S, Nashville, TN 37212", 36.1368, -86.7996, 0.95, 2.8, "dominos"],
  ["papajohns-west-end", "Papa John's", "1907 Broadway, Nashville, TN 37203", 36.1511, -86.7962, 0.94, 1.7, "papaJohns"],
  ["qdoba-vanderbilt", "Qdoba", "2146 Belcourt Ave, Nashville, TN 37212", 36.1374, -86.8002, 1.0, 2.9, "qdoba"],
  ["sweetgreen-gulch", "Sweetgreen", "601 8th Ave S, Nashville, TN 37203", 36.1531, -86.7837, 1.05, 1.2, "sweetgreen"],
  ["crackerbarrel-harding", "Cracker Barrel", "4323 Sidco Dr, Nashville, TN 37204", 36.1036, -86.7638, 0.98, 5.3, "crackerBarrel"],
  ["bww-west-end", "Buffalo Wild Wings", "2325 West End Ave, Nashville, TN 37203", 36.1512, -86.8074, 0.99, 2.3, "bww"],
  ["burgerking-lafayette", "Burger King", "1800 Lafayette St, Nashville, TN 37203", 36.1694, -86.7836, 0.93, 2.6, "burgerKing"],
  ["kfc-charlotte", "KFC", "6601 Charlotte Pike, Nashville, TN 37209", 36.1433, -86.8827, 0.94, 7.9, "kfc"],
];

export const mockRestaurants: RestaurantRecord[] = restaurantSeed.map(
  ([id, name, address, latitude, longitude, ratingWeight, distanceMiles]) => ({
    id,
    name,
    address,
    city: "Nashville",
    state: "TN",
    latitude,
    longitude,
    isChain: true,
    ratingWeight,
    distanceMiles,
  }),
);

export const mockMenuItems: MenuItemRecord[] = restaurantSeed.flatMap(
  ([id, , , , , , , menuProfile]) => menuItemsForRestaurant(id, menuProfiles[menuProfile]),
);
