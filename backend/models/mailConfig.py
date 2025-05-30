import smtplib, ssl
from email.message import EmailMessage
from email.mime.text import MIMEText
import os



def send_message(passwd, receiver):
    port = 465
    password = os.getenv("EMAIL_ACCOUNT_PASS")
    sender_email = "imdoingaproject7@gmail.com"
    receiver_email = receiver

    html_body = f"""\
      <html>
        <body>
          <div style="border-radius: 25px; color: white; background-color: #2563eb; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Title -->
            <h1 style="font-size: 32px; text-align: center; margin-bottom: 40px;">ExpenseTracker</h1>

            <!-- Subtitle -->
            <h2 style="font-size: 24px; text-align: center; margin-bottom: 20px;">Your admin password is:</h2>

            <!-- Password box -->
            <div style="
                background-color: white;
                color: #2563eb;
                padding: 16px;
                border-radius: 8px;
                font-size: 20px;
                text-align: center;
                font-weight: bold;
                max-width: 400px;
                margin: 0 auto;
              ">
              {passwd}
            </div>
          </div>
        </body>
      </html>
      """



    message = MIMEText(html_body,"html")
    message["Subject"] = "Your Admin Account Password"
    message["From"] = sender_email
    message["To"] = receiver_email


    context = ssl.create_default_context()

    with smtplib.SMTP_SSL("smtp.gmail.com", port, context=context) as server:
        server.login(sender_email, password)
        server.send_message(message)

