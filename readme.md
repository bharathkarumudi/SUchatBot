# Syracuse Chatbot - A Bot for Syracuse University Students

![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)

Syracuse Chatbot is an AI Chatbot that receives questions from users, tries to understand the question, and provides appropriate answers. The application does this by converting an English sentence into a machine-friendly query, then going through relevant data to find the necessary information, and finally returning the answer in a natural language sentence. In other words, it answers your questions like a human.

For example, when it receives the question "How much I owe?", it will give a response “You owe $1500 to the University at this time.” The main objective is creating a Web based and mobile interfaces (through Slack and Facebook messengers) that demonstrate the use of the application. The goal is to provide Syracuse students a quick and easy way to have their questions answered.

# Product Perspective
Chatbot is a web-hosted application, developed based on the current bot technology. This application acts an intermediate media between users and databases. A user can interact with Chatbot via simple English sentences to request and update information from certain databases. These English sentences are analyzed by a Language Understanding Intelligent Service (LUIS) which is integrated with the Chatbot.
There will be four main units to the system working together to understand the question and return an appropriate answer:
* Generic question construction - capable of taking a natural language question and making it more generic.
* Generic answer construction - capable of taking a generic question template and providing a generic answer template.
* Generic answer population - capable of taking a generic answer template and populating it with information from the database to form an answer.
* Information extraction - capable of finding information available from the database.

# Product Functions
Syracuse Chatbot shall be able to query on:
*	Student profile information
*	Classes and schedules
*	Payment information

### Prerequisites

* Microsoft Azure Subscription
* Azure Bot service
* LUIS
* MS SQL Database
* node.js

## Running the tests

You can interact with the bot at  [Web interface](https://webchat.botframework.com/embed/CuseBots?s=YnHKNEIX7K0.ND7kctEA0qrZoLX45aWZ_mwmCIen9co6-QmnhTpYALM) and ask questions like:
* Hello
* Show my profile
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

* [Microsoft Luis](https://luis.ai) - The bot framework.

## Versioning

* Used [Git](http://github.com/) for versioning.

## Authors

* **Bharath Karumudi** - *Initial work*
* **Haixin Chang** - *Initial work*

## Future Release and System Evolution

*	Scheduling the appointments with Professors and Student Advisors.
*	Submitting the assignments through bots.
*	Integrating Orange Alert system to alert Syracuse Students and Staff.
*	Paying the term fee and other balances.
*	Booking the conference rooms.
*	Displaying the grades and GPAs.
*	Sending the notifications like grade availability, course access.
*	Submitting the course surveys.
*	Shopping the text books from University library.
*	Placing an order in University Cafeteria for a coffee or any other food.
*	Providing general information like Address and other knowledge base information using QnA maker.
*	Integrating with University services over APIs.
*	Integrating with Voice Assistants like Alexa, Cortana, Siri and Google Home.

# Documentation

* System Requirement Specification Document is available under Documentation directory.

## License

This project is licensed under the MIT License.
