"""Rebuild the demo catalog with: python server/generate_seed.py"""
import json
from pathlib import Path

root = Path(__file__).parent
venues = [
    dict(id="forno", name="FORNO", tagline="A little Naples, wherever you are.", description="Slow-fermented dough. A fiercely hot oven. Ingredients that speak for themselves.", location="Napoli · Italy", hours="12:00 — 23:00", currency="EUR", template="pizzeria", heroImage="/images/pizza-margherita.webp", published=True),
    dict(id="narenj", name="NARENJ", tagline="Tradition, served with warmth.", description="Persian classics, generous tables and the aroma of saffron.", location="Tehran · Iran", hours="11:30 — 23:00", currency="EUR", template="traditional", heroImage="/images/traditional-kebab.webp", published=True),
    dict(id="stack", name="STACK", tagline="Big flavour. No waiting around.", description="Smash burgers, golden fries and the good kind of messy.", location="London · UK", hours="11:00 — 01:00", currency="EUR", template="fastfood", heroImage="/images/fastfood-burger.webp", published=True),
    dict(id="morrow", name="MORROW", tagline="Your everyday ritual, elevated.", description="Thoughtful coffee, slow mornings and something good from the oven.", location="Copenhagen · Denmark", hours="08:00 — 19:00", currency="EUR", template="cafe", heroImage="/images/cafe-cappuccino.webp", published=True),
    dict(id="scoop", name="SCOOP", tagline="A little joy in every scoop.", description="Small-batch gelato, fresh fruit and the brightest part of your day.", location="Milan · Italy", hours="10:00 — 22:00", currency="EUR", template="gelato", heroImage="/images/gelato-cone.webp", published=True),
]

items = []
def add(venue, category, name, subtitle, description, ingredients, allergens, tags, price, image, featured=False, available=True, variants=None):
    slug = name.lower().replace(" ", "-").replace("'", "")
    items.append(dict(id="00000000-0000-0000-0000-000000000000", venueId=venue, slug=slug, category=category,
        name=name, subtitle=subtitle, description=description, image=f"/images/{image}.webp", ingredients=ingredients,
        allergens=allergens, tags=tags, variants=variants or [dict(label="Regular", price=price)],
        featured=featured, available=available, sortOrder=len([i for i in items if i["venueId"] == venue])))

# Prices are illustrative EUR demo values. Allergens are recipe-level examples, not certified kitchen advice.
add("forno", "Classics", "Margherita", "The original, beautifully simple", "San Marzano tomato, fior di latte, fresh basil and extra virgin olive oil on 48-hour fermented dough.", ["San Marzano tomato", "Fior di latte", "Basil", "Olive oil", "Tipo 00 dough"], ["Wheat", "Milk"], ["Vegetarian", "Signature"], 14, "pizza-margherita", True, variants=[dict(label="12 inch", price=14),dict(label="16 inch", price=20)])
add("forno", "Classics", "Marinara", "Naples in its purest form", "A tomato-forward classic with sliced garlic, oregano and fragrant extra virgin olive oil.", ["San Marzano tomato", "Garlic", "Oregano", "Olive oil", "Tipo 00 dough"], ["Wheat"], ["Vegan"], 12, "pizza-marinara")
add("forno", "Classics", "Napoli", "Bold, salty, unmistakably Italian", "Tomato, fior di latte, anchovies, capers and oregano.", ["Tomato", "Fior di latte", "Anchovies", "Capers", "Oregano"], ["Wheat", "Milk", "Fish"], [], 17, "pizza-napoli")
add("forno", "Signatures", "Diavola", "A slow-burning favourite", "Spicy salami, Calabrian chilli, fior di latte and a delicate brush of hot honey.", ["Spicy salami", "Calabrian chilli", "Fior di latte", "Tomato", "Hot honey"], ["Wheat", "Milk"], ["Spicy", "Popular"], 19, "pizza-diavola", True, variants=[dict(label="12 inch", price=19),dict(label="16 inch", price=26)])
add("forno", "Signatures", "Quattro Formaggi", "Four cheeses, one perfect balance", "Fior di latte, gorgonzola, ricotta and Parmigiano Reggiano over a white base.", ["Fior di latte", "Gorgonzola", "Ricotta", "Parmigiano Reggiano", "Thyme"], ["Wheat", "Milk"], ["Vegetarian"], 20, "pizza-formaggi", True)
add("forno", "Signatures", "Prosciutto e Rucola", "Fresh finish, rich heart", "Prosciutto crudo, peppery rocket, cherry tomatoes and shaved parmesan added after baking.", ["Prosciutto crudo", "Rocket", "Cherry tomato", "Parmesan", "Fior di latte"], ["Wheat", "Milk"], [], 22, "pizza-prosciutto")
add("forno", "Signatures", "Capricciosa", "A little bit of everything", "Artichokes, cooked ham, mushrooms, olives and fior di latte on tomato.", ["Artichokes", "Ham", "Mushrooms", "Olives", "Fior di latte"], ["Wheat", "Milk"], [], 21, "pizza-capricciosa")
add("forno", "Seasonal", "Funghi e Tartufo", "Earthy and aromatic", "Roasted mushrooms, truffle cream, fior di latte and thyme.", ["Wild mushrooms", "Truffle cream", "Fior di latte", "Thyme"], ["Wheat", "Milk"], ["Vegetarian"], 23, "pizza-funghi")
add("forno", "Seasonal", "Pistacchio Mortadella", "A modern Italian favourite", "Mortadella, pistachio pesto, creamy burrata and lemon zest.", ["Mortadella", "Pistachio", "Burrata", "Lemon"], ["Wheat", "Milk", "Tree nuts"], ["Signature"], 24, "pizza-mortadella")
add("forno", "Seasonal", "Ortolana", "The garden, from the oven", "Grilled aubergine, courgette, peppers, tomato and fior di latte.", ["Aubergine", "Courgette", "Peppers", "Tomato", "Fior di latte"], ["Wheat", "Milk"], ["Vegetarian"], 18, "pizza-ortolana")
add("forno", "Seasonal", "Salsiccia e Friarielli", "A Neapolitan pairing", "Italian sausage, friarielli greens, smoked provola and a hint of chilli.", ["Italian sausage", "Friarielli", "Smoked provola", "Chilli"], ["Wheat", "Milk"], ["Spicy"], 22, "pizza-salsiccia")
add("forno", "Seasonal", "Bufalina", "Soft, bright and generous", "Buffalo mozzarella, San Marzano tomato, basil and extra virgin olive oil.", ["Buffalo mozzarella", "San Marzano tomato", "Basil", "Olive oil"], ["Wheat", "Milk"], ["Vegetarian"], 20, "pizza-bufalina")

