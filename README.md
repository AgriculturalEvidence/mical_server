# AEvidence API Server
[![Build Status](https://travis-ci.com/AgriculturalEvidence/mical_server.svg?branch=master)](https://travis-ci.com/AgriculturalEvidence/mical_server)
[![Coverage Status](https://coveralls.io/repos/github/AgriculturalEvidence/mical_server/badge.svg?branch=master)](https://coveralls.io/github/AgriculturalEvidence/mical_server?branch=master)

The API server for Agricultural Evidence application

## Requirements

* [NodeJs](http://nodejs.org) >= 6.x 
* [mongodb](http://mongodb.org)

## Getting Started
#### Install dependencies
npm install

#### Run tests
npm run test

#### Start the server
npm run start


### Docker instructions
docker stack deploy -c .\stack.yml mongo
