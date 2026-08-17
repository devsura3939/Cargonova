"""
Taxonomy Manager for Global Business Gap Finder.
Maps Overture Maps business taxonomy into human-friendly categories,
category families, descendant matching lists, and search terms.
"""

from typing import Dict, List, Optional, Set

# Master category family mapping
CATEGORY_FAMILIES = {
    "food_and_drink": {
        "title": "Food & Drink",
        "icon": "Utensils",
        "description": "Restaurants, cafes, bakeries, bars, and food services"
    },
    "beauty_and_wellness": {
        "title": "Beauty & Wellness",
        "icon": "Sparkles",
        "description": "Hair, nails, spa, massage, and personal care services"
    },
    "fitness_and_sports": {
        "title": "Fitness & Sports",
        "icon": "Dumbbell",
        "description": "Gyms, yoga studios, sports facilities, and martial arts"
    },
    "pet_services": {
        "title": "Pet Services & Supplies",
        "icon": "Dog",
        "description": "Pet grooming, pet stores, veterinarians, and animal care"
    },
    "entertainment": {
        "title": "Entertainment & Culture",
        "icon": "Film",
        "description": "Cinemas, theaters, bowling, arcades, and venues"
    },
    "retail": {
        "title": "Retail & Shopping",
        "icon": "ShoppingBag",
        "description": "Supermarkets, clothing, electronics, and specialty stores"
    },
    "services": {
        "title": "Professional & Personal Services",
        "icon": "Briefcase",
        "description": "Laundry, coworking, repair, dry cleaning, and printing"
    },
    "healthcare": {
        "title": "Healthcare & Medical",
        "icon": "Stethoscope",
        "description": "Pharmacies, dental clinics, opticians, and medical centers"
    },
    "education": {
        "title": "Education & Learning",
        "icon": "GraduationCap",
        "description": "Kindergartens, tutoring, language schools, and training"
    },
    "automotive": {
        "title": "Automotive & Transport",
        "icon": "Car",
        "description": "Car wash, auto repair, parking, and rentals"
    },
    "hospitality": {
        "title": "Hospitality & Lodging",
        "icon": "Hotel",
        "description": "Hotels, hostels, guest houses, and accommodation"
    }
}

