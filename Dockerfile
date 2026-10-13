FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy web files
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY media/ /usr/share/nginx/html/media/
COPY assets/ /usr/share/nginx/html/assets/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
