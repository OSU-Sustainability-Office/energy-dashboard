const webdriver = require('selenium-webdriver')
const dotenv = require('dotenv')
dotenv.config({path: './tests/.env'})
dotenv.load()
require('it-each')()
// const assert = require('chai').assert

// Input capabilities
const capabilities = {
  'browserName': 'Chrome',
  'browser_version': '62.0',
  'os': 'Windows',
  'os_version': '10',
  'resolution': '1024x768',
  'browserstack.user': process.env.BROWSERSTACK_USER,
  'browserstack.key': process.env.BROWSERSTACK_KEY
}

describe('Integration Tests for Chrome', function () {
  this.timeout(30000)
  let driver

  before(function () {
    driver = new webdriver.Builder().usingServer('http://hub-cloud.browserstack.com/wd/hub').withCapabilities(capabilities).build()
    // driver = new webdriver.Builder().forBrowser('chrome').build()
  })

  after(function () {
    driver.quit()
  })

  it('Can open the website', function () {
    return driver.get(process.env.WEBSITE_ADDR)
  })

  it('Can click explore button', function () {
    return driver.findElement(webdriver.By.xpath('/html[1]/body[1]/section[1]/main[1]/section[1]/main[1]/div[3]/div[2]/button[1]')).click()
  })
  const mapMenuPaths = [
    '/html[1]/body[1]/section[1]/main[1]/div[1]/div[1]/ul[1]/li[1]/ul[1]/li[1]',
    '/html[1]/body[1]/section[1]/main[1]/div[1]/div[1]/ul[1]/li[1]/ul[1]/li[2]',
    '/html[1]/body[1]/section[1]/main[1]/div[1]/div[1]/ul[1]/li[1]/ul[1]/li[3]',
    '/html[1]/body[1]/section[1]/main[1]/div[1]/div[1]/ul[1]/li[1]/ul[1]/li[4]',
    '/html[1]/body[1]/section[1]/main[1]/div[1]/div[1]/ul[1]/li[1]/ul[1]/li[5]'
  ]

  it.each(mapMenuPaths, 'Can hide and show building type on map', function (element, next) {
    driver.findElement(webdriver.By.xpath(element)).click().then(() => {
      driver.findElement(webdriver.By.xpath(element)).click().then(() => {
        next()
      }).catch(e => {
        throw e
      })
    }).catch(e => {
      throw e
    })
  })

  for (let i = 1; i <= 3; i++) {
    const pathString = `path[class='leaflet-interactive']:nth-of-type(${i})`

    describe(`Testing map side view ${i} - 3`, function () {
      it('Can open the side view', async () => {
        try {
          let el = await driver.wait(driver.findElement(webdriver.By.css(pathString)), 5000)
          await driver.wait(el.isEnabled(), 5000)
          await el.click()
          // let title = await driver.findElement(webdriver.By.xpath('//div[@class=\'title el-row\']'))
          // assert(title != null)
          return Promise.resolve()
        } catch (err) {
          return Promise.reject(new Error('Unable to open side view'))
        }
      })

      it('Can change the date range', async () => {
        try {
          for (let buttonIndex = 1; buttonIndex <= 3; buttonIndex++) {
            let el = await driver.findElement(webdriver.By.css(`section.el-container.app.is-vertical:nth-child(1) main.el-main.main div.stage.el-row div.el-col.el-col-24 section.el-container.stage main.el-main.main div.graphcontrol.el-row div.el-col.el-col-24 div.buttons.el-row:nth-child(1) div.rangeButtonParent.el-col.el-col-8:nth-child(${buttonIndex}) > button.el-button.rangeButton.el-button--default`))
            await el.click()
            // Add assertion for data
          }
          return Promise.resolve()
        } catch (e) {
          console.log(e)
          return Promise.reject(new Error('Unable to change date range'))
        }
      })

      it('Can close the side view', async () => {
        try {
          let popUp = await driver.findElement(webdriver.By.css('section.el-container.app.is-vertical:nth-child(1) main.el-main.main div.stage.el-row div.el-col.el-col-24 > section.el-container.stage'))
          await driver.wait(async () => {
            let o = await popUp.getCssValue('opacity')
            return Promise.resolve(o === '1')
          }, 5000)
          let el = await driver.wait(driver.findElement(webdriver.By.xpath('//div[@class=\'close-box el-col el-col-1\']')), 5000)
          await driver.wait(el.isEnabled(), 5000)
          el.click()
          try {
            await driver.wait(async () => {
              let o = await popUp.isDisplayed()
              return Promise.resolve(!o)
            }, 5000)
          } catch (e) {
            // Nothing for now need to specify specific exception for no element
          }
          return Promise.resolve()
        } catch (e) {
          return Promise.reject(new Error('Unable to close side view'))
        }
      })
    })
  }
})
