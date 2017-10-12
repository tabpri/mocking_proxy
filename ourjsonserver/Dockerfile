FROM node:6



#RUN apt-get update
#RUN apt-get -qq update
#RUN apt-get install -y nodejs npm
# TODO could uninstall some build dependencies

# fucking debian installs `node` as `nodejs`
#RUN update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10
RUN npm install -g json-server

# VOLUME ["/data"]

# ADD . /data
# RUN cd /data && npm install

EXPOSE 3000

# WORKDIR /data

# CMD ["npm", "start"]

COPY db/db.json /db/db.json
CMD ["/bin/sh","-c","json-server /db/db.json && /bin/bash"]
