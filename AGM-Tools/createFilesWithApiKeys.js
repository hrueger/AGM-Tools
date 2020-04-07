const fs = require("fs");

const files = {
    "src/environments/environment.ts": "/* eslint-disable */\nexport const environment = {apiUrl: \"\", defaultLanguage: \"\", documentServerUrl: \"\", appUrl: \"\", firebase: {apiKey: \"\",appId: \"\",authDomain: \"\",databaseURL: \"\",messagingSenderId: \"\",projectId: \"\",storageBucket: \"\"},production: false};",
    "src/environments/environment.prod.ts": "/* eslint-disable */\nexport const environment = {apiUrl: \"\", defaultLanguage: \"\", documentServerUrl: \"\", appUrl: \"\", firebase: {apiKey: \"\",appId: \"\",authDomain: \"\",databaseURL: \"\",messagingSenderId: \"\",projectId: \"\",storageBucket: \"\"},production: true};",
    "src/firebase-messaging-sw.js": "importScripts(\"https://www.gstatic.com/firebasejs/7.13.2/firebase-app.js\");importScripts('https://www.gstatic.com/firebasejs/7.6.0/firebase-messaging.js');firebase.initializeApp({\"messagingSenderId\": \"\"});const messaging = firebase.messaging();",
    "App_Resources/Android/google-services.json": "{\"project_info\":{\"project_number\":\"\",\"firebase_url\":\"\",\"project_id\":\"\",\"storage_bucket\":\"\"},\"client\":[{\"client_info\":{\"mobilesdk_app_id\":\"\",\"android_client_info\":{\"package_name\":\"de.multimediaag.agmtools\"}},\"oauth_client\":[{\"client_id\":\"\",\"client_type\":3}],\"api_key\":[{\"current_key\":\"\"}],\"services\":{\"appinvite_service\":{\"other_platform_oauth_client\":[{\"client_id\":\"\",\"client_type\":3}]}}}],\"configuration_version\":\"1\"}",
};
const args = process.argv.slice(2);
let counter = 0;
// eslint-disable-next-line guard-for-in
for (const key in files) {
    if (!fs.existsSync(key)) {
        let value = files[key];
        if (args[counter]) {
            value = Buffer.from(args[counter], "base64").toString("ascii");
        }
        fs.writeFileSync(key, value);
        // eslint-disable-next-line no-console
        console.info("File", key, "created, please insert your credentials there!");
    } else {
        // eslint-disable-next-line no-console
        console.info("File", key, "skipped, as it already exists!");
    }
    counter += 1;
}
