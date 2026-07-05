from database import get_recent_records


def check_anomaly(ticker: str, current_price: float, current_volume: int) -> dict | None:
    records = get_recent_records(ticker, limit=100)
    if len(records) < 5:
        return None

    volumes = [r["volume"] for r in records if r["volume"] > 0]
    prices = [r["price"] for r in records]

    anomalies = []

    if volumes:
        avg_volume = sum(volumes) / len(volumes)
        if avg_volume > 0 and current_volume > avg_volume * 2:
            spike_pct = round(((current_volume - avg_volume) / avg_volume) * 100, 1)
            severity = "high" if spike_pct > 300 else "medium"
            anomalies.append({
                "type": "volume_spike",
                "severity": severity,
                "message": f"{ticker} volume spiked {spike_pct}% above average",
            })

    if len(prices) >= 5:
        price_5min_ago = prices[-5]
        if price_5min_ago > 0:
            change_pct = abs((current_price - price_5min_ago) / price_5min_ago) * 100
            if change_pct > 3:
                direction = "up" if current_price > price_5min_ago else "down"
                severity = "high" if change_pct > 5 else "medium"
                anomalies.append({
                    "type": "price_movement",
                    "severity": severity,
                    "message": f"{ticker} moved {direction} {round(change_pct, 1)}% in 5 minutes",
                })

    return anomalies[0] if anomalies else None
