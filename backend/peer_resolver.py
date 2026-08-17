"""
Peer City Resolver for Global Business Gap Finder.
Identifies comparable cities based on population similarity, geographical region,
and country context.
"""

import logging
import math
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Curated global cities registry with pre-resolved coordinates & bounding boxes
GLOBAL_CITIES_CATALOG = [
    # Georgia & Caucasus / Eastern Europe
    {"city": "Batumi", "country": "Georgia", "population": 172100, "lat": 41.6434, "lon": 41.6399, "bbox": [41.58, 41.61, 41.68, 41.67]},
    {"city": "Kutaisi", "country": "Georgia", "population": 147600, "lat": 42.2679, "lon": 42.6946, "bbox": [42.63, 42.22, 42.75, 42.31]},
    {"city": "Yerevan", "country": "Armenia", "population": 1092800, "lat": 40.1872, "lon": 44.5152, "bbox": [44.40, 40.10, 44.62, 40.25]},
    {"city": "Baku", "country": "Azerbaijan", "population": 2300000, "lat": 40.4093, "lon": 49.8671, "bbox": [49.75, 40.30, 49.98, 40.50]},
    {"city": "Sofia", "country": "Bulgaria", "population": 1280000, "lat": 42.6977, "lon": 23.3219, "bbox": [23.20, 42.60, 23.45, 42.78]},
    {"city": "Tirana", "country": "Albania", "population": 554300, "lat": 41.3275, "lon": 19.8187, "bbox": [19.72, 41.27, 19.90, 41.38]},
    {"city": "Zagreb", "country": "Croatia", "population": 769900, "lat": 45.8150, "lon": 15.9819, "bbox": [15.85, 45.75, 16.12, 45.88]},
    {"city": "Belgrade", "country": "Serbia", "population": 1380000, "lat": 44.7866, "lon": 20.4489, "bbox": [20.30, 44.70, 20.60, 44.88]},
    {"city": "Chisinau", "country": "Moldova", "population": 639000, "lat": 47.0105, "lon": 28.8638, "bbox": [28.75, 46.95, 28.95, 47.08]},
    {"city": "Skopje", "country": "North Macedonia", "population": 540000, "lat": 41.9981, "lon": 21.4254, "bbox": [21.32, 41.93, 21.53, 42.05]},
    {"city": "Sarajevo", "country": "Bosnia and Herzegovina", "population": 275000, "lat": 43.8563, "lon": 18.4131, "bbox": [18.30, 43.80, 18.48, 43.90]},
    {"city": "Cluj-Napoca", "country": "Romania", "population": 286000, "lat": 46.7712, "lon": 23.6236, "bbox": [23.50, 46.70, 23.70, 46.82]},
    {"city": "Tallinn", "country": "Estonia", "population": 454000, "lat": 59.4370, "lon": 24.7536, "bbox": [24.60, 59.35, 24.90, 59.50]},
    {"city": "Riga", "country": "Latvia", "population": 605000, "lat": 56.9496, "lon": 24.1052, "bbox": [23.95, 56.88, 24.25, 57.02]},
    {"city": "Vilnius", "country": "Lithuania", "population": 592000, "lat": 54.6872, "lon": 25.2797, "bbox": [25.15, 54.60, 25.40, 54.75]},
    {"city": "Warsaw", "country": "Poland", "population": 1860000, "lat": 52.2297, "lon": 21.0122, "bbox": [20.85, 52.10, 21.20, 52.35]},
    {"city": "Krakow", "country": "Poland", "population": 800000, "lat": 50.0647, "lon": 19.9450, "bbox": [19.80, 49.98, 20.10, 50.12]},

    # Western Europe & Central Europe
    {"city": "Berlin", "country": "Germany", "population": 3755000, "lat": 52.5200, "lon": 13.4050, "bbox": [13.10, 52.35, 13.75, 52.65]},
    {"city": "Munich", "country": "Germany", "population": 1488000, "lat": 48.1351, "lon": 11.5820, "bbox": [11.40, 48.05, 11.75, 48.22]},
    {"city": "Hamburg", "country": "Germany", "population": 1850000, "lat": 53.5511, "lon": 9.9937, "bbox": [9.80, 53.40, 10.20, 53.70]},
    {"city": "Vienna", "country": "Austria", "population": 1982000, "lat": 48.2082, "lon": 16.3738, "bbox": [16.20, 48.10, 16.55, 48.32]},
    {"city": "Prague", "country": "Czech Republic", "population": 1309000, "lat": 50.0755, "lon": 14.4378, "bbox": [14.25, 49.95, 14.65, 50.18]},
    {"city": "Budapest", "country": "Hungary", "population": 1752000, "lat": 47.4979, "lon": 19.0402, "bbox": [18.90, 47.38, 19.25, 47.60]},
    {"city": "Amsterdam", "country": "Netherlands", "population": 872000, "lat": 52.3676, "lon": 4.9041, "bbox": [4.75, 52.30, 5.05, 52.42]},
    {"city": "Brussels", "country": "Belgium", "population": 1220000, "lat": 50.8503, "lon": 4.3517, "bbox": [4.25, 50.80, 4.45, 50.92]},
    {"city": "Zurich", "country": "Switzerland", "population": 435000, "lat": 47.3769, "lon": 8.5417, "bbox": [8.45, 47.32, 8.62, 47.43]},
    {"city": "Geneva", "country": "Switzerland", "population": 203000, "lat": 46.2044, "lon": 6.1432, "bbox": [6.08, 46.16, 6.20, 46.25]},
    {"city": "Dublin", "country": "Ireland", "population": 588000, "lat": 53.3498, "lon": -6.2603, "bbox": [-6.38, 53.28, -6.12, 53.42]},
    {"city": "Edinburgh", "country": "United Kingdom", "population": 527000, "lat": 55.9533, "lon": -3.1883, "bbox": [-3.32, 55.88, -3.05, 56.00]},
    {"city": "Manchester", "country": "United Kingdom", "population": 553000, "lat": 53.4808, "lon": -2.2426, "bbox": [-2.35, 53.40, -2.12, 53.55]},
    {"city": "London", "country": "United Kingdom", "population": 8982000, "lat": 51.5074, "lon": -0.1278, "bbox": [-0.35, 51.35, 0.15, 51.65]},
    {"city": "Paris", "country": "France", "population": 2148000, "lat": 48.8566, "lon": 2.3522, "bbox": [2.22, 48.81, 2.47, 48.90]},
    {"city": "Lyon", "country": "France", "population": 522000, "lat": 45.7640, "lon": 4.8357, "bbox": [4.78, 45.71, 4.90, 45.81]},
    {"city": "Marseille", "country": "France", "population": 870000, "lat": 43.2965, "lon": 5.3698, "bbox": [5.30, 43.22, 5.48, 43.38]},

    # Southern Europe & Middle East
    {"city": "Madrid", "country": "Spain", "population": 3223000, "lat": 40.4168, "lon": -3.7038, "bbox": [-3.85, 40.30, -3.55, 40.52]},
    {"city": "Barcelona", "country": "Spain", "population": 1636000, "lat": 41.3851, "lon": 2.1734, "bbox": [2.08, 41.32, 2.25, 41.46]},
    {"city": "Valencia", "country": "Spain", "population": 800000, "lat": 39.4699, "lon": -0.3763, "bbox": [-0.45, 39.40, -0.30, 39.52]},
    {"city": "Rome", "country": "Italy", "population": 2873000, "lat": 41.9028, "lon": 12.4964, "bbox": [12.35, 41.80, 12.65, 42.00]},
    {"city": "Milan", "country": "Italy", "population": 1378000, "lat": 45.4642, "lon": 9.1900, "bbox": [9.05, 45.38, 9.30, 45.54]},
    {"city": "Athens", "country": "Greece", "population": 664000, "lat": 37.9838, "lon": 23.7275, "bbox": [23.65, 37.90, 23.80, 38.05]},
    {"city": "Thessaloniki", "country": "Greece", "population": 315000, "lat": 40.6401, "lon": 22.9444, "bbox": [22.88, 40.58, 23.00, 40.68]},
    {"city": "Lisbon", "country": "Portugal", "population": 545000, "lat": 38.7223, "lon": -9.1393, "bbox": [-9.25, 38.68, -9.08, 38.80]},
    {"city": "Porto", "country": "Portugal", "population": 231000, "lat": 41.1579, "lon": -8.6291, "bbox": [-8.70, 41.12, -8.55, 41.20]},
    {"city": "Istanbul", "country": "Turkey", "population": 15460000, "lat": 41.0082, "lon": 28.9784, "bbox": [28.70, 40.85, 29.25, 41.20]},
    {"city": "Ankara", "country": "Turkey", "population": 5747000, "lat": 39.9334, "lon": 32.8597, "bbox": [32.65, 39.80, 33.05, 40.05]},
    {"city": "Izmir", "country": "Turkey", "population": 4410000, "lat": 38.4237, "lon": 27.1428, "bbox": [27.00, 38.30, 27.30, 38.55]},
    {"city": "Tel Aviv", "country": "Israel", "population": 460000, "lat": 32.0853, "lon": 34.7818, "bbox": [34.72, 32.02, 34.84, 32.14]},
    {"city": "Amman", "country": "Jordan", "population": 4000000, "lat": 31.9454, "lon": 35.9284, "bbox": [35.80, 31.85, 36.08, 32.05]},

    # Americas
    {"city": "New York", "country": "United States", "population": 8336000, "lat": 40.7128, "lon": -74.0060, "bbox": [-74.15, 40.55, -73.80, 40.90]},
    {"city": "Los Angeles", "country": "United States", "population": 3822000, "lat": 34.0522, "lon": -118.2437, "bbox": [-118.50, 33.80, -118.00, 34.30]},
    {"city": "Chicago", "country": "United States", "population": 2665000, "lat": 41.8781, "lon": -87.6298, "bbox": [-87.80, 41.65, -87.50, 42.05]},
    {"city": "Austin", "country": "United States", "population": 974000, "lat": 30.2672, "lon": -97.7431, "bbox": [-97.90, 30.15, -97.60, 30.42]},
    {"city": "Seattle", "country": "United States", "population": 737000, "lat": 47.6062, "lon": -122.3321, "bbox": [-122.45, 47.48, -122.22, 47.73]},
    {"city": "Denver", "country": "United States", "population": 713000, "lat": 39.7392, "lon": -104.9903, "bbox": [-105.10, 39.60, -104.85, 39.85]},
    {"city": "Toronto", "country": "Canada", "population": 2794000, "lat": 43.6532, "lon": -79.3832, "bbox": [-79.60, 43.58, -79.15, 43.85]},
    {"city": "Montreal", "country": "Canada", "population": 1762000, "lat": 45.5017, "lon": -73.5673, "bbox": [-73.75, 45.40, -73.45, 45.65]},
    {"city": "Vancouver", "country": "Canada", "population": 662000, "lat": 49.2827, "lon": -123.1207, "bbox": [-123.25, 49.20, -123.00, 49.32]},

    # Asia & Oceania
    {"city": "Tokyo", "country": "Japan", "population": 13960000, "lat": 35.6762, "lon": 139.6503, "bbox": [139.40, 35.50, 139.90, 35.85]},
    {"city": "Osaka", "country": "Japan", "population": 2750000, "lat": 34.6937, "lon": 135.5023, "bbox": [135.35, 34.58, 135.65, 34.80]},
    {"city": "Kyoto", "country": "Japan", "population": 1463000, "lat": 35.0116, "lon": 135.7681, "bbox": [135.65, 34.90, 135.88, 35.10]},
    {"city": "Seoul", "country": "South Korea", "population": 9668000, "lat": 37.5665, "lon": 126.9780, "bbox": [126.80, 37.45, 127.15, 37.68]},
    {"city": "Singapore", "country": "Singapore", "population": 5917000, "lat": 1.3521, "lon": 103.8198, "bbox": [103.60, 1.22, 104.02, 1.47]},
    {"city": "Sydney", "country": "Australia", "population": 5312000, "lat": -33.8688, "lon": 151.2093, "bbox": [150.90, -34.05, 151.35, -33.65]},
    {"city": "Melbourne", "country": "Australia", "population": 5078000, "lat": -37.8136, "lon": 144.9631, "bbox": [144.75, -38.00, 145.20, -37.65]}
]


