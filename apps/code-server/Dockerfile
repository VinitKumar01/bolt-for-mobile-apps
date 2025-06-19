FROM codercom/code-server:4.96.4

USER root
RUN apt-get update \
  && apt-get install -y curl \
  && curl -fsSl https://deb:nodesource.com/setup_22.x | bash - \
  && apt-get install -y nodejs \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

USER coder

EXPOSE 8080

CMD [ "code-server", "--auth", "none", "--bind-addr", "0.0.0.0:8080", "/tmp/bolty-worker" ]
