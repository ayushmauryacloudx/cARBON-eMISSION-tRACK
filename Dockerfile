FROM nginx:alpine

# Set default port to 8080
ENV PORT=8080

# Copy template configuration
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Copy the HTML file to the default Nginx html directory
COPY ecotrack-ai.html /usr/share/nginx/html/index.html

EXPOSE 8080
