PACKAGE_VERSION=$(cat ../api/package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')
docker push hrueger/agm-tools:v$PACKAGE_VERSION