#!/bin/sh

if [ "$CONTAINER_TIMEZONE" ]; then
    cp /usr/share/zoneinfo/${CONTAINER_TIMEZONE} /etc/localtime && \
	echo "${CONTAINER_TIMEZONE}" >  /etc/timezone && \
	echo "Container timezone set to: $CONTAINER_TIMEZONE"
fi
ntpd

# Apache server name change
if [ ! -z "$APACHE_SERVER_NAME" ]
	then
		sed -i "s/#ServerName www.example.com:80/ServerName $APACHE_SERVER_NAME/" /etc/apache2/httpd.conf
		echo "Changed server name to '$APACHE_SERVER_NAME'..."
	else
		echo "NOTICE: Change 'ServerName' globally and hide server message by setting environment variable >> 'APACHE_SERVER_NAME=your.server.name' in docker command or docker-compose file"
fi


sed -i "s/\;\?\\s\?upload_max_filesize = .*/upload_max_filesize = 20G/" /etc/php7/php.ini && echo "Set PHP upload_max_filesize = 20G..."
sed -i "s/\;\?\\s\?post_max_size = .*/post_max_size = 20G/" /etc/php7/php.ini && echo "Set PHP post_max_size = 20G..."
sed -i "s/\;\?\\s\?max_input_time = .*/max_input_time = 300/" /etc/php7/php.ini && echo "Set PHP max_input_time = 300..."
sed -i "s/\;\?\\s\?max_execution_time = .*/max_execution_time = 300/" /etc/php7/php.ini && echo "Set PHP max_execution_time = 300..."


echo "Clearing any old processes..."
rm -f /run/apache2/apache2.pid
rm -f /run/apache2/httpd.pid

echo "Starting apache..."
httpd -D FOREGROUND