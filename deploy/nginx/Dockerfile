# Use an official Nginx runtime as a parent image 
FROM nginx:1.21-alpine

# Copy configuration file to Nginx's configuration directory 
COPY ./nginx.conf /etc/nginx/conf.d/default.conf   
# COPY ./nginx.conf /etc/nginx/nginx.conf           

# exposes port 80, to receive all requests made to docker compose's internal network
EXPOSE 80

# Starts Nginx in the foreground when the container runs
#CMD ["nginx", "-g", "daemon off;"]
