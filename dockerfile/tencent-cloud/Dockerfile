FROM alpine
RUN echo "https://mirrors.aliyun.com/alpine/edge/testing/" >> /etc/apk/repositories \
    && apk -U --no-cache update && apk -U --no-cache --allow-untrusted add \
    nss \
    ca-certificates \
    wqy-zenhei \
    freetype \
    harfbuzz \
    ttf-freefont \
    nodejs \
    npm \
    chromium

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser



# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
COPY . /home/
RUN cd home; npm run build-cloud
CMD cd home; node cloud/server.js
