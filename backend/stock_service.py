import yfinance as yf
import pandas as pd


def get_stock_data(ticker: str) -> dict | None:
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        hist = stock.history(period="5d", interval="1m")
        if hist.empty:
            return None

        latest = hist.iloc[-1]
        prev_close = hist["Close"].iloc[-2] if len(hist) > 1 else latest["Close"]

        current_price = round(float(latest["Close"]), 2)
        prev_close_val = round(float(prev_close), 2)
        change_percent = round(((current_price - prev_close_val) / prev_close_val) * 100, 2)

        return {
            "ticker": ticker.upper(),
            "price": current_price,
            "changePercent": change_percent,
            "volume": int(latest["Volume"]),
            "open": round(float(latest["Open"]), 2),
            "high": round(float(latest["High"]), 2),
            "low": round(float(latest["Low"]), 2),
            "prevClose": prev_close_val,
            "companyName": info.get("longName", ticker.upper()),
            "timestamp": str(latest.name),
        }
    except Exception as e:
        print(f"Error fetching {ticker}: {e}")
        return None


def get_historical_data(ticker: str, period: str = "1mo") -> list[dict]:
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period, interval="1d")
        result = []
        for date, row in hist.iterrows():
            result.append({
                "date": date.strftime("%Y-%m-%d"),
                "price": round(float(row["Close"]), 2),
            })
        return result
    except Exception as e:
        print(f"Error fetching history for {ticker}: {e}")
        return []


def get_ticker_info(ticker: str) -> dict | None:
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        return {
            "ticker": ticker.upper(),
            "companyName": info.get("longName", ""),
            "sector": info.get("sector", ""),
            "marketCap": info.get("marketCap", 0),
            "peRatio": info.get("trailingPE", None),
            "week52High": info.get("fiftyTwoWeekHigh", None),
            "week52Low": info.get("fiftyTwoWeekLow", None),
        }
    except Exception as e:
        print(f"Error fetching info for {ticker}: {e}")
        return None