# Detailed Taxonomy Mapping
# Key: normalized category key
# Value: dict with label, family, overture_keys (list of possible taxonomy.primary, categories.primary, or hierarchy matchers)
TAXONOMY_MAP: Dict[str, dict] = {
    # Pets
    "pet_grooming": {
        "id": "pet_grooming",
        "title": "Pet Grooming",
        "family": "pet_services",
        "keywords": ["pet grooming", "dog grooming", "cat grooming", "pet wash"],
        "overture_keys": ["pet_grooming_service", "pet_grooming", "pet_services", "animal_or_pet_service"],
        "hierarchy_matchers": ["pet_grooming", "pet_grooming_service", "dog_groomer"]
    },
    "pet_store": {
        "id": "pet_store",
        "title": "Pet Store",
        "family": "pet_services",
        "keywords": ["pet store", "pet shop", "pet supplies"],
        "overture_keys": ["pet_store", "pet_supply_store", "animal_and_pet_store"],
        "hierarchy_matchers": ["pet_store", "pet_supply_store"]
    },
    "veterinarian": {
        "id": "veterinarian",
        "title": "Veterinarian",
        "family": "pet_services",
        "keywords": ["vet", "veterinarian", "animal hospital", "pet clinic"],
        "overture_keys": ["veterinarian", "veterinary_care", "animal_hospital"],
        "hierarchy_matchers": ["veterinarian", "veterinary_care"]
    },

    # Food & Drink
    "restaurant": {
        "id": "restaurant",
        "title": "Restaurant",
        "family": "food_and_drink",
        "keywords": ["restaurant", "dining", "eatery"],
        "overture_keys": ["restaurant", "casual_eatery", "dining_establishment"],
        "hierarchy_matchers": ["restaurant", "dining_establishment"]
    },
    "cafe": {
        "id": "cafe",
        "title": "Cafe",
        "family": "food_and_drink",
        "keywords": ["cafe", "coffee shop", "espresso"],
        "overture_keys": ["cafe", "coffee_shop", "tea_house"],
        "hierarchy_matchers": ["cafe", "coffee_shop"]
    },
    "coffee_shop": {
        "id": "coffee_shop",
        "title": "Coffee Shop",
        "family": "food_and_drink",
        "keywords": ["coffee shop", "specialty coffee", "roastery"],
        "overture_keys": ["coffee_shop", "espresso_bar"],
        "hierarchy_matchers": ["coffee_shop"]
    },
    "bakery": {
        "id": "bakery",
        "title": "Bakery",
        "family": "food_and_drink",
        "keywords": ["bakery", "bakeshop", "pastry", "bread"],
        "overture_keys": ["bakery", "pastry_shop"],
        "hierarchy_matchers": ["bakery", "pastry_shop"]
    },
    "bar_pub": {
        "id": "bar_pub",
        "title": "Bar & Pub",
        "family": "food_and_drink",
        "keywords": ["bar", "pub", "cocktail bar", "lounge"],
        "overture_keys": ["bar", "pub", "cocktail_bar", "wine_bar"],
        "hierarchy_matchers": ["bar", "pub", "cocktail_bar"]
    },
    "fast_food": {
        "id": "fast_food",
        "title": "Fast Food",
        "family": "food_and_drink",
        "keywords": ["fast food", "burger", "takeout", "quick service"],
        "overture_keys": ["fast_food_restaurant", "quick_service_restaurant"],
        "hierarchy_matchers": ["fast_food_restaurant"]
    },

    # Beauty & Wellness
    "hair_salon": {
        "id": "hair_salon",
        "title": "Hair Salon",
        "family": "beauty_and_wellness",
        "keywords": ["hair salon", "hairdresser", "hair stylist"],
        "overture_keys": ["hair_salon", "hairdresser", "beauty_salon"],
        "hierarchy_matchers": ["hair_salon", "hairdresser"]
    },
    "barber": {
        "id": "barber",
        "title": "Barbershop",
        "family": "beauty_and_wellness",
        "keywords": ["barber", "barbershop", "men hair"],
        "overture_keys": ["barber_shop", "barber"],
        "hierarchy_matchers": ["barber_shop", "barber"]
    },
    "nail_salon": {
        "id": "nail_salon",
        "title": "Nail Salon",
        "family": "beauty_and_wellness",
        "keywords": ["nail salon", "manicure", "pedicure"],
        "overture_keys": ["nail_salon", "manicure_and_pedicure"],
        "hierarchy_matchers": ["nail_salon"]
    },
    "spa_massage": {
        "id": "spa_massage",
        "title": "Spa & Massage",
        "family": "beauty_and_wellness",
        "keywords": ["spa", "massage", "wellness center", "day spa"],
        "overture_keys": ["day_spa", "massage_spa", "spa", "massage_clinic"],
        "hierarchy_matchers": ["day_spa", "massage_spa", "spa"]
    },

    # Fitness
    "gym": {
        "id": "gym",
        "title": "Gym & Fitness Center",
        "family": "fitness_and_sports",
        "keywords": ["gym", "fitness center", "workout", "health club"],
        "overture_keys": ["gym", "fitness_center", "gymnastics_center", "sports_club"],
        "hierarchy_matchers": ["gym", "fitness_center"]
    },
    "yoga_pilates": {
        "id": "yoga_pilates",
        "title": "Yoga & Pilates Studio",
        "family": "fitness_and_sports",
        "keywords": ["yoga", "pilates", "yoga studio"],
        "overture_keys": ["yoga_studio", "pilates_studio"],
        "hierarchy_matchers": ["yoga_studio", "pilates_studio"]
    },
    "swimming_pool": {
        "id": "swimming_pool",
        "title": "Swimming Pool & Aquatic Center",
        "family": "fitness_and_sports",
        "keywords": ["swimming pool", "aquatic center", "public pool"],
        "overture_keys": ["swimming_pool", "public_swimming_pool"],
        "hierarchy_matchers": ["swimming_pool"]
    },

    # Entertainment
    "cinema": {
        "id": "cinema",
        "title": "Cinema & Movie Theater",
        "family": "entertainment",
        "keywords": ["cinema", "movie theater", "pictures"],
        "overture_keys": ["movie_theater", "cinema", "drive_in_movie_theater"],
        "hierarchy_matchers": ["movie_theater", "cinema"]
    },
    "bowling": {
        "id": "bowling",
        "title": "Bowling Alley",
        "family": "entertainment",
        "keywords": ["bowling", "bowling alley", "tenpin"],
        "overture_keys": ["bowling_alley"],
        "hierarchy_matchers": ["bowling_alley"]
    },
    "arcade_gaming": {
        "id": "arcade_gaming",
        "title": "Arcade & Escape Room",
        "family": "entertainment",
        "keywords": ["arcade", "escape room", "gaming center", "vr gaming"],
        "overture_keys": ["amusement_center", "escape_room", "video_arcade"],
        "hierarchy_matchers": ["amusement_center", "escape_room", "video_arcade"]
    },
    "museum_gallery": {
        "id": "museum_gallery",
        "title": "Museum & Art Gallery",
        "family": "entertainment",
        "keywords": ["museum", "art gallery", "exhibition"],
        "overture_keys": ["museum", "art_gallery"],
        "hierarchy_matchers": ["museum", "art_gallery"]
    },

    # Services
    "laundry": {
        "id": "laundry",
        "title": "Self-Service Laundry & Laundromat",
        "family": "services",
        "keywords": ["laundry", "laundromat", "self-service laundry", "coin laundry"],
        "overture_keys": ["laundry_service", "laundromat", "dry_cleaners"],
        "hierarchy_matchers": ["laundromat", "laundry_service"]
    },
    "dry_cleaning": {
        "id": "dry_cleaning",
        "title": "Dry Cleaning",
        "family": "services",
        "keywords": ["dry cleaning", "dry cleaner", "clothes cleaning"],
        "overture_keys": ["dry_cleaning_service", "dry_cleaners"],
        "hierarchy_matchers": ["dry_cleaners", "dry_cleaning_service"]
    },
    "coworking": {
        "id": "coworking",
        "title": "Coworking Space",
        "family": "services",
        "keywords": ["coworking", "shared office", "flex workspace"],
        "overture_keys": ["coworking_space", "shared_office_space"],
        "hierarchy_matchers": ["coworking_space"]
    },

    # Healthcare
    "pharmacy": {
        "id": "pharmacy",
        "title": "Pharmacy & Chemist",
        "family": "healthcare",
        "keywords": ["pharmacy", "chemist", "drugstore"],
        "overture_keys": ["pharmacy", "drugstore"],
        "hierarchy_matchers": ["pharmacy", "drugstore"]
    },
    "dentist": {
        "id": "dentist",
        "title": "Dental Clinic",
        "family": "healthcare",
        "keywords": ["dentist", "dental clinic", "teeth"],
        "overture_keys": ["dentist", "dental_clinic"],
        "hierarchy_matchers": ["dentist", "dental_clinic"]
    },
    "optician": {
        "id": "optician",
        "title": "Optician & Eyewear",
        "family": "healthcare",
        "keywords": ["optician", "eyewear", "optometrist", "glasses"],
        "overture_keys": ["optician", "optometrist", "eyewear_store"],
        "hierarchy_matchers": ["optician", "optometrist"]
    },

    # Education
    "kindergarten": {
        "id": "kindergarten",
        "title": "Kindergarten & Daycare",
        "family": "education",
        "keywords": ["kindergarten", "daycare", "preschool", "nursery"],
        "overture_keys": ["child_care_service", "preschool", "kindergarten"],
        "hierarchy_matchers": ["child_care_service", "preschool", "kindergarten"]
    },
    "language_school": {
        "id": "language_school",
        "title": "Language School & Tutoring",
        "family": "education",
        "keywords": ["language school", "english school", "tutoring center"],
        "overture_keys": ["language_school", "tutoring_service", "test_preparation_center"],
        "hierarchy_matchers": ["language_school", "tutoring_service"]
    },

    # Automotive
    "car_wash": {
        "id": "car_wash",
        "title": "Car Wash & Detailing",
        "family": "automotive",
        "keywords": ["car wash", "auto detailing", "car care"],
        "overture_keys": ["car_wash", "auto_detailing_service"],
        "hierarchy_matchers": ["car_wash", "auto_detailing_service"]
    },
    "car_repair": {
        "id": "car_repair",
        "title": "Auto Repair & Mechanic",
        "family": "automotive",
        "keywords": ["car repair", "mechanic", "auto service", "garage"],
        "overture_keys": ["automotive_repair", "auto_repair_shop"],
        "hierarchy_matchers": ["automotive_repair", "auto_repair_shop"]
    },

    # Hospitality
    "hotel": {
        "id": "hotel",
        "title": "Hotel & Resort",
        "family": "hospitality",
        "keywords": ["hotel", "resort", "lodging"],
        "overture_keys": ["hotel", "resort"],
        "hierarchy_matchers": ["hotel", "resort"]
    },
    "hostel": {
        "id": "hostel",
        "title": "Hostel",
        "family": "hospitality",
        "keywords": ["hostel", "youth hostel", "backpackers"],
        "overture_keys": ["hostel"],
        "hierarchy_matchers": ["hostel"]
    },

    # Retail
    "supermarket": {
        "id": "supermarket",
        "title": "Supermarket & Grocery",
        "family": "retail",
        "keywords": ["supermarket", "grocery store", "food market"],
        "overture_keys": ["supermarket", "grocery_store"],
        "hierarchy_matchers": ["supermarket", "grocery_store"]
    },
    "clothing_store": {
        "id": "clothing_store",
        "title": "Clothing & Fashion Store",
        "family": "retail",
        "keywords": ["clothing store", "boutique", "fashion", "apparel"],
        "overture_keys": ["clothing_store", "boutique"],
        "hierarchy_matchers": ["clothing_store", "boutique"]
    },
    "electronics_store": {
        "id": "electronics_store",
        "title": "Electronics & Appliance Store",
        "family": "retail",
        "keywords": ["electronics", "gadgets", "appliances", "tech store"],
        "overture_keys": ["electronics_store", "appliance_store"],
        "hierarchy_matchers": ["electronics_store"]
    }
}


