const c = require("child_process");
const request = require('request');
let d = new Date();
console.log("\x1b[34mReading packages...\x1b[0m");
console.log("\x1b[34mThis can take a while!\x1b[0m");
c.exec("npx npm-license-crawler --start ../../../ --json ./licenses.json.tmp", async () => {
    console.log(`\x1b[32mReading packages data finished in ${(new Date() - d) / 1000} seconds!\x1b[0m`);
    d = new Date();
    console.log("\x1b[34mCreating HTML file...\x1b[0m");
    var fs = require('fs');
    var path = require('path');
    var fileName = path.join(__dirname, '../../assets/3rdpartylicenses.html');
    var stream = fs.createWriteStream(fileName);
    stream.once('open', async function(fd) {
        var html = await buildHtml("./licenses.json.tmp", fs);
        stream.end(html);
        console.log(`\x1b[32mFinished in ${(new Date() - d) / 1000} seconds!\x1b[0m`);
    });
});

async function buildHtml(fileName, fs) {
    const licenses = JSON.parse(fs.readFileSync(fileName).toString());
    const length = Object.keys(licenses).length;
    console.log(`\x1b[34m${length} packages found!\x1b[0m`);
    let c = 0;
    let knownPackageCount = 0;
    const knownPackages = [];
    let html = "<!DOCTYPE html><html><head><title>AGM-Tools 3rd party licenses</title></head><body><h1>AGM-Tools 3rd party licenses</h1>";
    for (const l in licenses) {
        const packageName = l.split("@")[0];
        if (!knownPackages.includes(packageName)) {
            knownPackages.push(packageName);
            const package = licenses[l];
            if (package.licenseUrl && package.licenseUrl != package.repository) {
                try {
                    const licenseText = await getHttpSync(package.licenseUrl);
                    html += `<h3 style='padding-top: 3em;'>${packageName} <small>(${package.licenses})</small></h3>`;
                    html += `<pre>${licenseText}</pre>`;
                } catch {
                    
                }
            } else if (package.licenses) {
                html += `<h3 style='padding-top: 3em;'>${packageName} <small>(${package.licenses})</small></h3>`;
                html += `<pre>${package.licenses}</pre>`;
            } else {
                console.log();
                console.log();
                console.log(package);
                console.log();
                console.log();
            }
        } else {
            knownPackageCount++;
        }
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write("\x1b[34m" + c + " of " + length + " packages processed, " + knownPackageCount + " packages were skipped\x1b[0m");
        c++;
    }
    console.log();
    html += "</body></html>";
    return html;
}

function getHttpSync(url) {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (error) reject(error);
            if (response.statusCode != 200) {
                reject('Invalid status code <' + response.statusCode + '>');
            }
            if (!response.headers['content-type'].startsWith("text/plain")) {
                reject();
            }
            resolve(body);
        });
    });
}