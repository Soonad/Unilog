# Unilog
Simple event log server

### How to run project
#### Using NPM
  1. Make sure you have [Node.js and NPM](https://www.npmjs.com/get-npm) installed.
  2. Run `npm install` to install dependencies
  3. Run `npm start` or `node src/server.js` to start Unilog server
  4. Check if Unilog server is running by navigating to `http://localhost:3000/docs` in your browser

#### Using Docker
  1. Make sure you have [Docker installed](https://docs.docker.com/install/)
  2. If you want to use default docker options, run `npm run docker` and jump to step `6`. Otherwise, continue to the next step.
  3. Build a Docker image with `docker build -t <your-name>/unilog .`
  4. Check if the new image is now listed on docker with `docker images`
  5. Run Docker image with `docker run -p 3001:3000 -d <your-name>/unilog`
    - The `-p` flag maps a local port to an image internal port. In this case, we are mapping local port 8080 to image port 3000
    - The `-d` tells docker to run our image in the background
  6. Check if Unilog server is running by navigating to `http://localhost:3000/docs` in your browser
