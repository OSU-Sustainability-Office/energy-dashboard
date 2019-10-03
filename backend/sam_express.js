/*
 * @Author: Brogan
 * @Date:   Friday September 6th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Friday September 6th 2019
 * @Copyright:  Oregon State University 2019
 */
(async () => {
  const Express = require('express')
  const AWS = require('aws-sdk')
  const FileSystem = require('fs-extra')
  const Yaml = require('yaml')
  const HTTPS = require('https')
  const Unzip = require('unzip')
  const Cors = require('cors')

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
      app[routeProperties.Method](routeProperties.Path, Cors({ origin: 'http://localhost:8080', credentials: true }), async (req, res) => {
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

          }
        }
        res.send(
          (await moduleName[codePath[1]](event)).body
        )
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
    try {
      const arn = template.Parameters[layer].Default
      layerPromises.push(new Promise((resolve, reject) => {
        Lambda.getLayerVersionByArn({
          Arn: arn
        }, (err, data) => {
          if (err) {
            reject(err)
          } else {
            const layerUrl = data.Content.Location
            const zipFile = FileSystem.createWriteStream(arn + '.zip')
            HTTPS.get(layerUrl, (data) => {
              data.pipe(zipFile)
              zipFile.on('finish', () => {
                const extractor = Unzip.Extract({ path: 'express_build/opt' })
                FileSystem.createReadStream(arn + '.zip').pipe(extractor)
                extractor.on('close', () => {
                  FileSystem.unlinkSync(arn + '.zip')
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

  app.use(Cors())
  app.listen(3000, function () {
    console.log('Server Running')
  })
})()
