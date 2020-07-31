{ {#if_eq eslintConfig 'standard' } }
'use strict'

{ {/if_eq} }
    import { app, BrowserWindow } from 'electron' { {#if_eq eslintConfig 'airbnb' } } // eslint-disable-line{{/if_eq}}

    const NodeRSA = require('node-rsa');
    var regedit = require('regedit')
    regedit.setExternalVBSLocation('./resources/vbs');

    var name = require('../../package.json').name
    var data = {}
    data[name] = {
      value: Date.now().toString(),
      type: 'REG_SZ'
    }
    var path = require('path');
    var fs = require('fs');
    var root = path.dirname(process.execPath).split('\\').join('/') + '/lic.licence'
    var publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmfvKiF6Ylw1Tf93S63Bctz/HY
tPxlDcPi8gKuS9eYYamdW2/hx1jURQj8vnPaZiP/b6qp/0NufeasETOB3BVseokm
DOJ+MSlUb/uF2RLN0MaHJ6V9QkcY5KhHrETsLnqMZcvr7JUvs3rgaal6fFkp96Gi
lxeHS3dHgQXpV8xHhwIDAQAB
-----END PUBLIC KEY-----`;
    var privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQCmfvKiF6Ylw1Tf93S63Bctz/HYtPxlDcPi8gKuS9eYYamdW2/h
x1jURQj8vnPaZiP/b6qp/0NufeasETOB3BVseokmDOJ+MSlUb/uF2RLN0MaHJ6V9
QkcY5KhHrETsLnqMZcvr7JUvs3rgaal6fFkp96GilxeHS3dHgQXpV8xHhwIDAQAB
AoGABMocXJW9LI7syvzWF2aJjPXCWGj0bcL2vjUn5vya33D6+i78MDditLbqnZoj
nl+99LDTU0QwPhD8+fS3Hoi+KpT0qmO1gPifQpR13wzahEZjfr3kv04fXh3h7SMs
QmTketnT7ppIho7chbNcpTG/iIhpr3CnleyEsjPc7xqTB7kCQQDmbU8RaS5WzDs/
g/DfuDh8cxG4ErLU4Vti+GwAR2uWZY2yMiRRgXAUulQk0Nf6rSxbTERvHrQCzXOA
s1FV5l/zAkEAuPlIwB795CnXjN6hoXv2Cu5gj9x2HpovnhacsCen7OLjGn7YCxYY
uicVXCVjnl6Y+slQ6UUR13dezVZvxZIzHQJBAOQicvbk8PkEiOBQjAmjRWGJN5DM
CnwThjwNgjggfddQQiKb3DNJ+KK8+5PbpQnNrC3T66ksd8KSkHlqj+uBA5sCQFQ6
1+D8e9qxHwF7w5g4TXLu17PKzVLkHTjczR79/97D9mxzREfQGRRzhat/LxzHsNvK
XnjKxfQa3GWerakHCRUCQHwjikWYroHF6RBoYA208tV3cZRyfCyFNoBHLmv31fFI
MFL1DOXGfi+GxShH8RSJghLxwEYx1glTuMxVgQawgJ4=
-----END RSA PRIVATE KEY-----`;
    function checkLicense(success, fail) {
      try {
        if (fs.existsSync(root)) {
          var licenceEncrypted = fs.readFileSync(root, 'utf8').toString();
          var _privateKey = new NodeRSA(privateKey);
          var decrypted = _privateKey.decrypt(licenceEncrypted, 'utf8');
          var jsons = JSON.parse(decrypted)
          if (jsons['forever']) {
            updateLast(jsons)
            success()
          } else {
            if (jsons['last'] > Date.now()) {
              fail()
            } else {
              if (jsons['timeline'] > Date.now()) {
                updateLast(jsons)
                success()
              } else {
                fail()
              }
            }
          }

        } else {
          check_regedit().then((res) => {
            if (res) {
              var tmp = JSON.stringify({
                forever: false,
                timeline: new Date().setDate(new Date().getDate() + 30),
                last: Date.now(),
              });
              var _publicKey = NodeRSA(publicKey)
              var decrypted = _publicKey.encrypt(tmp, 'base64');
              fs.writeFileSync(root, decrypted)
              success()
            } else {
              fail()
            }
          })
        }
      }
      catch (err) {
        fail()
      }
    }

    function updateLast(json) {
      json.last = new Date()
      var _publicKey = NodeRSA(publicKey)
      var decrypted = _publicKey.encrypt(json, 'base64');
      fs.writeFileSync(root, decrypted)
    }

    function queue_software() {
      return new Promise((resolve, reject) => {
        regedit.list(['HKLM\\SOFTWARE'], function (err, SOFTWARE) {
          if (err !== null) return reject(err)
          resolve(SOFTWARE)
        })
      })
    }
    function queue_company() {
      return new Promise((resolve, reject) => {
        regedit.list(['HKLM\\SOFTWARE\\ChunKun'], function (err, COMPANY) {
          if (err !== null) return reject(err)
          resolve(COMPANY)
        })
      })
    }
    function create_company() {
      return new Promise((resolve, reject) => {
        regedit.createKey(['HKLM\\SOFTWARE\\ChunKun'], function (err) {
          if (err !== null) resolve(false)
          resolve(true)
        })
      })
    }
    function insert_product() {
      return new Promise((resolve, reject) => {
        regedit.putValue({ 'HKLM\\SOFTWARE\\ChunKun': data }, function (err) {
          if (err !== null) resolve(false)
          resolve(true)
        })
      })
    }
    async function check_regedit() {
      var SOFTWARE = await queue_software();
      if (SOFTWARE['HKLM\\SOFTWARE'].hasOwnProperty('keys') && SOFTWARE['HKLM\\SOFTWARE'].keys.indexOf('ChunKun') > -1) {
        var COMPANY = await queue_company();
        if (COMPANY['HKLM\\SOFTWARE\\ChunKun'].hasOwnProperty('values') && COMPANY['HKLM\\SOFTWARE\\ChunKun'].values.hasOwnProperty(name)) {
          return false
        } else {
          await insert_product();
          return true
        }
      } else {
        await create_company();
        await insert_product();
        return true
      }
    }

    /**
     * Set `__static` path to static files in production
     * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
     */
    if (process.env.NODE_ENV !== 'development') {
      global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\'){ {#if_eq eslintConfig 'airbnb' } } // eslint-disable-line{{/if_eq}}
    }

    let mainWindow
    const winURL = process.env.NODE_ENV === 'development'
      ? `http://localhost:9080`
      : `file://${__dirname}/index.html`

    function createWindow() {
      /**
       * Initial window options
       */
      checkLicense(
        function () {
          mainWindow = new BrowserWindow({
            height: 1080,
            useContentSize: true,
            width: 1920,
            x: 0,
            y: 0,
            frame: false,
            center: true,
            alwaysOnTop: true,
            fullscreen: true,
            kiosk: true,
            webPreferences: {
              webSecurity: false
            }
          })

          mainWindow.loadURL(winURL)

          mainWindow.on('closed', () => {
            mainWindow = null
          })
        },
        function () {
          app.quit()
          mainWindow = null
        }
      )
    }

    app.on('ready', createWindow)

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    app.on('activate', () => {
      if (mainWindow === null) {
        createWindow()
      }
    })
    { {#if_eq builder 'builder' } }

    /**
     * Auto Updater
     *
     * Uncomment the following code below and install `electron-updater` to
     * support auto updating. Code Signing with a valid certificate is required.
     * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
     */

    /*
    import { autoUpdater } from 'electron-updater'
    
    autoUpdater.on('update-downloaded', () => {
      autoUpdater.quitAndInstall()
    })
    
    app.on('ready', () => {
      if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
    })
     */
    { { /if_eq}}
