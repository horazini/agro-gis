# Use Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the .js transpiled application code
COPY ./dist ./dist

# Expose the port the Express server runs on
EXPOSE 4000

# Command to run the server
CMD ["node", "dist/index.js"]