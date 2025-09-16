# recommendation.py
import re
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from image_extractor import get_product_image_url

# --- Load data ---
df = pd.read_csv("general_skin_care_final.csv")

# Validate required column
if "concern" not in df.columns:
    raise ValueError("CSV must contain 'concern' column.")

# Text used for similarity
df["text"] = df["concern"].fillna("")

# --- TF-IDF over concerns ---
tfidf = TfidfVectorizer(stop_words="english")
tfidf_matrix = tfidf.fit_transform(df["text"])

# --- Category helpers ---
PRIORITY_ORDER = ["serum", "facewash", "sunscreen", "moisturizer", "others"]
MAX_PER_CATEGORY = 1
MIN_PER_CATEGORY = 1

def _priority_category(row) -> str:
    """Infer a priority category for a product."""
    label = str(row.get("label", "")).lower()
    name = str(row.get("name", "")).lower()
    text = f"{label} {name}"

    if re.search(r"\bserums?\b", text):
        return "serum"
    if any(k in text for k in ["face wash", "facewash", "cleanser", "cleansing", "face cleanser", "gel wash"]):
        return "facewash"
    if any(k in text for k in ["sunscreen", "sun screen", "sunblock", "spf "]) or re.search(r"\bspf\d{1,3}\b", text):
        return "sunscreen"
    if "face-moisturisers" in label or any(
        k in text for k in ["moisturizer", "moisturiser", "hydrating cream", "day cream", "night cream"]
    ):
        return "moisturizer"
    return "others"


def recommend_products(user_concerns, skin_type=None, top_n=5):
    """
    Select products with priority buckets:
      serum → facewash → sunscreen → moisturizer → others
    - At least 1 per category (if available)
    - At most 2 per category
    - Fill extra slots by priority and similarity
    - Prioritize products matching user's skin type if provided
    """
    # Similarity scores vs. concerns
    user_input = " ".join(user_concerns or [])
    user_vec = tfidf.transform([user_input])
    scores = cosine_similarity(user_vec, tfidf_matrix).flatten()

    # Candidate frame with scores + category
    candidates = df.copy()
    candidates["__score"] = scores
    candidates["__prio_cat"] = candidates.apply(_priority_category, axis=1)
    
    # Add skin type matching bonus to score if skin_type is provided
    if skin_type:
        skin_type_lower = skin_type.lower()
        # Add bonus score for matching skin type or "all" skin types
        def skin_type_bonus(row):
            product_skin_type = str(row.get("skin type", "")).lower()
            if product_skin_type == skin_type_lower:
                return 0.3  # High bonus for exact match
            elif product_skin_type == "all":
                return 0.1  # Small bonus for universal products
            else:
                return 0.0  # No bonus for different skin types
        
        candidates["__skin_bonus"] = candidates.apply(skin_type_bonus, axis=1)
        candidates["__final_score"] = candidates["__score"] + candidates["__skin_bonus"]
    else:
        candidates["__final_score"] = candidates["__score"]

    selected_indices = []

    # Pass 1: ensure at least 1 from each category if available
    for cat in PRIORITY_ORDER:
        sub = candidates[candidates["__prio_cat"] == cat]
        if not sub.empty and len(selected_indices) < top_n:
            best_one = sub.nlargest(1, "__final_score")
            selected_indices.extend(best_one.index.tolist())

    # Pass 2: add more (up to 2 per category) following priority
    for cat in PRIORITY_ORDER:
        if len(selected_indices) >= top_n:
            break
        sub = candidates[candidates["__prio_cat"] == cat]
        already_from_cat = [i for i in selected_indices if candidates.loc[i, "__prio_cat"] == cat]
        slots_left = MAX_PER_CATEGORY - len(already_from_cat)
        remaining_slots = top_n - len(selected_indices)
        if slots_left > 0 and not sub.empty:
            extra = sub.drop(index=already_from_cat, errors="ignore").nlargest(
                min(slots_left, remaining_slots), "__final_score"
            )
            selected_indices.extend(extra.index.tolist())

    # Pass 3: if still not enough, backfill globally by final score
    if len(selected_indices) < top_n:
        backfill = (
            candidates.drop(index=selected_indices, errors="ignore")
            .nlargest(top_n - len(selected_indices), "__final_score")
        )
        selected_indices.extend(backfill.index.tolist())

    # Prepare output with skin type and image information
    out = candidates.loc[selected_indices, ["brand", "name", "price", "concern", "url", "skin type"]]
    
    # Add image URLs to recommendations
    recommendations = []
    for _, row in out.iterrows():
        # Determine product category for fallback image
        product_category = _priority_category(row)
        
        # Get product image URL (with fallback)
        image_url = get_product_image_url(row.get('url', ''), product_category)
        
        recommendation = {
            "brand": row.get('brand', ''),
            "name": row.get('name', ''),
            "price": row.get('price', ''),
            "concern": row.get('concern', ''),
            "url": row.get('url', ''),
            "skin type": row.get('skin type', ''),
            "image_url": image_url,
            "category": product_category
        }
        recommendations.append(recommendation)
    
    return recommendations
