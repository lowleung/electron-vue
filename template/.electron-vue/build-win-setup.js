var innosetupCompiler = require('innosetup-compiler')
var path = require('path')
var fs = require('fs')
var iconv = require('iconv-lite')

var rootPath = path.resolve(__dirname, '../')

function resolve() {
  return path.resolve.apply(path, [__dirname, '..'].concat(...arguments))
}
// `./package.json`
var tmpJson = require(path.resolve(rootPath, './package.json'))


var setupOptions = {
  issPath: resolve('./.electron-vue/setup_resources/setup.iss'),
  files: [resolve('./build/win-unpacked/')],
  resourcesPath: resolve('./.electron-vue/setup_resources'),
  iconPath: resolve('./.electron-vue/icons/icon.ico'),
  appPublisher: '梁乐',
  appURL: 'https://zzdmt.cn',
  setupID: '{{840AE126-934D-4BBE-8E8F-9E984A68B6F8}}',
  outputPath: resolve("./build"),
  outputFileName: function () {
    return tmpJson.description + '-' + tmpJson.version
  }
}

function buildWinSetup() {
  const res = []

  const options = Object.assign({}, setupOptions, {
    files: setupOptions.files,
  })

  res.push(makeExeSetup(options))
  return Promise.all(res)
}

function makeExeSetup(opt) {
  const {
    issPath,
    files,
    iconPath,
    outputPath,
    outputFileName,
    resourcesPath,
    appPublisher,
    appURL,
    setupID
  } = opt
  const {
    name,
    description,
    version
  } = tmpJson
  const tmpIssPath = resolve("./build", '_tmp_' + '.iss')

  return new Promise(function (resolve, reject) {
    // rewrite name, version to iss
    fs.readFile(issPath, null, function (err, text) {
      if (err) return reject(err)

      let str = iconv.decode(text, 'gbk')
        .replace(/_name_/g, name)
        .replace(/_appName_/g, description)
        .replace(/_version_/g, version)
        .replace(/_outputPath_/g, outputPath)
        .replace(/_icon_/g, iconPath)
        .replace(/_outputFileName_/g, outputFileName)
        .replace(/_filesPath_/g, files)
        .replace(/_resourcesPath_/g, resourcesPath)
        .replace(/_appPublisher_/g, appPublisher)
        .replace(/_appURL_/g, appURL)
        .replace(/_appId_/g, setupID)

      fs.writeFile(tmpIssPath, iconv.encode(str, 'gbk'), null, function (err) {
        if (err) return reject(err)

        // inno setup start
        innosetupCompiler(tmpIssPath, {
          gui: false,
          verbose: true
        }, function (err) {
          fs.unlinkSync(tmpIssPath)
          if (err) return reject(err)
          resolve(opt)
        })
      })
    })
  })
}

buildWinSetup()