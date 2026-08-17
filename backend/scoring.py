"""
Statistical Scoring & Benchmark Engine for Global Business Gap Finder.
Computes Population-Normalized Supply, Peer Benchmarks, Market Gaps,
Opportunity Scores (0-100), Data Confidence Scores (0-100), and Data-Driven Explanations.
"""

import math
import statistics
from typing import List, Dict, Any, Tuple


def clamp(val: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
    return max(min_val, min(val, max_val))


def calculate_per_10k(count: int, population: int) -> float:
    if population <= 0:
        return 0.0
    return round((count / population) * 10000.0, 3)


def calculate_market_gap_analysis(
    target_city: str,
    target_population: int,
    target_existing_count: int,
    target_avg_poi_confidence: float,
    category_title: str,
    peer_data: List[Dict[str, Any]], # List of dicts: {"city": str, "population": int, "count": int, "avg_confidence": float}
    population_year: str = "2024"
) -> Dict[str, Any]:
    """
    Computes full market gap statistics, peer comparisons, Opportunity Score,
    Data Confidence Score, and natural language explanation.
    """
    if target_population <= 0:
        target_population = 1000000

    target_per_10k = calculate_per_10k(target_existing_count, target_population)
    
    # Calculate peer per-10k rates and peer statistics
    peer_rates = []
    peer_results = []
    
    for p in peer_data:
        p_pop = p.get("population", 1000000)
        p_cnt = p.get("count", 0)
        p_rate = calculate_per_10k(p_cnt, p_pop)
        peer_rates.append(p_rate)
        peer_results.append({
            "city": p.get("city"),
            "country": p.get("country", ""),
            "population": p_pop,
            "existing_count": p_cnt,
            "per_10k": p_rate,
            "avg_confidence": p.get("avg_confidence", 0.6)
        })
        
    # Calculate peer benchmark rate (weighted median or median)
    if peer_rates:
        peer_rates_sorted = sorted(peer_rates)
        benchmark_per_10k = round(statistics.median(peer_rates_sorted), 3)
    else:
        benchmark_per_10k = target_per_10k
        
    # Expected supply calculation
    expected_count = max(1, round((benchmark_per_10k * target_population) / 10000.0))
    estimated_gap = expected_count - target_existing_count
    
    gap_percent = round((estimated_gap / max(expected_count, 1)) * 100.0, 1)
    
    # --- 1. OPPORTUNITY SCORE CALCULATIONS ---
    # A. Supply Gap Score (60%)
    # If gap is positive (undersupplied), score is > 50. If gap is zero, score = 50. If negative (oversupplied), < 50.
    gap_ratio = (expected_count - target_existing_count) / max(expected_count, 1)
    if gap_ratio >= 0:
        gap_score = 50.0 + (gap_ratio * 80.0) # gap of 50%+ yields score 90+
    else:
        gap_score = 50.0 + (gap_ratio * 50.0) # oversupply drops score
    gap_score = clamp(gap_score, 0.0, 100.0)
    
    # B. Relative Undersupply Percentile (25%)
    # Ranks target city per_10k against peers
    all_rates = peer_rates + [target_per_10k]
    all_rates_sorted = sorted(all_rates)
    # Lower rate = higher undersupply score
    rank = sum(1 for r in all_rates if r > target_per_10k)
    undersupply_percentile = clamp((rank / max(len(all_rates) - 1, 1)) * 100.0, 10.0, 100.0)
    
    # C. Addressable Market Size (15%)
    # Logarithmic normalization based on population
    if target_population > 0:
        market_size_score = clamp(((math.log10(target_population) - 4.5) / 2.5) * 100.0, 20.0, 100.0)
    else:
        market_size_score = 50.0
        
    opportunity_score = round(
        0.60 * gap_score + 0.25 * undersupply_percentile + 0.15 * market_size_score
    )
    opportunity_score = int(clamp(opportunity_score, 0, 100))
    
    # Score label interpretation
    if opportunity_score >= 90:
        opportunity_label = "Exceptional Gap"
    elif opportunity_score >= 80:
        opportunity_label = "Very Strong Opportunity"
    elif opportunity_score >= 70:
        opportunity_label = "Strong Opportunity"
    elif opportunity_score >= 60:
        opportunity_label = "Potential Opportunity"
    elif opportunity_score >= 45:
        opportunity_label = "Balanced / Unclear"
    elif opportunity_score >= 30:
        opportunity_label = "Competitive"
    else:
        opportunity_label = "Highly Saturated"
        
    # --- 2. DATA CONFIDENCE SCORE CALCULATIONS ---
    # A. POI Source Confidence (30%)
    poi_conf_score = clamp(target_avg_poi_confidence * 100.0, 20.0, 100.0)
    
    # B. Population Quality & Recency (20%)
    pop_score = 90.0 # High confidence from official census / Wikidata
    
    # C. Number of Peers Evaluated (25%)
    num_peers = len(peer_results)
    peer_count_score = clamp((num_peers / 5.0) * 100.0, 30.0, 100.0)
    
    # D. Peer Rate Consistency / Variance (15%)
    if len(peer_rates) > 1:
        stdev = statistics.stdev(peer_rates)
        mean_r = statistics.mean(peer_rates)
        cv = (stdev / max(mean_r, 0.01))
        consistency_score = clamp(100.0 - (cv * 50.0), 20.0, 100.0)
    else:
        consistency_score = 70.0
        
    # E. Anomaly Check (10%)
    # If 0 businesses found in a city of > 200,000, flag potential data coverage issue
    anomaly_penalty = 0.0
    if target_existing_count == 0 and target_population > 200000:
        anomaly_penalty = 35.0
        
    data_confidence_score = round(
        0.30 * poi_conf_score + 
        0.20 * pop_score + 
        0.25 * peer_count_score + 
        0.15 * consistency_score + 
        0.10 * 80.0 - anomaly_penalty
    )
    data_confidence_score = int(clamp(data_confidence_score, 10, 100))
    
    # Generate human-readable explanation
    explanation = generate_explanation(
        target_city=target_city,
        category_title=category_title,
        target_per_10k=target_per_10k,
        benchmark_per_10k=benchmark_per_10k,
        existing_count=target_existing_count,
        expected_count=expected_count,
        estimated_gap=estimated_gap,
        opportunity_label=opportunity_label,
        opportunity_score=opportunity_score,
        population=target_population,
        population_year=population_year
    )
    
    return {
        "target_city": target_city,
        "target_population": target_population,
        "population_year": population_year,
        "category_title": category_title,
        "existing_count": target_existing_count,
        "per_10k": target_per_10k,
        "benchmark_per_10k": benchmark_per_10k,
        "expected_count": expected_count,
        "estimated_gap": estimated_gap,
        "gap_percent": gap_percent,
        "opportunity_score": opportunity_score,
        "opportunity_label": opportunity_label,
        "data_confidence_score": data_confidence_score,
        "explanation": explanation,
        "peer_cities": peer_results,
        "metrics_breakdown": {
            "gap_score": round(gap_score, 1),
            "undersupply_percentile": round(undersupply_percentile, 1),
            "market_size_score": round(market_size_score, 1),
            "poi_confidence": round(poi_conf_score, 1),
            "peer_count_score": round(peer_count_score, 1),
            "consistency_score": round(consistency_score, 1)
        }
    }


def generate_explanation(
    target_city: str,
    category_title: str,
    target_per_10k: float,
    benchmark_per_10k: float,
    existing_count: int,
    expected_count: int,
    estimated_gap: int,
    opportunity_label: str,
    opportunity_score: int,
    population: int,
    population_year: str
) -> str:
    """Generate exact data-driven narrative based on deterministic statistical outputs."""
    pop_str = f"{population / 1_000_000:.2f}M" if population >= 1_000_000 else f"{population:,}"
    
    if estimated_gap > 0:
        return (
            f"{target_city} (population {pop_str}, {population_year}) appears relatively underserved for {category_title.lower()} "
            f"compared with peer cities of similar population size. The city currently has approximately {target_per_10k:.2f} "
            f"detected {category_title.lower()} businesses per 10,000 residents, while the peer-city benchmark rate is {benchmark_per_10k:.2f}. "
            f"Matching the benchmark would imply roughly {expected_count:,} businesses compared with {existing_count:,} currently detected, "
            f"producing an estimated supply gap of approximately {estimated_gap:,} businesses. "
            f"This produces an Opportunity Score of {opportunity_score}/100 ({opportunity_label}), indicating potential Blue Ocean growth space."
        )
    elif estimated_gap == 0:
        return (
            f"{target_city} (population {pop_str}, {population_year}) displays balanced supply for {category_title.lower()}. "
            f"The city currently has {existing_count:,} detected businesses ({target_per_10k:.2f} per 10,000 residents), matching "
            f"the peer-city benchmark rate of {benchmark_per_10k:.2f}. "
            f"The Opportunity Score is {opportunity_score}/100 ({opportunity_label}), indicating a mature and well-served market."
        )
    else:
        surplus = abs(estimated_gap)
        return (
            f"{target_city} (population {pop_str}, {population_year}) displays a saturated supply for {category_title.lower()}. "
            f"The city currently has {existing_count:,} detected businesses ({target_per_10k:.2f} per 10,000 residents), "
            f"compared to the peer-city benchmark rate of {benchmark_per_10k:.2f} ({expected_count:,} expected businesses). "
            f"Existing supply exceeds the peer benchmark by approximately {surplus:,} businesses. "
            f"The Opportunity Score is {opportunity_score}/100 ({opportunity_label}), signaling intense local competition."
        )
