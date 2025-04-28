from openai import OpenAI

# add your openrouter API key here
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="",
)

prompt = """
You are a receipt data extraction assistant. 
Your task is to extract specific information from OCR-processed receipt text while 
correcting any obvious errors or typos.

Receipt text:
{raw_ocr_text}

Extract the following information and respond ONLY using this exact format:

VENDOR: [Identified business name with corrected OCR errors]
CATEGORY: [Identified category, MUST be one of the following: "Food & Dining", "Transport", "Shopping", "Bills" or "Other"] 
TOTAL: [Final amount paid]
DATE: [Transaction date]
TIME: [Transaction time or "Unknown" if not found]

Guidelines:
- As context, use Romanian vendors, shops, companies (for example LIDL, Kaufland, Profi, Carrefour, etc.)
- If unsure about a vendor, use as is (don't correct it).
- The identified category must be one of the following: "Food & Dining", "Transport", "Shopping", "Bills" or "Other"
- If you can't determine any field with reasonable confidence, use "Unknown"
- Do not include any explanations or additional text
- Always use the exact label format shown above
"""

fallback_response = """
VENDOR: Unknown
CATEGORY: Unknown
TOTAL: Unknown
DATE: Unknown
TIME: Unknown
"""

timeout = 10  # seconds


def llm_processing(raw_ocr_text: str):
    try:
        # NOTE: free model for now, to test the API
        completion = client.chat.completions.create(
            model="deepseek/deepseek-chat-v3-0324:free",
            messages=[
                {"role": "user",
                 "content": prompt.format(raw_ocr_text=raw_ocr_text)},
            ],
            timeout=timeout,
        )
        return completion.choices[0].message.content

    except Exception as e:
        return fallback_response
