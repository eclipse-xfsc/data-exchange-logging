FROM node:16-alpine as development
WORKDIR /del_local
COPY --chown=node:node ["package.json", "package-lock.json", "./"]
RUN npm config set @gaia-x:registry https://gitlab.com/api/v4/projects/38989724/packages/npm/
RUN npm i -g @nrwl/cli
RUN npm ci --legacy-peer-deps
COPY --chown=node:node . .
USER node

FROM node:16-alpine as build
WORKDIR /del_local
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=development /del_local/node_modules ./node_modules
COPY --chown=node:node . .
RUN npm run build
ENV NODE_ENV=production
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force
USER node

FROM node:16-alpine as production
COPY --chown=node:node --from=build /del_local/node_modules ./node_modules
COPY --chown=node:node --from=build /del_local/dist ./dist
EXPOSE 3000

CMD [ "node", "dist/apps/api/main.js" ]
