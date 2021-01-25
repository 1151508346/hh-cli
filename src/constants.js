const { version } = require("../package.json");
const path = require("path")
let downloadDirectory = process.env[process.platform === "darwin" ? "HOME" : "USERPROFILE"]
downloadDirectory = path.resolve(downloadDirectory,".template")
module.exports = {
    version,
    downloadDirectory
}