FROM alpine:3.9.4
LABEL maintainer = H. Rüger


# Add basics first
RUN apk update && apk upgrade && apk add \
	bash apache2 php7-apache2 curl ca-certificates openssl php7 php7-phar php7-json php7-iconv php7-openssl


# Setup apache and php
RUN apk add \
	php7-ftp \
	php7-xdebug \
	php7-mcrypt \
	php7-mbstring \
	php7-soap \
	php7-gmp \
	php7-pdo_odbc \
	php7-dom \
	php7-pdo \
	php7-zip \
	php7-mysqli \
	php7-sqlite3 \
	php7-pdo_pgsql \
	php7-bcmath \
	php7-gd \
	php7-odbc \
	php7-pdo_mysql \
	php7-pdo_sqlite \
	php7-gettext \
	php7-xml \
	php7-xmlreader \
	php7-xmlwriter \
	php7-tokenizer \
	php7-xmlrpc \
	php7-bz2 \
	php7-pdo_dblib \
	php7-curl \
	php7-ctype \
	php7-session \
	php7-redis \
	php7-exif \
	php7-intl \
	php7-fileinfo \
	php7-ldap \
	php7-apcu

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