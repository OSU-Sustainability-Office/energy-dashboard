<img src='https://dashboard.sustainability.oregonstate.edu/images/readme_logo.png' height=80 />

# OSU Energy Dashboard

![Frontend Status](https://github.com/OSU-Sustainability-Office/energy-dashboard/actions/workflows/gh-deploy.yml/badge.svg)![API Status](https://github.com/OSU-Sustainability-Office/energy-dashboard/actions/workflows/API-deploy.yml/badge.svg) ![Test Build Status](https://github.com/OSU-Sustainability-Office/energy-dashboard/actions/workflows/test-build-s3.yml/badge.svg)

This Energy Dashboard has been developed by the Oregon State University Sustainability Office to enable members of the OSU community to access, view, and analyze energy consumption trends. The production build of this application can be found at [https://dashboard.sustainability.oregonstate.edu](https://dashboard.sustainability.oregonstate.edu). A test build is hosted on an AWS S3 bucket [here](http://energy-dashboard.s3-website-us-west-2.amazonaws.com).

### Contributors "Hall of Fame"

- [Brogan Miner](https://github.com/broha22)
- [Jack Woods](https://github.com/jackrwoods)

### Testing Locally

We recommend setting up `nvm` to set your node installation to version 18 (`nvm use 18`).

Running `npm run serve` will run the front-end locally.

To run the serverless backend API locally you'll want to run `sam local start-api` (docker will need to be running first).

To backend Jest tests locally:

- Make sure that Docker is running
- In `/backend` directory, run command `npm run test-local`
- Troubleshooting:
  - On Windows you might encounter the error `/usr/bin/env: 'bash\r': No such file or directory`, you will need to change the file `wait-for-it.sh` to have LF line endings instead of CRLF to fix this

### Formatting

Run both in order

- `npm run prettier`
- `npm run lint --fix`

### Documentation

For more detailed information about how the dashboard front-end works internally, there's a README.md with the vue components described under the `documents/frontend` directory.
