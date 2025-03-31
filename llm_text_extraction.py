import ollama

prompt = ("You are tasked with identifying and fixing the text on a receipt\n"
          "Identify the item and fix any inconsistencies in it's name ex: baNaN3 -> BANANE\n"
          "Structure them as item and price like: BANANE 6,20 LEI\n"
          "Also include a TOTAL AMOUNT: AMOUNT\n"
          "Here is the text:\n")



def LLM_extraction(text):
    response = ollama.chat(model="gemma3", messages=[{"role": "user", "content": prompt + text}])
    print(response["message"]["content"])
