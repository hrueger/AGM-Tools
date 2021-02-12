cd ../AGM-Tools
npm install
npm run build:web -- --outputPath=../docker/frontend
cd ../api
npm install
tsc
cp ./build ../docker/backend/build
cp ./assets ../docker/backend/assets
cp ./node_modules ../docker/backend/node_modules
cd ..
cp ./container-env.json ./docker/container-env.json
cd ./docker
PACKAGE_VERSION=$(cat ../api/package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')
docker build -t hrueger/agm-tools:v$PACKAGE_VERSION .
rm -r frontend backend