# Main ------------------------------------------------------------------------------------
    FROM node:20-alpine AS main-target

    # Build arg for MongoDB URI
    ARG MONGODB_URI
    ENV MONGODB_URI=${MONGODB_URI}
    
    ENV NODE_ENV=development
    ENV PATH=$PATH:/usr/src/app/node_modules/.bin
    
    WORKDIR /usr/src/app
    
    COPY package*.json ./
    RUN npm install
    COPY . .
    
    # Build ------------------------------------------------------------------------------------
    FROM main-target AS build-target
    
    ARG MONGODB_URI
    ENV MONGODB_URI=${MONGODB_URI}
    ENV NODE_ENV=production
    
    WORKDIR /usr/src/app
    
    # Create .env.local so Next.js build sees MONGODB_URI
    RUN echo "MONGODB_URI=${MONGODB_URI}" > .env.local
    
    RUN npm run build
    
    # Production ------------------------------------------------------------------------------------
    FROM node:20-alpine AS production-target
    
    ARG MONGODB_URI
    ENV MONGODB_URI=${MONGODB_URI}
    
    ENV NODE_ENV=production
    ENV PATH=$PATH:/usr/src/app/node_modules/.bin
    
    WORKDIR /usr/src/app
    
    COPY --from=build-target /usr/src/app/package.json package.json
    COPY --from=build-target /usr/src/app/node_modules node_modules
    COPY --from=build-target /usr/src/app/.next .next
    COPY --from=build-target /usr/src/app/public public
    COPY --from=build-target /usr/src/app/scripts scripts
    COPY --from=build-target /usr/src/app/next.config.js next.config.js
    
    CMD npm run seed:languages && npm run seed:page-seo && npm run seed:faqs && npm start
    