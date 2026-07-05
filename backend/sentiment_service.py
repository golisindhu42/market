from textblob import TextBlob
import requests
import time
from config import NEWS_API_KEY

NEWS_CACHE: dict[str, tuple[dict, float]] = {}
CACHE_TTL = 300  # 5 minutes


def analyze_sentiment(texts: list[str]) -> float:
    if not texts:
        return 50.0
    scores = []
    for text in texts:
        if text:
            blob = TextBlob(text)
            scores.append(blob.sentiment.polarity)
    if not scores:
        return 50.0
    avg = sum(scores) / len(scores)
    normalized = ((avg + 1) / 2) * 100
    return round(normalized, 1)


def fetch_news_sentiment(ticker: str) -> dict:
    cache_key = ticker.upper()
    cached = NEWS_CACHE.get(cache_key)
    if cached and (time.time() - cached[1]) < CACHE_TTL:
        return cached[0]

    headlines = []
    if NEWS_API_KEY:
        try:
            url = "https://newsapi.org/v2/everything"
            params = {
                "q": ticker,
                "pageSize": 20,
                "language": "en",
                "sortBy": "publishedAt",
                "apiKey": NEWS_API_KEY,
            }
            resp = requests.get(url, params=params, timeout=10)
            if resp.status_code == 200:
                articles = resp.json().get("articles", [])
                for article in articles:
                    title = article.get("title", "")
                    desc = article.get("description", "")
                    headlines.append(f"{title}. {desc}" if desc else title)
        except Exception as e:
            print(f"NewsAPI error for {ticker}: {e}")

    score = analyze_sentiment(headlines)
    top_headlines = headlines[:5]

    result = {
        "ticker": ticker.upper(),
        "score": score,
        "headlines": top_headlines,
        "label": "Bullish" if score > 60 else "Bearish" if score < 40 else "Neutral",
    }

    NEWS_CACHE[cache_key] = (result, time.time())
    return result
