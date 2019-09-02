FROM alpine:3.9.4
LABEL maintainer = H. Rüger


# Add basics first
RUN apk update && apk upgrade && apk add \
	bash apache2 php7-apache2 curl ca-certificates openssl php7 php7-json php7-iconv


# Setup apache and php
RUN apk add \
	php7-mbstring \
	php7-zip \
	php7-mysqli \
	php7-gd \
	php7-curl \
	php7-ctype \
	php7-session \
	php7-intl \
	php7-fileinfo

RUN cp /usr/bin/php7 /usr/bin/php \
    && rm -f /var/cache/apk/*

COPY httpd.conf /etc/apache2/httpd.conf

RUN mkdir /agmtools-bin && chown -R apache:apache /agmtools-bin && chmod -R 755 /agmtools-bin && mkdir bootstrap
COPY dist/ /agmtools-bin/
RUN mkdir /userdata
ADD start.sh /bootstrap/
RUN chmod +x /bootstrap/start.sh

EXPOSE 80
ENTRYPOINT ["/bootstrap/start.sh"]