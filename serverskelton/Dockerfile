From ubuntu:14.04

WORKDIR /opt/app

COPY ./main-linux-386 /opt/server_skelton
RUN chmod +x /opt/server_skelton

RUN mkdir -p /opt/bin && cp /opt/server_skelton /opt/bin/main

CMD /opt/bin/main
#CMD ["/opt/bin/main"]