def normalize_category_key(raw: str) -> str:
    """Clean raw category string into snake_case format."""
    s = raw.lower().strip()
    s = s.replace("-", "_").replace(" ", "_").replace("&", "and")
    return s


def get_category_info(category_id_or_raw: str) -> dict:
    """Find category entry or build dynamic representation for unlisted category."""
    key = normalize_category_key(category_id_or_raw)
    
    # Check exact match in TAXONOMY_MAP
    if key in TAXONOMY_MAP:
        return TAXONOMY_MAP[key]
    
    # Check partial key match
    for map_key, item in TAXONOMY_MAP.items():
        if map_key in key or key in map_key or any(k in key for k in item["keywords"]):
            return item
            
    # Dynamic title generation for unmapped categories
    words = key.replace("_", " ").title().split()
    clean_title = " ".join(words)
    return {
        "id": key,
        "title": clean_title,
        "family": "services",
        "keywords": [clean_title.lower()],
        "overture_keys": [key],
        "hierarchy_matchers": [key]
    }


def search_categories(query: str) -> List[dict]:
    """Search taxonomy categories by query string."""
    q = query.lower().strip()
    if not q:
        return list(TAXONOMY_MAP.values())
        
    results = []
    for item in TAXONOMY_MAP.values():
        if (q in item["id"].lower() or 
            q in item["title"].lower() or 
            any(q in k for k in item["keywords"])):
            results.append(item)
    return results
