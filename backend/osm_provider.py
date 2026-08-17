"""
OpenStreetMap / Overpass Data Provider for Coverage Validation.
"""

import logging
import httpx
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

def get_osm_category_count(bbox: list, osm_tag_key: str = "amenity", osm_tag_val: str = "restaurant") -> Optional[int]:
    """
    Query Overpass API for POI count in bounding box [minx, miny, maxx, maxy].
    """
    minx, miny, maxx, maxy = bbox
    query = f"""
    [out:json][timeout:10];
    (
      node["{osm_tag_key}"="{osm_tag_val}"]({miny},{minx},{maxy},{maxx});
      way["{osm_tag_key}"="{osm_tag_val}"]({miny},{minx},{maxy},{maxx});
    );
    out count;
    """
    try:
        resp = httpx.post(OVERPASS_URL, data={"data": query}, timeout=8.0)
        if resp.status_code == 200:
            data = resp.json()
            elements = data.get("elements", [])
            if elements:
                tags = elements[0].get("tags", {})
                total = int(tags.get("total", 0))
                return total
    except Exception as e:
        logger.warning(f"Overpass count query failed: {e}")
    return None
