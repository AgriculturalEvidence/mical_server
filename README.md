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

1. Replace the csv dataset with the new dataset. (Make sure the dataset you are replacing has the same name eg. 'intervention.csv')

2. Run 

```
npm run parse
```

This runs a script that uploads the csv file to the referenced mongo database. (Note for interventions.csv it is first converted into json before uploading to db due to previous design decisions)

## Running the tests

The Project contains Unit tests using [Karma](https://karma-runner.github.io), and E2E tests using [Protractor](http://www.protractortest.org/).

### Run Test Suite

```
Run npm run test
```

## Deployment

TODO: Copy over Deploy instructions from the document. 

docker stack deploy -c .\stack.yml mongo

## Built With

* [NodeJs](http://nodejs.org) >= 6.x 
* [mongodb](http://mongodb.org)

## Contributors

* **Jaehun Song** 
* **Victor Pineda Gonzalez** 
