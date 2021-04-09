/*
 * @Author: Brogan
 * @Date:   Friday September 6th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Friday September 6th 2019
 * @Copyright:  Oregon State University 2019
 */
(async () => {
  const Module = require('module')
  const _require = Module.prototype.require

  const Express = require('express')
  const AWS = require('aws-sdk')
  const FileSystem = require('fs-extra')
  const Yaml = require('yaml')
  const HTTPS = require('https')
  const Unzip = require('unzip')
  const Cors = require('cors')

  Module.prototype.require = function () {
    for (let p of Object.keys(arguments)) {
      if (arguments[p].search(/opt/gi) >= 0) {
        let mPath = this.id.split('/')
        let token = mPath[mPath.length - 2]
        let count = 0
        while (token !== 'backend' && count < mPath.length - 2) {
          count++
          token = mPath[mPath.length - 2 - count]
        }
        arguments[p] = 'express_build' + arguments[p]
        for (let i = 0; i < count; i++) arguments[p] = '../' + arguments[p]
      }
    }
    return _require.apply(this, arguments)
  }
  const awsKeys = (() => {
    const fileContents = FileSystem.readFileSync(require('os').homedir() + '/.aws/credentials').toString()
    const lineArray = fileContents.split('\n')
    return {
      'aws_access_key_id': lineArray[1].split('=')[1].trim(),
      'aws_secret_access_key': lineArray[2].split('=')[1].trim()
    }
  })()
  AWS.config.update({
    accessKeyId: awsKeys.aws_access_key_id,
    secretAccessKey: awsKeys.aws_secret_access_key,
    region: 'us-west-2'
  })
  try {
    FileSystem.mkdirSync('express_build')
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error
    }
  }

  const ref = {
    identity: value => value instanceof String,
    tag: '!Ref',
    resolve: (doc, node) => {
      return node.strValue
    }
  }

  Yaml.defaultOptions.customTags = [ref]

  const template = Yaml.parse(FileSystem.readFileSync('template.yaml', 'utf8'))

  const neededLayers = []
  const grabbedLayers = []

  const app = Express()

  for (const resourceKey of Object.keys(template.Resources)) {
    const resource = template.Resources[resourceKey]
    if (resource.Type === 'AWS::Serverless::Function') {
      const routeProperties = Object.values(resource.Properties.Events)[0].Properties
      app[routeProperties.Method](routeProperties.Path, Cors({ origin: 'http://localhost:8080', credentials: true }), Express.json(), async (req, res) => {
        const codePath = resource.Properties.Handler.split('.')
        const fullModPath = './' + resource.Properties.CodeUri + codePath[0] + '.js'
        const moduleName = require(fullModPath)
        const event = {
          body: (req.body) ? req.body : '',
          httpMethod: req.method,
          queryStringParameters: {
            ...req.query
          },
          headers: {
            Cookie: req.headers.cookie
          }
        }
        let response = (await moduleName[codePath[1]](event))
        if (response.isBase64Encoded) {
          let img = Buffer.from(response.body, 'base64')
          res.writeHead(200, {
            'Content-Type': response.headers['Content-Type']
            // 'Content-Length': response.body.length - 1
          })
          res.end(img)
        } else {
          res.send(response.body)
        }
        delete require.cache[require.resolve(fullModPath)]
      })
      if (resource.Properties.Layers) {
        for (const layer of resource.Properties.Layers) {
          if (neededLayers.indexOf(layer) < 0) {
            neededLayers.push(layer)
          }
        }
      }
    } else if (resource.Type === 'AWS::Serverless::LayerVersion') {
      grabbedLayers.push(resource.Properties.LayerName)
      FileSystem.copy(resource.Properties.ContentUri, 'express_build/opt/')
    }
  }

  for (let layer of grabbedLayers) {
    if (neededLayers.indexOf(layer) >= 0) {
      neededLayers.splice(neededLayers.indexOf(layer), 1)
    }
  }
  const Lambda = new AWS.Lambda()

  const layerPromises = []

  for (let layer of neededLayers) {
    let layerArn = template.Parameters[layer].Default
    try {
      layerPromises.push(new Promise((resolve, reject) => {
        Lambda.getLayerVersionByArn({
          Arn: layerArn
        }, (err, data) => {
          if (err) {
            reject(err)
          } else {
            const layerUrl = data.Content.Location
            const zipFile = FileSystem.createWriteStream(layer + '.zip')
            HTTPS.get(layerUrl, (data) => {
              data.pipe(zipFile)
              zipFile.on('finish', () => {
                const extractor = Unzip.Extract({ path: 'express_build/opt' })
                FileSystem.createReadStream(layer + '.zip').pipe(extractor)
                extractor.on('close', () => {
                  FileSystem.unlinkSync(layer + '.zip')
                  resolve()
                })
              })
            })
          }
        })
      }))
    } catch (error) {
      throw new Error('Couldnt find all layers needed')
    }
  }

  await Promise.all(layerPromises)

  app.use(Cors({ origin: 'http://localhost:8080', credentials: true }))
  app.use(Express.urlencoded({ extended: true }))
  app.use(Express.json())
  app.listen(3000, function () {
    require('dotenv').config({ path: 'express_build/opt/nodejs/.env' })
    console.log('Server Running')
  })
})()
