import type { CategoryInfo, CategoryFamily } from './types';

export const CATEGORY_FAMILIES_DATA: Record<string, CategoryFamily> = {
  food_and_drink: {
    title: 'Food & Drink',
    icon: 'Utensils',
    description: 'Restaurants, cafes, bakeries, bars, and food services'
  },
  beauty_and_wellness: {
    title: 'Beauty & Wellness',
    icon: 'Sparkles',
    description: 'Hair, nails, spa, massage, and personal care services'
  },
  fitness_and_sports: {
    title: 'Fitness & Sports',
    icon: 'Dumbbell',
    description: 'Gyms, yoga studios, sports facilities, and martial arts'
  },
  pet_services: {
    title: 'Pet Services & Supplies',
    icon: 'Dog',
    description: 'Pet grooming, pet stores, veterinarians, and animal care'
  },
  entertainment: {
    title: 'Entertainment & Culture',
    icon: 'Film',
    description: 'Cinemas, theaters, bowling, arcades, and venues'
  },
  retail: {
    title: 'Retail & Shopping',
    icon: 'ShoppingBag',
    description: 'Supermarkets, clothing, electronics, and specialty stores'
  },
  services: {
    title: 'Professional & Personal Services',
    icon: 'Briefcase',
    description: 'Laundry, coworking, repair, dry cleaning, and printing'
  },
  healthcare: {
    title: 'Healthcare & Medical',
    icon: 'Stethoscope',
    description: 'Pharmacies, dental clinics, opticians, and medical centers'
  },
  education: {
    title: 'Education & Learning',
    icon: 'GraduationCap',
    description: 'Kindergartens, tutoring, language schools, and training'
  },
  automotive: {
    title: 'Automotive & Transport',
    icon: 'Car',
    description: 'Car wash, auto repair, parking, and rentals'
  },
  hospitality: {
    title: 'Hospitality & Lodging',
    icon: 'Hotel',
    description: 'Hotels, hostels, guest houses, and accommodation'
  }
};

