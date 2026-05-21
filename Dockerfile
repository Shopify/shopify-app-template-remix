FROM node:22.14.0-alpine

RUN apk -U add --no-cache curl gcc g++ make ruby-full ruby-dev libffi-dev xdg-utils python3 py3-pip

WORKDIR /app

COPY . .

RUN npm install
