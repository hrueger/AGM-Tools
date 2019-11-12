const fs = require('fs');

const files = {
    "src/environments/environment.ts": 'export const environment = {firebase: {apiKey: "",appId: "",authDomain: "",databaseURL: "",messagingSenderId: "",projectId: "",storageBucket: ""},production: false};',
    "src/environments/environment.prod.ts": 'export const environment = {firebase: {apiKey: "",appId: "",authDomain: "",databaseURL: "",messagingSenderId: "",projectId: "",storageBucket: ""},production: true};',
    "src/firebase-messaging-sw.js": 'importScripts("https://www.gstatic.com/firebasejs/6.5.0/firebase-app.js");importScripts("https://www.gstatic.com/firebasejs/6.5.0/firebase-messaging.js");firebase.initializeApp({"messagingSenderId": ""});const messaging = firebase.messaging();',
    "App_Resources/Android/google-services.json": '{"project_info":{"project_number":"","firebase_url":"","project_id":"","storage_bucket":""},"client":[{"client_info":{"mobilesdk_app_id":"","android_client_info":{"package_name":"de.multimediaag.agmtools"}},"oauth_client":[{"client_id":"","client_type":3}],"api_key":[{"current_key":""}],"services":{"appinvite_service":{"other_platform_oauth_client":[{"client_id":"","client_type":3}]}}}],"configuration_version":"1"}'
};
for (key in files) {
    if (!fs.existsSync(key)) {
        fs.writeFileSync(key, files[key]);
        console.info("File", key, "created, please insert your credentials there!");
    } else {
        console.info("File", key, "skipped, as it already exists!");
    }
}