export const MASTER_CATEGORIES_DATA: CategoryInfo[] = [
  // Food & Drink
  {
    id: 'bar_pub',
    title: 'Bar & Pub',
    family: 'food_and_drink',
    keywords: ['bar', 'pub', 'cocktail bar', 'lounge'],
    overture_keys: ['bar', 'pub', 'cocktail_bar', 'wine_bar'],
    hierarchy_matchers: ['bar', 'pub', 'cocktail_bar']
  },
  {
    id: 'cafe',
    title: 'Cafe',
    family: 'food_and_drink',
    keywords: ['cafe', 'coffee shop', 'espresso'],
    overture_keys: ['cafe', 'coffee_shop', 'tea_house'],
    hierarchy_matchers: ['cafe', 'coffee_shop']
  },
  {
    id: 'coffee_shop',
    title: 'Coffee Shop',
    family: 'food_and_drink',
    keywords: ['coffee shop', 'specialty coffee', 'roastery'],
    overture_keys: ['coffee_shop', 'espresso_bar'],
    hierarchy_matchers: ['coffee_shop']
  },
  {
    id: 'restaurant',
    title: 'Restaurant',
    family: 'food_and_drink',
    keywords: ['restaurant', 'dining', 'eatery'],
    overture_keys: ['restaurant', 'casual_eatery', 'dining_establishment'],
    hierarchy_matchers: ['restaurant', 'dining_establishment']
  },
  {
    id: 'fast_food',
    title: 'Fast Food',
    family: 'food_and_drink',
    keywords: ['fast food', 'burger', 'takeout'],
    overture_keys: ['fast_food_restaurant', 'quick_service_restaurant'],
    hierarchy_matchers: ['fast_food_restaurant']
  },
  {
    id: 'bakery',
    title: 'Bakery',
    family: 'food_and_drink',
    keywords: ['bakery', 'pastry', 'bread'],
    overture_keys: ['bakery', 'pastry_shop'],
    hierarchy_matchers: ['bakery', 'pastry_shop']
  },

  // Beauty & Wellness
  {
    id: 'hair_salon',
    title: 'Hair Salon',
    family: 'beauty_and_wellness',
    keywords: ['hair salon', 'hairdresser', 'hair stylist'],
    overture_keys: ['hair_salon', 'hairdresser', 'beauty_salon'],
    hierarchy_matchers: ['hair_salon', 'hairdresser']
  },
  {
    id: 'barber',
    title: 'Barbershop',
    family: 'beauty_and_wellness',
    keywords: ['barber', 'barbershop', 'men hair'],
    overture_keys: ['barber_shop', 'barber'],
    hierarchy_matchers: ['barber_shop', 'barber']
  },
  {
    id: 'nail_salon',
    title: 'Nail Salon',
    family: 'beauty_and_wellness',
    keywords: ['nail salon', 'manicure', 'pedicure'],
    overture_keys: ['nail_salon', 'manicure_and_pedicure'],
    hierarchy_matchers: ['nail_salon']
  },
  {
    id: 'spa_massage',
    title: 'Spa & Massage',
    family: 'beauty_and_wellness',
    keywords: ['spa', 'massage', 'wellness center'],
    overture_keys: ['day_spa', 'massage_spa', 'spa'],
    hierarchy_matchers: ['day_spa', 'massage_spa', 'spa']
  },

  // Fitness & Sports
  {
    id: 'gym',
    title: 'Gym & Fitness Center',
    family: 'fitness_and_sports',
    keywords: ['gym', 'fitness center', 'workout'],
    overture_keys: ['gym', 'fitness_center'],
    hierarchy_matchers: ['gym', 'fitness_center']
  },
  {
    id: 'yoga_pilates',
    title: 'Yoga & Pilates Studio',
    family: 'fitness_and_sports',
    keywords: ['yoga', 'pilates', 'yoga studio'],
    overture_keys: ['yoga_studio', 'pilates_studio'],
    hierarchy_matchers: ['yoga_studio', 'pilates_studio']
  },

  // Pet Services
  {
    id: 'pet_grooming',
    title: 'Pet Grooming',
    family: 'pet_services',
    keywords: ['pet grooming', 'dog grooming', 'cat grooming'],
    overture_keys: ['pet_grooming_service', 'pet_grooming', 'pet_services'],
    hierarchy_matchers: ['pet_grooming', 'pet_grooming_service']
  },
  {
    id: 'pet_store',
    title: 'Pet Store',
    family: 'pet_services',
    keywords: ['pet store', 'pet shop', 'pet supplies'],
    overture_keys: ['pet_store', 'pet_supply_store'],
    hierarchy_matchers: ['pet_store']
  },
  {
    id: 'veterinarian',
    title: 'Veterinarian',
    family: 'pet_services',
    keywords: ['vet', 'veterinarian', 'animal hospital'],
    overture_keys: ['veterinarian', 'veterinary_care'],
    hierarchy_matchers: ['veterinarian']
  },

  // Entertainment
  {
    id: 'cinema',
    title: 'Cinema & Movie Theater',
    family: 'entertainment',
    keywords: ['cinema', 'movie theater', 'pictures'],
    overture_keys: ['movie_theater', 'cinema'],
    hierarchy_matchers: ['movie_theater', 'cinema']
  },
  {
    id: 'bowling',
    title: 'Bowling Alley',
    family: 'entertainment',
    keywords: ['bowling', 'bowling alley'],
    overture_keys: ['bowling_alley'],
    hierarchy_matchers: ['bowling_alley']
  },
  {
    id: 'arcade_gaming',
    title: 'Arcade & Escape Room',
    family: 'entertainment',
    keywords: ['arcade', 'escape room', 'gaming'],
    overture_keys: ['amusement_center', 'escape_room', 'video_arcade'],
    hierarchy_matchers: ['escape_room', 'video_arcade']
  },

  // Services
  {
    id: 'laundry',
    title: 'Self-Service Laundry & Laundromat',
    family: 'services',
    keywords: ['laundry', 'laundromat', 'self-service laundry'],
    overture_keys: ['laundry_service', 'laundromat'],
    hierarchy_matchers: ['laundromat', 'laundry_service']
  },
  {
    id: 'dry_cleaning',
    title: 'Dry Cleaning',
    family: 'services',
    keywords: ['dry cleaning', 'dry cleaner'],
    overture_keys: ['dry_cleaning_service', 'dry_cleaners'],
    hierarchy_matchers: ['dry_cleaners']
  },
  {
    id: 'coworking',
    title: 'Coworking Space',
    family: 'services',
    keywords: ['coworking', 'shared office', 'flex workspace'],
    overture_keys: ['coworking_space', 'shared_office_space'],
    hierarchy_matchers: ['coworking_space']
  },

  // Healthcare
  {
    id: 'pharmacy',
    title: 'Pharmacy & Chemist',
    family: 'healthcare',
    keywords: ['pharmacy', 'chemist', 'drugstore'],
    overture_keys: ['pharmacy', 'drugstore'],
    hierarchy_matchers: ['pharmacy']
  },
  {
    id: 'dentist',
    title: 'Dental Clinic',
    family: 'healthcare',
    keywords: ['dentist', 'dental clinic'],
    overture_keys: ['dentist', 'dental_clinic'],
    hierarchy_matchers: ['dentist']
  },

  // Hospitality
  {
    id: 'hotel',
    title: 'Hotel & Resort',
    family: 'hospitality',
    keywords: ['hotel', 'resort', 'lodging'],
    overture_keys: ['hotel', 'resort'],
    hierarchy_matchers: ['hotel']
  },
  {
    id: 'hostel',
    title: 'Hostel',
    family: 'hospitality',
    keywords: ['hostel', 'youth hostel'],
    overture_keys: ['hostel'],
    hierarchy_matchers: ['hostel']
  },

  // Retail
  {
    id: 'supermarket',
    title: 'Supermarket & Grocery',
    family: 'retail',
    keywords: ['supermarket', 'grocery store'],
    overture_keys: ['supermarket', 'grocery_store'],
    hierarchy_matchers: ['supermarket']
  },
  {
    id: 'clothing_store',
    title: 'Clothing & Fashion Store',
    family: 'retail',
    keywords: ['clothing store', 'boutique', 'fashion'],
    overture_keys: ['clothing_store', 'boutique'],
    hierarchy_matchers: ['clothing_store']
  }
];
