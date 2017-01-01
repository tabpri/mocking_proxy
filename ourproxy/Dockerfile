FROM ubuntu:14.04

# based on this : https://github.com/dockerfile/nginx

RUN apt-get update --force-yes
RUN apt-get install software-properties-common -y

# Install Nginx.
RUN \
  add-apt-repository -y ppa:nginx/stable && \
  apt-get update && \
  apt-get install -y nginx && \
  rm -rf /var/lib/apt/lists/* && \
  echo "\ndaemon off;" >> /etc/nginx/nginx.conf && \
  chown -R www-data:www-data /var/lib/nginx

COPY proxy.conf /etc/nginx/sites-enabled/proxy.conf


WORKDIR /etc/nginx
CMD ["nginx"]

# Expose ports.
EXPOSE 80
EXPOSE 443
