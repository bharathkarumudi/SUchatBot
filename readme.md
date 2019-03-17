Project Scope
Syracuse Chatbot is an AI Chatbot that receives questions from users, tries to understand the question, and provides appropriate answers. The application does this by converting an English sentence into a machine-friendly query, then going through relevant data to find the necessary information, and finally returning the answer in a natural language sentence. In other words, it answers your questions like a human. For example, when it receives the question "What is my term fee balance?", it will give a response “You owe $3500.”
The main objective is creating a Web based API, and sample web, mobile interfaces (through Slack and Facebook messengers) that demonstrate the use of the API.
The goal is to provide Syracuse students a quick and easy way to have their questions answered.

Product Perspective
Chatbot is a web-hosted application, developed based on the current bot technology. This application acts an intermediate media between users and databases. A user can interact with Chatbot via simple English sentences to request and update information from certain databases. These English sentences are analyzed by a Language Understanding Intelligent Service (LUIS) which is integrated with the Chatbot.
There will be four main units to the system working together to understand the question and return an appropriate answer:
Generic question construction - capable of taking a natural language question and making it more generic.
Generic answer construction - capable of taking a generic question template and providing a generic answer template.
Generic answer population - capable of taking a generic answer template and populating it with information from the database to form an answer.
Information extraction - capable of finding information available from the database.

Product Functions
Syracuse Chatbot shall be able to query on:
•	Student profile information
•	Classes and schedules
•	Payment information
