FROM node:14-slim
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 9500
CMD ["npm", "run", "dev"]