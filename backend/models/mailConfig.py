import smtplib, ssl
from email.message import EmailMessage
import os



def send_message(passwd, receiver):
    port = 465
    password = os.getenv("EMAIL_ACCOUNT_PASS")
    sender_email = "imdoingaproject7@gmail.com"
    receiver_email = receiver

    message = EmailMessage()
    message["Subject"] = "Your Admin Account Password"
    message["From"] = sender_email
    message["To"] = receiver_email
    message.set_content(f"Your generated password for ExpenseTracker is: {passwd}")


    context = ssl.create_default_context()

    with smtplib.SMTP_SSL("smtp.gmail.com", port, context=context) as server:
        server.login(sender_email, password)
        server.send_message(message)

