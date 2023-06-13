FROM node:18-alpine

ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY

EXPOSE 3000
WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

# You'll probably want to remove this in production, it's here to make it easier to test things!
RUN rm prisma/dev.sqlite
RUN npx prisma migrate dev --name init

CMD ["npm", "run", "start"]
