import ollama

prompt = ("I am using RON, only extract the total amount from the given text: ")




def LLM_extraction(text):
    response = ollama.chat(model="gemma3", messages=[{"role": "user", "content": prompt + text}])
    print(response["message"]["content"])
