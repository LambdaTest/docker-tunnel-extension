FROM golang:1.19-alpine AS builder
ENV CGO_ENABLED=0
WORKDIR /backend
COPY vm/go.* .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download
COPY vm/. .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build -trimpath -ldflags="-s -w" -o bin/service



FROM --platform=$BUILDPLATFORM node:18.9-alpine3.15 AS client-builder
WORKDIR /ui
# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
# install
COPY ui /ui
RUN npm run build

FROM alpine
LABEL org.opencontainers.image.title="LambdaTest Tunnel" \
    org.opencontainers.image.description="LambdaTest Tunnel Docker Extension helps to establish a secure connection for testing locally hosted pages & applications on LambdaTest" \
    org.opencontainers.image.vendor="LambdaTest" \
    com.docker.desktop.extension.icon=https://app.lambdatest.com/assets/images/ltLogo.svg \
    com.docker.desktop.extension.api.version="0.3.0" \
    com.docker.extension.screenshots="" \
    com.docker.extension.detailed-description="" \
    com.docker.extension.publisher-url="https://www.lambdatest.com" \
    com.docker.extension.additional-urls="" \
    com.docker.extension.changelog=""

COPY --from=builder /backend/bin/service /
COPY docker-compose.yaml .
COPY metadata.json .
COPY docker.svg .
COPY --from=client-builder /ui/build ui
CMD /service -socket /run/guest-services/extension-tunnel-extension.sock

RUN wget https://downloads.lambdatest.com/tunnel/v3/linux/64bit/LT_Linux.zip && \ 
    unzip LT_Linux.zip && \
    rm LT_Linux.zip && \
    chmod +x /LT
 
ENTRYPOINT [ "/LT" ]
