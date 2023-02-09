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
    com.docker.desktop.extension.icon=https://www.lambdatest.com/resources/images/docker_extension/docker.svg \
    com.docker.desktop.extension.api.version="0.3.0" \
    com.docker.extension.categories="testing-tools,cloud-development" \
    com.docker.extension.screenshots="[ \
        {\"alt\": \"Landing page\", \"url\": \"https://www.lambdatest.com/resources/images/docker_extension/Screenshot-1.png\"}, \
        {\"alt\": \"Form page\", \"url\": \"https://www.lambdatest.com/resources/images/docker_extension/Screenshot-2.png\"}, \
        {\"alt\": \"Tunnel logs\", \"url\": \"https://www.lambdatest.com/resources/images/docker_extension/Screenshot-3.png\"} \
    ]" \
    com.docker.extension.detailed-description="LambdaTest Tunnel Docker Extension will automatically execute the tunnel binary to establish a secure connection for testing locally hosted pages on LambdaTest. \
        <h2 id="-features">✨ What can you do with this extension?</h2> \
        <ul> \
            <li>Configure a new tunnel without the need to launch using CLI.</li> \
            <li>View logs of existing running tunnels.</li> \
            <li>Stop any active running tunnel.</li> \
        </ul> \
    " \
    com.docker.extension.publisher-url="https://www.lambdatest.com" \
    com.docker.extension.changelog="<ul>\
        <li>First version release.</li> \
    </ul>" \
    com.docker.extension.additional-urls="[ \
        {\"title\":\"Support\", \"url\":\"https://www.lambdatest.com/contact-us\"} \
    ]" 

COPY metadata.json .
COPY docker.svg .
COPY --from=client-builder /ui/build ui
