# Use an official Node.js runtime as a parent image
FROM node:18-alpine as react

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .
RUN npm run build

# Nginx
FROM nginx:1.21-alpine
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=react /usr/src/app/build /usr/share/nginx/html

# Expose the port the app runs on
EXPOSE 3000