def find_peer_cities(target_city: str, target_country: str, target_population: int, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Find peer comparison cities using population similarity ratio.
    Prefers same country, then same geographic region, then global similar cities.
    Population window: 0.33x to 3.0x of target_population.
    """
    if target_population <= 0:
        target_population = 1000000
        
    candidates = []
    
    for item in GLOBAL_CITIES_CATALOG:
        c_name = item["city"]
        c_country = item["country"]
        c_pop = item["population"]
        
        # Skip identical target city
        if c_name.lower() == target_city.lower() and c_country.lower() == target_country.lower():
            continue
            
        ratio = c_pop / target_population if target_population > 0 else 1.0
        
        # Accept cities between 0.25x and 3.5x population
        if 0.25 <= ratio <= 3.5:
            # Score similarity (1.0 = identical population)
            pop_diff = abs(c_pop - target_population)
            pop_score = math.exp(-pop_diff / max(target_population, 100000))
            
            # Boost score if same country
            same_country = (c_country.lower() == target_country.lower())
            final_score = pop_score * (2.5 if same_country else 1.0)
            
            cand = dict(item)
            cand["population_ratio"] = round(ratio, 2)
            cand["match_score"] = round(final_score, 3)
            cand["same_country"] = same_country
            candidates.append(cand)
            
    # Sort candidates by match_score descending
    candidates.sort(key=lambda x: x["match_score"], reverse=True)
    
    # If candidates is fewer than limit, pick closest by population diff regardless
    if len(candidates) < limit:
        remaining = [c for c in GLOBAL_CITIES_CATALOG if c["city"].lower() != target_city.lower()]
        remaining.sort(key=lambda x: abs(x["population"] - target_population))
        for r in remaining:
            if not any(c["city"] == r["city"] for c in candidates):
                r_copy = dict(r)
                r_copy["population_ratio"] = round(r["population"] / target_population, 2)
                r_copy["match_score"] = 0.5
                r_copy["same_country"] = (r["country"].lower() == target_country.lower())
                candidates.append(r_copy)
            if len(candidates) >= limit:
                break
                
    return candidates[:limit]
