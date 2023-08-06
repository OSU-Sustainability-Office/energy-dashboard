<img src='https://dashboard.sustainability.oregonstate.edu/images/readme_logo.png' height=80 />

# OSU Energy Dashboard

![Frontend Status](https://github.com/OSU-Sustainability-Office/energy-dashboard/actions/workflows/gh-deploy.yml/badge.svg)![API Status](https://github.com/OSU-Sustainability-Office/energy-dashboard/actions/workflows/API-deploy.yml/badge.svg) ![Test Build Status](https://github.com/OSU-Sustainability-Office/energy-dashboard/actions/workflows/test-build-s3.yml/badge.svg)

This Energy Dashboard has been developed by the Oregon State University Sustainability Office to enable members of the OSU community to access, view, and analyze energy consumption trends. The production build of this application can be found at [https://dashboard.sustainability.oregonstate.edu](https://dashboard.sustainability.oregonstate.edu). A test build is hosted on an AWS S3 bucket [here](http://energy-dashboard.s3-website-us-west-2.amazonaws.com).

### Contributors "Hall of Fame"

- [Brogan Miner](https://github.com/broha22)
- [Jack Woods](https://github.com/jackrwoods)

### Testing Locally

We recommend setting up `nvm` to set your node installation to version 16 (`nvm use 16`).

Running `npm run serve` will run the front-end locally.

To run the serverless backend API locally you'll want to run `sam local start-api` (docker will need to be running first).

### Documentation

For more detailed information about how the dashboard front-end works internally, there's a README.md with the vue components described under the `documents/frontend` directory.
