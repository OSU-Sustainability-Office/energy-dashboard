var webdriver = require('selenium-webdriver')

// Input capabilities
var capabilities = {
  'browserName': 'Chrome',
  'browser_version': '62.0',
  'os': 'Windows',
  'os_version': '10',
  'resolution': '1024x768',
  'browserstack.user': process.env.BROWSERSTACK_USER,
  'browserstack.key': process.env.BROWSERSTACK_KEY
}

var driver = new webdriver.Builder()
  .usingServer('http://hub-cloud.browserstack.com/wd/hub')
  .withCapabilities(capabilities)
  .build()

driver.get('https://dashboard.sustainability.oregonstate.edu').then(function () {
  driver.findElement(webdriver.By.xpath('/html[1]/body[1]/section[1]/main[1]/section[1]/main[1]/div[3]/div[2]/button[1]')).click().then(function () {
    let promises = []
    promises.push(driver.findElement(webdriver.By.xpath('/html[1]/body[1]/section[1]/main[1]/div[1]/div[1]/ul[1]/li[1]/ul[1]/li[1]').click()))
    promises.push(driver.findElement(webdriver.By.xpath('/html[1]/body[1]/section[1]/main[1]/div[1]/div[1]/ul[1]/li[1]/ul[1]/li[2]').click()))
    promises.push(driver.findElement(webdriver.By.xpath('/html[1]/body[1]/section[1]/main[1]/div[1]/div[1]/ul[1]/li[1]/ul[1]/li[3]').click()))
    promises.push(driver.findElement(webdriver.By.xpath('/html[1]/body[1]/section[1]/main[1]/div[1]/div[1]/ul[1]/li[1]/ul[1]/li[4]').click()))
    promises.push(driver.findElement(webdriver.By.xpath('/html[1]/body[1]/section[1]/main[1]/div[1]/div[1]/ul[1]/li[1]/ul[1]/li[5]').click()))
    Promise.all(promises).then(() => {
      promises = []

      promises.push(driver.findElement(webdriver.By.xpath('/html[1]/body[1]/section[1]/main[1]/div[1]/div[1]/ul[1]/li[1]/ul[1]/li[1]').click()))
      promises.push(driver.findElement(webdriver.By.xpath('/html[1]/body[1]/section[1]/main[1]/div[1]/div[1]/ul[1]/li[1]/ul[1]/li[2]').click()))
      promises.push(driver.findElement(webdriver.By.xpath('/html[1]/body[1]/section[1]/main[1]/div[1]/div[1]/ul[1]/li[1]/ul[1]/li[3]').click()))
      promises.push(driver.findElement(webdriver.By.xpath('/html[1]/body[1]/section[1]/main[1]/div[1]/div[1]/ul[1]/li[1]/ul[1]/li[4]').click()))
      promises.push(driver.findElement(webdriver.By.xpath('/html[1]/body[1]/section[1]/main[1]/div[1]/div[1]/ul[1]/li[1]/ul[1]/li[5]').click()))
      Promise.all(promises).then(() => {
        driver.quit()
      })
    })
  })
})
