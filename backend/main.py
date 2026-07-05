import asyncio
import json
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from config import CORS_ORIGINS
from stock_service import get_stock_data, get_historical_data, get_ticker_info
from database import init_db, insert_price_record
from anomaly_service import check_anomaly
from ai_service import ask_market_question
from sentiment_service import fetch_news_sentiment

app = FastAPI(title="MarketPulse AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    try:
        init_db()
    except Exception as e:
        print(f"Database init skipped (non-fatal): {e}")


@app.get("/")
async def root():
    return {"message": "MarketPulse AI API is running"}


@app.websocket("/ws/stocks")
async def websocket_stocks(websocket: WebSocket):
    await websocket.accept()
    try:
        data = await websocket.receive_text()
        msg = json.loads(data)
        tickers = msg.get("tickers", [])
        if not tickers:
            await websocket.send_json({"error": "No tickers provided"})
            return

        while True:
            results = []
            for ticker in tickers:
                sd = get_stock_data(ticker)
                if sd:
                    try:
                        insert_price_record(
                            ticker=sd["ticker"],
                            price=sd["price"],
                            volume=sd["volume"],
                            change_percent=sd["changePercent"],
                        )
                    except Exception:
                        pass
                    anomaly = check_anomaly(
                        ticker=sd["ticker"],
                        current_price=sd["price"],
                        current_volume=sd["volume"],
                    )
                    if anomaly:
                        sd["anomaly"] = anomaly
                    results.append(sd)
            await websocket.send_json({"type": "stock_update", "data": results})
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")


@app.get("/api/stock/{ticker}/history")
async def stock_history(ticker: str, period: str = "1mo"):
    data = get_historical_data(ticker, period)
    return JSONResponse(content={"ticker": ticker.upper(), "data": data})


@app.get("/api/stock/{ticker}/info")
async def stock_info(ticker: str):
    data = get_ticker_info(ticker)
    if data is None:
        return JSONResponse(content={"error": f"Could not fetch info for {ticker}"}, status_code=404)
    return JSONResponse(content=data)


@app.get("/api/stock/{ticker}/sentiment")
async def stock_sentiment(ticker: str):
    data = fetch_news_sentiment(ticker)
    return JSONResponse(content=data)


@app.get("/api/tickers/compare")
async def compare_tickers(tickers: str = Query(..., description="Comma-separated ticker symbols")):
    ticker_list = [t.strip().upper() for t in tickers.split(",") if t.strip()]
    results = []
    for t in ticker_list:
        sd = get_stock_data(t)
        if sd:
            sentiment = fetch_news_sentiment(t)
            sd["sentiment"] = sentiment["score"]
            results.append(sd)
    return JSONResponse(content={"tickers": results})


@app.post("/api/stock/poll")
async def stock_poll(body: dict):
    tickers = body.get("tickers", [])
    results = []
    for ticker in tickers:
        sd = get_stock_data(ticker)
        if sd:
            try:
                insert_price_record(
                    ticker=sd["ticker"],
                    price=sd["price"],
                    volume=sd["volume"],
                    change_percent=sd["changePercent"],
                )
            except Exception:
                pass
            anomaly = check_anomaly(
                ticker=sd["ticker"],
                current_price=sd["price"],
                current_volume=sd["volume"],
            )
            if anomaly:
                sd["anomaly"] = anomaly
            results.append(sd)
    return JSONResponse(content={"type": "stock_update", "data": results})


@app.post("/api/ai/chat")
async def ai_chat(body: dict):
    question = body.get("question", "")
    tickers = body.get("tickers", [])
    context = None
    if tickers:
        stocks = []
        for t in tickers:
            sd = get_stock_data(t)
            if sd:
                stocks.append(sd)
        context = {"stocks": stocks}
    answer = ask_market_question(question, context)
    return JSONResponse(content={"answer": answer})
