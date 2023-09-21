FROM node:18-alpine

EXPOSE 3000
WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

# You'll probably want to remove this in production, it's here to make it easier to test things!
RUN rm -f prisma/dev.sqlite

CMD ["npm", "run", "docker-start"]
