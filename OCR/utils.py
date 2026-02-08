import cv2
import pytesseract
import re
import numpy as np
from datetime import datetime


# ----------------------------
# 1) Image Preprocessing
# ----------------------------
def preprocess_image(image_bgr):
    """
    Preprocess receipt image for better OCR.
    Works well on printed receipts with black text on white paper.
    """

    # Convert to grayscale
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)

    # Resize up for better OCR accuracy
    gray = cv2.resize(gray, None, fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)

    # Denoise while preserving edges
    gray = cv2.bilateralFilter(gray, 9, 75, 75)

    # Otsu thresholding (usually better than adaptive for receipts)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Slight morphology close to connect broken characters
    kernel = np.ones((2, 2), np.uint8)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    return thresh, gray


# ----------------------------
# 2) OCR (Two Pass)
# ----------------------------
def extract_text_two_pass(image_bgr):
    """
    Two-pass OCR:
    - Run on thresholded version (good for strong contrast)
    - Run on grayscale version (sometimes preserves missing text like TOTAL)

    Returns merged text.
    """

    processed, gray = preprocess_image(image_bgr)

    config = r"--oem 3 --psm 6"

    t1 = pytesseract.image_to_string(processed, config=config)
    t2 = pytesseract.image_to_string(gray, config=config)

    combined = (t1 + "\n" + t2).strip()
    return combined


# ----------------------------
# 3) Helpers
# ----------------------------
def normalize_text(text: str) -> str:
    """
    Fix common OCR mistakes to improve regex matching.
    """
    if not text:
        return ""

    t = text

    # common OCR confusion
    t = t.replace("₹", "")
    t = t.replace("$", "")
    t = t.replace(",", "")

    # O and o often become 0 in receipts
    # but replacing all 'o' with '0' can harm words
    # so only do some targeted replacements later for date parsing
    return t


def clean_line(line: str) -> str:
    return re.sub(r"\s+", " ", line).strip()


# ----------------------------
# 4) Extract Place (Merchant)
# ----------------------------
def extract_place(text: str):
    """
    Merchant name is usually in top 1-5 lines.
    We'll choose best candidate by scoring.
    """
    if not text:
        return None

    lines = [clean_line(l) for l in text.split("\n") if len(clean_line(l)) > 2]

    ignore_words = [
        "tel", "phone", "gst", "invoice", "receipt", "reg", "manager",
        "cashier", "order", "table", "tax", "total", "amount", "change",
        "mc", "#", "no."
    ]

    candidates = []
    for line in lines[:10]:
        lower = line.lower()

        if any(w in lower for w in ignore_words):
            continue

        # skip if too many digits (address/phone)
        digit_count = sum(c.isdigit() for c in line)
        if digit_count >= 3:
            continue

        # remove symbols and leading garbage
        cleaned = re.sub(r"[^A-Za-z0-9 &'-]", "", line).strip()
        cleaned = re.sub(r"^[^A-Za-z]+", "", cleaned).strip()

        if len(cleaned) >= 4:
            candidates.append(cleaned)

    if not candidates:
        return None

    # Pick longest "valid" candidate
    best = max(candidates, key=len)

    # Make it look nice
    return best.title()


# ----------------------------
# 5) Extract Date
# ----------------------------
def extract_date(text: str):
    """
    Handles:
    - 05-18-2019
    - 05/18/2019
    - 2019-05-18
    Also handles OCR issues like "Of -18-2019" by converting 'O' -> '0'
    on probable date fragments.
    """
    if not text:
        return None

    # Targeted fix: replace letter O with 0 in date-like contexts
    cleaned = re.sub(r"([Oo])(?=\s*[/-]\s*\d)", "0", text)

    patterns = [
        r"\b(\d{2}[/-]\d{2}[/-]\d{4})\b",  # 05-18-2019
        r"\b(\d{4}[/-]\d{2}[/-]\d{2})\b",  # 2019-05-18
        r"\b(\d{1}[/-]\d{2}[/-]\d{4})\b",  # 5-18-2019
        r"\b(\d{2}[/-]\d{2}[/-]\d{2})\b"   # 05-18-19
    ]

    formats = [
        "%d/%m/%Y", "%d-%m-%Y",
        "%m/%d/%Y", "%m-%d-%Y",
        "%Y-%m-%d", "%Y/%m/%d",
        "%d/%m/%y", "%d-%m-%y",
        "%m/%d/%y", "%m-%d-%y"
    ]

    for pattern in patterns:
        match = re.search(pattern, cleaned)
        if match:
            raw = match.group(1)

            for fmt in formats:
                try:
                    return datetime.strptime(raw, fmt).strftime("%Y-%m-%d")
                except:
                    pass

    return None


# ----------------------------
# 6) Extract Mode (Cash/UPI/Card)
# ----------------------------
def extract_mode(text: str):
    if not text:
        return "UPI"

    t = text.lower()

    if "cash" in t:
        return "Cash"

    if "upi" in t:
        return "UPI"

    if "card" in t or "visa" in t or "mastercard" in t:
        return "Card"

    return "UPI"


# ----------------------------
# 7) Extract Total Price
# ----------------------------
def extract_price(text: str):
    """
    Best approach:
    1) Try keyword-based TOTAL extraction
    2) If missing, choose the max amount found (excluding tax/change/cg/cash lines)
    """
    if not text:
        return None

    cleaned = normalize_text(text)

    # 1) Keyword-based (strongest)
    keyword_patterns = [
        r"(grand\s*total|total\s*due|amount\s*payable|net\s*amount|total)[^\d]*([\d]+(?:\.\d{2})?)"
    ]

    for pattern in keyword_patterns:
        match = re.search(pattern, cleaned, re.IGNORECASE)
        if match:
            try:
                val = float(match.group(2))
                # Very small totals are unlikely to be final total
                if val >= 1:
                    return val
            except:
                pass

    # 2) Fallback: choose max meaningful amount
    amounts = []

    for line in cleaned.split("\n"):
        lower = line.lower()

        # exclude misleading amounts
        if "cg" in lower or "change" in lower:
            continue
        if "cash" in lower and "total" not in lower:
            continue

        nums = re.findall(r"\b\d+\.\d{2}\b", line)
        for n in nums:
            try:
                amounts.append(float(n))
            except:
                pass

    if amounts:
        # max amount usually equals total for receipts
        return max(amounts)

    return None


# ----------------------------
# 8) Main Pipeline Extractor
# ----------------------------
def extract_receipt_fields(image_bgr):
    """
    End-to-end extraction
    Returns:
      place, date, price, mode, rawText
    """
    raw_text = extract_text_two_pass(image_bgr)

    place = extract_place(raw_text)
    date = extract_date(raw_text)
    price = extract_price(raw_text)
    mode = extract_mode(raw_text)

    return {
        "place": place,
        "date": date,
        "price": price,
        "mode": mode,
        "rawText": raw_text
    }
