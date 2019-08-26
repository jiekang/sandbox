FROM registry.access.redhat.com/ubi7/ubi-minimal:latest

ENV OPERATOR=/usr/local/bin/jfr-web-operator \
    USER_UID=1001 \
    USER_NAME=jfr-web-operator

# install operator binary
COPY build/_output/bin/jfr-web-operator ${OPERATOR}

COPY build/bin /usr/local/bin
RUN  /usr/local/bin/user_setup

ENTRYPOINT ["/usr/local/bin/entrypoint"]

USER ${USER_UID}
