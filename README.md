# Project Title

Zia to fill in.

## Project Description

The API server for Agricultural Evidence application

[![Build Status](https://travis-ci.com/AgriculturalEvidence/mical_server.svg?branch=master)](https://travis-ci.com/AgriculturalEvidence/mical_server)
[![Coverage Status](https://coveralls.io/repos/github/AgriculturalEvidence/mical_server/badge.svg?branch=master)](https://coveralls.io/github/AgriculturalEvidence/mical_server?branch=master)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

### Installing

A step by step series of examples that tell you how to get a development env running

Install all project dependencies using npm.

```
npm install 
```
To run project locally use the command

```
npm run start
```
The app will run locally on the url http://localhost:8888

To update new application data onto database. (Right now the parser supports intervention data and yields data)

Ensure you have [MongoImport](https://docs.mongodb.com/database-tools/installation/installation/) CLI installed as this application uses it to push datasets into mongoDB database.

1. Replace the csv dataset with the new dataset. (Make sure the dataset you are replacing has the same name eg. 'intervention.csv')

2. Run 

```
npm run parse
```

3. Check Mongodb account on mongodb.com to check that the data was uploaded properly. (Ask Project head for account credentials).

This runs a script that uploads the csv file to the referenced mongo database. (Note for interventions.csv it is first converted into json before uploading to db due to previous design decisions)

Installing Docker

Install [Docker Desktop](https://www.docker.com/products/docker-desktop) for your Operating System (Mac, PC, Linux)

Installing Heroku CLI 

Follow Heroku CLI installation through this [tutorial](https://devcenter.heroku.com/articles/heroku-cli)

## Running the tests

The Project contains Unit tests using [Karma](https://karma-runner.github.io), and E2E tests using [Protractor](http://www.protractortest.org/).

### Run Test Suite

```
Run npm run test
```

## Deployment

Deployment of both client and server applications are done as a single docker container instance which is hosted via Heroku. The steps to deployment are outlined below.

1. Make sure you have Heroku CLI & Docker installed (follow Installing Section).

2. Login into Heroku CLI with ``` heroku container:login```

3. Run ``` npm run deploy-client ``` and ```npm run deploy-server``` to create local docker images of the client and server applications and push images into heroku docker registry as containers and release them into heroku hosting. Its possible this may not update due to something like 'The process type web was not updated, because it is already running the specified docker image.' 
If this happens delete the existing local docker images with ```docker system prune``` and rerun steps 3 and 4 again. 

4. If server instance gives an error of H14: No web dynos running, Run ```heroku ps:scale web=1 <server-url>```.  

5. Check heroku account to see if they have been deployed properly (Ask project head for account credentials). Current url is https://agevc.herokuapp.com/

## Built With

* [NodeJs](http://nodejs.org) >= 6.x 
* [mongodb](http://mongodb.org)
* [Heroku](https://www.heroku.com)
* [Docker](https://www.docker.com)

## Contributors

* **Jaehun Song** 
* **Victor Pineda Gonzalez** 
