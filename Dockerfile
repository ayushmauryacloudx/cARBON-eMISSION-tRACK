FROM nginx:alpine

# Set default port to 8080
ENV PORT=8080

# Copy template configuration
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Copy the HTML and JS files to the default Nginx html directory
COPY ecotrack-ai.html /usr/share/nginx/html/index.html
COPY calculator-logic.js /usr/share/nginx/html/calculator-logic.js

EXPOSE 8080
