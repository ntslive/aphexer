FROM node:7.6.0
EXPOSE 3001

ENV OPENCV_VERSION 2.4.13.2

COPY afx_build.sh /

RUN bash /afx_build.sh \
	&& rm /afx_build.sh

ENV LD_LIBRARY_PATH /usr/local/lib

WORKDIR /app

COPY package.json package.json

RUN npm install --only=production
RUN npm install -g pm2

COPY app ./

CMD pm2-docker index.js
