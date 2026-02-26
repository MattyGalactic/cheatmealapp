INSERT INTO restaurants (id, name, address, city, state, latitude, longitude, is_chain, rating_weight, distance_miles)
VALUES
  ('chipotle-green-hills', 'Chipotle', '2126 Abbott Martin Rd, Nashville, TN', 'Nashville', 'TN', 36.1058, -86.8165, TRUE, 1.05, 5.2),
  ('chickfila-west-end', 'Chick-fil-A', '2109 West End Ave, Nashville, TN', 'Nashville', 'TN', 36.1517, -86.8024, TRUE, 1.10, 2.1),
  ('tacobell-thompson', 'Taco Bell', '718 Thompson Ln, Nashville, TN', 'Nashville', 'TN', 36.1128, -86.7601, TRUE, 0.96, 4.7)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  is_chain = EXCLUDED.is_chain,
  rating_weight = EXCLUDED.rating_weight,
  distance_miles = EXCLUDED.distance_miles;

INSERT INTO menu_items (id, restaurant_id, name, calories, protein_grams, price_usd)
VALUES
  ('cfa-grilled-nuggets-12', 'chickfila-west-end', '12 ct Grilled Nuggets', 200, 38, 8.49),
  ('cfa-spicy-wrap', 'chickfila-west-end', 'Spicy Cool Wrap', 660, 43, 10.19),
  ('cfa-egg-white-grill', 'chickfila-west-end', 'Egg White Grill', 300, 27, 5.79),
  ('cfa-kale-crunch-side', 'chickfila-west-end', 'Kale Crunch Side', 170, 4, 3.19),
  ('cfa-grilled-filet', 'chickfila-west-end', 'Grilled Filet', 130, 25, 4.59),
  ('chipotle-salad-chicken', 'chipotle-green-hills', 'Chicken Salad Bowl', 420, 35, 10.95),
  ('chipotle-bowl-steak-light-rice', 'chipotle-green-hills', 'Steak Bowl (Light Rice)', 510, 32, 12.45),
  ('chipotle-bowl-double-chicken-fajita', 'chipotle-green-hills', 'Double Chicken Bowl (Fajita Veg)', 540, 58, 13.95),
  ('chipotle-kids-build-your-own', 'chipotle-green-hills', 'Kids Build Your Own (Chicken)', 360, 22, 6.95),
  ('chipotle-side-black-beans', 'chipotle-green-hills', 'Side of Black Beans', 130, 8, 2.25),
  ('tb-chicken-soft-taco', 'tacobell-thompson', 'Chicken Soft Taco', 170, 10, 2.49),
  ('tb-power-bowl-chicken', 'tacobell-thompson', 'Power Menu Bowl - Chicken', 470, 26, 7.99),
  ('tb-bean-burrito', 'tacobell-thompson', 'Bean Burrito', 360, 13, 2.89),
  ('tb-crunchy-taco', 'tacobell-thompson', 'Crunchy Taco', 170, 8, 1.99),
  ('tb-cheesy-roll-up', 'tacobell-thompson', 'Cheesy Roll Up', 180, 5, 1.49),
  ('tb-chicken-chipotle-melt', 'tacobell-thompson', 'Chipotle Ranch Grilled Chicken Burrito', 510, 21, 3.49)
ON CONFLICT (id) DO UPDATE SET
  restaurant_id = EXCLUDED.restaurant_id,
  name = EXCLUDED.name,
  calories = EXCLUDED.calories,
  protein_grams = EXCLUDED.protein_grams,
  price_usd = EXCLUDED.price_usd;
