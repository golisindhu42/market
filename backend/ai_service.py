from groq import Groq
from config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

SYSTEM_PROMPT = (
    "You are a financial market intelligence assistant with access to live stock data. "
    "Answer user questions about the stock market using the provided context data. "
    "Be concise, accurate, and cite specific numbers when relevant. "
    "If you don't know something, say so rather than making it up."
)


def ask_market_question(question: str, context: dict | None = None) -> str:
    if not client:
        return "AI service not configured. Please set GROQ_API_KEY in the backend .env file."

    context_str = ""
    if context and context.get("stocks"):
        context_str = "Here is the current market data:\n" + format_context(context["stocks"]) + "\n\n"

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": context_str + question},
            ],
            max_tokens=500,
            temperature=0.7,
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error calling AI service: {str(e)}"


def format_context(stocks: list[dict]) -> str:
    lines = []
    for s in stocks:
        lines.append(
            f"- {s['ticker']} ({s.get('companyName', '')}): "
            f"${s['price']} ({s['changePercent']:+.2f}%), "
            f"Volume: {s['volume']:,}"
        )
    return "\n".join(lines)
