# Syracuse Chatbot - A Bot for Syracuse University Students

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)]

Syracuse Chatbot is an AI Chatbot that receives questions from users, tries to understand the question, and provides appropriate answers. The application does this by converting an English sentence into a machine-friendly query, then going through relevant data to find the necessary information, and finally returning the answer in a natural language sentence. In other words, it answers your questions like a human.

For example, when it receives the question "What is my term fee balance?", it will give a response “You owe $3500.” The main objective is creating a Web based API, and sample web, mobile interfaces (through Slack and Facebook messengers) that demonstrate the use of the API. The goal is to provide Syracuse students a quick and easy way to have their questions answered.

# Product Perspective
Chatbot is a web-hosted application, developed based on the current bot technology. This application acts an intermediate media between users and databases. A user can interact with Chatbot via simple English sentences to request and update information from certain databases. These English sentences are analyzed by a Language Understanding Intelligent Service (LUIS) which is integrated with the Chatbot.
There will be four main units to the system working together to understand the question and return an appropriate answer:
Generic question construction - capable of taking a natural language question and making it more generic.
Generic answer construction - capable of taking a generic question template and providing a generic answer template.
Generic answer population - capable of taking a generic answer template and populating it with information from the database to form an answer.
Information extraction - capable of finding information available from the database.

# Product Functions
Syracuse Chatbot shall be able to query on:
•	Student profile information
•	Classes and schedules
•	Payment information

### Prerequisites

* Microsoft Azure Subscription
* Azure Bot service
* node.js

End with an example of getting some data out of the system or using it for a little demo

## Running the tests

You can interact with the bot at  [Web interface](https://webchat.botframework.com/embed/CuseBots?s=YnHKNEIX7K0.ND7kctEA0qrZoLX45aWZ_mwmCIen9co6-QmnhTpYALM) and ask questions like:
* Hello
* Show my complete profile
* Show my address
* update my email address
* How much I owe
* What are my course registrations
* What are the available courses?
* Enroll me for CSE682
* What is my exam schedule
* What is my class schedule

## Deployment

The application has a pipeline created with code base as Github. Once the code is committed to the Github master node, the code will be deployed automatically, using CI/CD.

## Built With

* [Luis](https://luis.ai) - The bot framework used

## Versioning

We use [Git](http://github.com/) for versioning.

## Authors

* **Bharath Karumudi** - *Initial work*
* **Haixin Chang** - *Initial work*

## License

This project is licensed under the MIT License.
