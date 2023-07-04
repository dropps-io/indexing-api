# DROPPS indexing API

[![Twitter URL](https://img.shields.io/twitter/url/https/twitter.com/dropps_io.svg?style=social&label=Follow%20%40dropps_io)](https://twitter.com/dropps_io)
[![Discord](https://user-images.githubusercontent.com/7288322/34471967-1df7808a-efbb-11e7-9088-ed0b04151291.png)](https://discord.gg/paCyd4W9)


This repository contains the indexing API developed by [DROPPS](https://dropps.io/) for the [LUKSO](https://lukso.network/) network.

Mainnet API: https://indexing.mainnet.dropps.io/graphql
<br>Testnet API: https://indexing.testnet.dropps.io/graphql

## Databases

The project needs 2 PG databases to work and 1 for testing:

- `indexing-lukso-data`, used to store all the data extracted from the LUKSO network.
- `indexing-lukso-structure`, used to store all the data related to the structure of the LUKSO network. This allows the app to know how to read data from the network.

You can then update the connection strings accordingly.

#### Lukso structure database

![lukso-indexing-structure.png](docs%2Fdiagrams%2Fdatabase%2Flukso-indexing-structure.png)

#### Lukso data database

![lukso-indexing-data.png](docs%2Fdiagrams%2Fdatabase%2Flukso-indexing-data.png)

## Development

### Run tests

- `yarn install`
- Create two postgres databases dedicated to the tests (should be different as the dev ones) and obtain connection strings
- `cp .env.example .env.test` and fill the file
- Run the tests: `yarn test`

### Start the project

- `yarn install`
- Create two postgres databases and obtain connection strings
- `cp .env.example .env` and fill the file
- Initialize the databases: `yarn seed:all`
- Run the indexing: `yarn start`