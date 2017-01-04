FROM registry.local:5050/ourproxy:latest

COPY proxy.conf /etc/nginx/conf.d/proxy.conf

WORKDIR /etc/nginx
CMD ["supervisord", "-n"]

# Expose ports.
EXPOSE 8080
EXPOSE 443
