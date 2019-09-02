FROM alpine:3.9.4
LABEL maintainer = H. Rüger

##  install all packages ##
ADD https://dl.bintray.com/php-alpine/key/php-alpine.rsa.pub /etc/apk/keys/php-alpine.rsa.pub
RUN apk --update add ca-certificates
RUN echo "https://dl.bintray.com/php-alpine/v3.9/php-7.3" >> /etc/apk/repositories
RUN apk update && apk upgrade && apk add \
	bash apache2 php-apache2 curl ca-certificates openssl php
RUN apk add \
	php-json \
	php-iconv \
	php-mbstring \
	php-zip \
	php-mysqli \
	php-gd \
	php-curl \
	php-ctype \
	php-session \
	php-intl \
	php-fileinfo

## cleanup ##
RUN rm -f /var/cache/apk/*

## copy config ##
COPY httpd.conf /etc/apache2/httpd.conf

## create folders for app ##
RUN mkdir /agmtools-bin && mkdir /agmtools-bin/api && mkdir /agmtools-bin/share && chown -R apache:apache /agmtools-bin && chmod -R 755 /agmtools-bin && mkdir bootstrap
COPY ../AGM-Tools/dist/agmtools/ /agmtools-bin/
COPY ../api/ /agmtools-bin/api/
COPY ../share/ /agmtools-bin/share/

## Add cron ##
RUN (crontab -l ; echo "* * * * * php /agmtools-bin/api/cron.php") 2>&1 | sed "s/no crontab for $(whoami)//"  | sort | uniq | crontab -

## create userdata dir ##
RUN mkdir /userdata

## copy start script ##
ADD start.sh /bootstrap/
RUN chmod +x /bootstrap/start.sh

## configure ##
EXPOSE 80
ENTRYPOINT ["/bootstrap/start.sh"]