add("narenj", "From the grill", "Koobideh", "Charcoal grilled comfort", "Two juicy skewers with saffron rice, sumac and grilled tomato.", ["Minced beef", "Saffron rice", "Tomato", "Sumac"], [], ["Signature"], 18, "traditional-kebab", True)
add("narenj", "From the grill", "Joojeh Kebab", "Saffron and lemon", "Tender chicken marinated with saffron and lemon, served with rice.", ["Chicken", "Saffron", "Lemon", "Rice"], [], [], 19, "traditional-joojeh")
add("narenj", "Persian table", "Zereshk Polo", "Sweet, tart and fragrant", "Saffron rice with barberries and slow-cooked chicken.", ["Chicken", "Barberries", "Saffron rice"], [], [], 17, "traditional-zereshk")
add("stack", "Burgers", "Double Stack", "The house favourite", "Two smashed patties, cheddar, pickles and signature sauce.", ["Beef", "Cheddar", "Pickles", "Brioche"], ["Wheat", "Milk", "Egg"], ["Popular"], 14, "fastfood-burger", True)
add("stack", "Burgers", "Hot Stack", "Bring the heat", "Double beef, pepper jack, jalapeños and chilli mayo.", ["Beef", "Pepper jack", "Jalapeños", "Brioche"], ["Wheat", "Milk", "Egg"], ["Spicy"], 15, "fastfood-hot-stack")
add("stack", "Sides", "Golden Fries", "Crisp to the last bite", "Hand-cut potatoes with sea salt and house dip.", ["Potatoes", "Sea salt"], [], ["Vegetarian"], 6, "fastfood-fries")
add("morrow", "Coffee", "Cappuccino", "A slow morning in a cup", "Double espresso with silky steamed milk and a soft cap of foam.", ["Espresso", "Milk"], ["Milk"], ["Signature"], 5, "cafe-cappuccino", True)
add("morrow", "Coffee", "Flat White", "Small, strong, smooth", "Double espresso and velvety microfoam.", ["Espresso", "Milk"], ["Milk"], [], 5.5, "cafe-flat-white")
add("morrow", "Bakery", "Butter Croissant", "Baked this morning", "Flaky all-butter pastry with a golden finish.", ["Butter", "Wheat flour"], ["Wheat", "Milk"], ["Vegetarian"], 4, "cafe-croissant")
add("scoop", "Gelato", "Pistachio Dream", "Small batch, big flavour", "Creamy Sicilian pistachio gelato in a crisp waffle cone.", ["Pistachio", "Milk", "Waffle cone"], ["Milk", "Tree nuts", "Wheat"], ["Popular"], 6, "gelato-pistachio", True, variants=[dict(label="One scoop",price=6),dict(label="Two scoops",price=9)])
add("scoop", "Gelato", "Strawberry Fields", "Real fruit, pure joy", "Bright strawberry gelato with ripe fruit in every bite.", ["Strawberry", "Milk", "Waffle cone"], ["Milk", "Wheat"], ["Vegetarian"], 6, "gelato-strawberry")
add("scoop", "Fresh blends", "Mango Glow", "Sunshine in a glass", "Fresh mango blended with orange and a little lime.", ["Mango", "Orange", "Lime"], [], ["Vegan"], 7, "gelato-mango")

(root / "seed.json").write_text(json.dumps(dict(venues=venues, items=items), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Wrote {len(venues)} venues and {len(items)} items")
