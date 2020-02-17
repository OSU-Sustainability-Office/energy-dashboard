/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2018-12-20T15:35:53-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2019-04-08T13:28:52-07:00
 */
import api from './api.js'
import L from 'leaflet'

// eslint-disable-next-line
import { Story, Group, GroupStory, Block, Chart, Meter } from './objectDefs.js'

export default {
  story: async (context, id) => {
    try {
      if (context.getters.currentStory && id === context.getters.currentStory.id) {
        return Promise.resolve(context.getters.currentStory)
      } else {
        context.commit('loadStory', new Story())
        let story = await api.story(id)

        for (let chart of story.openCharts) {
          let b = story.blocks.find(el => el.id === chart.block_id)
          // First put meters into charts
          for (let meter of story.openMeters) {
            if (((chart.meter === 0 && meter.type === 'e') || chart.meter === meter.meter_id) && meter.chart_id === chart.id) {
              if (chart.meters) {
                chart.meters.push(meter)
                story.openMeters.splice(story.openMeters.indexOf(meter), 1)
              } else {
                chart.meters = [meter]
              }
            }
          }
          // Then put charts into blocks
          if (b.charts) {
            b.charts.push(chart)
          } else {
            b.charts = [chart]
          }
        }
        // Clean Boy
        delete story.openCharts
        delete story.openMeters
        story.loaded = true
        context.commit('loadStory', story)
        for (let b in story.blocks) {
          await context.dispatch('block', { index: b })
        }
        return Promise.resolve(story)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  },
  stories: async context => {
    try {
      if (context.getters.stories.length > 0) {
        return Promise.resolve(context.getters.stories)
      } else {
        let stories = await api.stories()
        let master = []
        for (let row of stories) {
          if (!master.find(elm => { return elm.id === row.group_id })) {
            master.push({ group: row.group_name, stories: [ row ], public: row.group_public, id: row.group_id })
          } else {
            master.find(elm => { return elm.id === row.group_id }).stories.push(row)
          }
        }
        context.commit('loadStories', master)
        return Promise.resolve(context.getters.stories)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  },

  buildings: async () => {
    try {
      return Promise.resolve(await api.buildings())
    } catch (error) {
      return Promise.reject(error)
    }
  },

  building: async (context, payload) => {
    try {
      if (payload.blockIndex === null || payload.chartIndex === null || context.getters.story.blocks.length < payload.blockIndex || context.getters.story.blocks[payload.blockIndex].charts.length < payload.chartIndex) {
        throw new Error('Building action needs existing chart and block index')
      }
      if (!payload.group_id) {
        throw new Error('Building action needs group id')
      }
      let meters = await api.meters(payload.group_id)
      let r = []
      for (let meter of meters) {
        if (meter.type === 'e') {
          r.push(meter)
        }
      }
      await context.dispatch('block', { index: payload.blockIndex, charts: [{ index: payload.chartIndex, group_id: payload.group_id, meters: r, point: 'accumulated_real' }] })
      return Promise.resolve(context.getters.block(payload.blockIndex))
    } catch (error) {
      return Promise.reject(error)
    }
  },

  block: async (context, payload) => {
    try {
      if (payload.index === null) {
        throw new Error('Block action needs index')
      }

      let block = {}
      if (context.getters.block(payload.index)) {
        context.commit('invalidateBlock', payload.index)
        // Deep copy prevents callbacks to data changing on computed variables
        block = JSON.parse(JSON.stringify(context.getters.block(payload.index)))
      }
      // Manipulate old block to conform to payloads new keys
      for (let blockKey of Object.keys(payload)) {
        // Special case for charts
        if (blockKey === 'charts') {
          for (let chartObj of payload.charts) {
            if (chartObj.index === undefined) {
              block[blockKey] = payload[blockKey]
              continue
            }
            let chartIndex = chartObj.index
            for (let chartKey of Object.keys(chartObj)) {
              block.charts[chartIndex][chartKey] = chartObj[chartKey]
            }
          }
        } else {
          block[blockKey] = payload[blockKey]
        }
      }
      let morePromises = []
      // Aqquire new data for the charts since they were manipulated
      for (let chartIndex in block.charts) {
        morePromises.push(context.dispatch('data', { meters: block.charts[chartIndex].meters, point: block.charts[chartIndex].point, date_start: block.date_start, date_end: block.date_end, date_interval: block.date_interval, interval_unit: block.interval_unit }))
      }
      let data = await Promise.all(morePromises)
      for (let i in data) {
        block.charts[i].data = data[i]
      }
      block.loaded = true
      context.commit('loadBlock', block)
      return Promise.resolve(block)
    } catch (error) {
      return Promise.reject(error)
    }
  },

  data: async (conetext, payload) => {
    try {
      const meters = payload.meters
      const meteringPoint = payload.point
      const startDate = payload.date_start
      const endDate = payload.date_end
      const intervalNum = payload.date_interval
      const intervalUnit = payload.interval_unit

      let start = new Date(startDate)
      start.setMinutes(Math.floor(start.getMinutes() / 15.0) * 15)
      start.setSeconds(0)
      start.setMilliseconds(0)
      start.setMinutes(start.getMinutes() - 15)
      if (intervalUnit === 'minute') {
        start.setMinutes(start.getMinutes() - (intervalNum - 15))
      } else if (intervalUnit === 'hour') {
        start.setHours(start.getHours() - intervalNum)
      } else if (intervalUnit === 'day') {
        start.setDate(start.getDate() - intervalNum)
      } else if (intervalUnit === 'month') {
        start.setMonth(start.getMonth() - intervalNum)
      }

      let chartPromises = []
      for (let meter of meters) {
        if (meter.operation > 1 && meters.length > 1) {
          continue
        }
        chartPromises.push(api.data(meter.meter_id, start.toISOString(), endDate, meteringPoint))
      }
      let r = await Promise.all(chartPromises)

      let finalData = []
      const map = {
        pf_a: 1,
        pf_b: 1,
        pf_c: 1,
        reactive_a: 1,
        reactive_b: 1,
        reactive_c: 1,
        default: 0
      }
      for (let set in r) {
        if (!r[set] || r[set].length <= 0) {
          // If we dont get any data in the set skip to the next set
          continue
        }
        // get multiplier for oddly hooked up meters for points that can be negative
        const multiplier = ((meters[set].negate) ? -1 : 1) * (map[Object.keys(r[set][0])[1]] || map['default'])

        // get negation factor for accumulated_real
        let mu2 = (meters[set].operation) ? 1 : -1
        if (meters.length === 1) {
          mu2 = 1
        }
        /* Fix for steam meter measurement in 100s of lbs */
        if (meters[set].class === 4444) {
          mu2 *= 100
        }
        if (multiplier === 0) {
          let insert = 0
          for (let data of r[set]) {
            while (insert < finalData.length && data.time > finalData[insert].x) {
              insert++
            }
            if (insert === finalData.length) {
              finalData.push({x: data.time, y: Math.abs(data[Object.keys(data)[1]]) * mu2})
            } else {
              finalData[insert].y += Math.abs(data[Object.keys(data)[1]]) * mu2
            }
          }
        } else {
          let insert = 0
          for (let data of r[set]) {
            while (insert < finalData.length && data.time > finalData[insert].x) {
              insert++
            }
            if (insert === finalData.length) {
              finalData.push({x: data.time, y: (data[Object.keys(data)[1]]) * multiplier})
            } else {
              finalData[insert].y += (data[Object.keys(data)[1]]) * multiplier
            }
          }
        }
      }
      if (meteringPoint === 'accumulated_real' || meteringPoint === 'total' || meteringPoint === 'cubic_feet') {
        for (let i = finalData.length - 1; i > 0; i--) {
          finalData[i].y -= finalData[i - 1].y
        }
      }
      finalData.splice(0, 1)
      return Promise.resolve(finalData)
    } catch (error) {
      return Promise.reject(error)
    }
  },

  user: async (context) => {
    try {
      if (context.getters.user.name !== '') {
        return Promise.resolve(context.getters.user)
      } else {
        let user = await api.user()
        context.commit('loadUser', user)
        return Promise.resolve(context.getters.user)
      }
    } catch (error) {
      context.commit('loadUser', { name: '', privilige: 0, id: null })
      return Promise.resolve(context.getters.user)
    }
  },

  addChart: async (context, payload) => {
    try {
      const l = context.getters.story.blocks[payload.index].charts.length
      context.commit('loadChart', {
        blockIndex: payload.index,
        chartIndex: l,
        data: {
          name: payload.name,
          group_id: payload.group,
          point: payload.point,
          meter: payload.meter,
          meters: payload.meters,
          date_start: payload.date_start,
          date_end: payload.date_end
        }
      })
      await context.dispatch('block', { index: payload.index })
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },

  addChartAndCompare: async (context, payload) => {
    try {
      await context.dispatch('addChart', payload)
      let now = Date.now()
      // Zero indexed chart contains the most recent data
      // One indexed data is the compared data
      const dataArray = context.getters.story.blocks[payload.index].charts[0].data
      const timeSeperation = (new Date(context.getters.story.blocks[payload.index].charts[0].data[0].x)).getTime() - (new Date(context.getters.story.blocks[payload.index].charts[1].data[0].x)).getTime()
      let percentageData = []
      for (let i in dataArray) {
        let currentChartDate = Date(dataArray[i].x)
        if (now < currentChartDate) {
          const comparisonTime = (new Date(context.getters.story.blocks[payload.index].charts[1].data[0].x)).getTime()
          if (currentChartDate.getTime() - comparisonTime > timeSeperation) {
            i++
          } else if (currentChartDate.getTime() === comparisonTime) {
            const perc = dataArray[i].y / context.getters.story.blocks[payload.index].charts[1].data[i].y
            percentageData.push({ x: currentChartDate.toISOString(), y: perc })
          } else {
            throw new Error('This is really bad')
          }
        } else {
          break
        }
      }
    } catch (err) {
      Promise.reject(err)
    }
  },

  // Server side create/update/delete actions
  // GROUP
  createGroup: async (context, payload) => {
    try {
      let group = await api.group({ name: payload.name }, 'post')
      context.commit('addGroup', { group: payload.name, id: group.id, stories: [] })
      return Promise.resolve(group.id)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  updateGroup: async (context, payload) => {
    try {
      await api.group({ name: payload.name, id: payload.id }, 'put')
      context.commit('updateGroup', { name: payload.name, id: payload.id })
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
  deleteGroup: async (context, payload) => {
    try {
      await api.group({ id: payload.id }, 'delete')
      context.commit('deleteGroup', { id: payload.id })
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
  // STORY
  createStory: async (context, payload) => {
    try {
      let story = await api.story(null, payload, 'post')
      payload.id = story.id
      context.commit('addStory', payload)
      return Promise.resolve(story.id)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  updateStory: async (context, payload) => {
    try {
      context.commit('updateStory', payload)
      await api.story(null, payload, 'put')
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
  deleteStory: async (context, payload) => {
    try {
      context.commit('deleteStory', payload)
      await api.story(null, payload, 'delete')
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
  createBlock: async (context, payload) => {
    try {
      let block = await api.block(payload, 'post')
      context.commit('setBlockId', { index: payload.index, id: block.id })
      return Promise.resolve(block.id)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  updateBlock: async (context, payload) => {
    try {
      await api.block(payload, 'put')
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
  deleteBlock: async (context, payload) => {
    try {
      await api.block(payload, 'delete')
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
  createChart: async (context, payload) => {
    try {
      let chart = await api.chart(payload, 'post')
      context.commit('setChartId', { block_index: payload.index, chart_index: payload.chartIndex, id: chart.id })
      return Promise.resolve(chart.id)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  updateChart: async (context, payload) => {
    try {
      await api.chart(payload, 'put')
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
  deleteChart: async (context, payload) => {
    try {
      await api.chart(payload, 'delete')
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // COMMANDS THAT DONT DO ANYTHING TO THE STORE
  mapdata: async () => {
    try {
      const data = (await api.mapData()).data
      const buildings = await api.buildings()
      let yarra = []
      for (let building of data) {
        let index = buildings.map(e => { return e.building_id }).indexOf(building.id)
        if (index >= 0) {
          yarra.push({
            type: 'Feature',
            properties: {
              name: building.attributes.name,
              affiliation: buildings[index].affiliation,
              story_id: buildings[index].story_id,
              id: building.id
            },
            geometry: building.attributes.geometry
          })
        }
      }
      // const r = {
      //   type: 'FeatureCollection',
      //   name: 'buildings',
      //   crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
      //   features: yarra
      // }
      return Promise.resolve(yarra)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  buildingIDForStory: async (context, id) => {
    try {
      const data = (await api.buildingForStory(id))
      return Promise.resolve({ building: data.building_id, group: data.id })
    } catch (e) {
      return Promise.reject(e)
    }
  },
  allmapdata: async () => {
    try {
      const data = (await api.mapData()).data
      let yarra = []
      // let badObjects = []
      for (let building of data) {
        const gJSON = {
          type: 'Feature',
          properties: {
            name: building.attributes.name,
            id: building.id
          },
          geometry: building.attributes.geometry
        }
        try {
          L.geoJSON(gJSON)
          yarra.push(gJSON)
        } catch (e) {
          // Surpress errors about invalid geojson. We should email OSU about these errors
          // About 402 objects have no geometry
          // badObjects.push(gJSON)
          continue
        }
      }
      return Promise.resolve(yarra)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  media: async () => {
    try {
      return Promise.resolve(await api.media())
    } catch (error) {
      return Promise.reject(error)
    }
  },
  allUsers: async () => {
    try {
      return Promise.resolve(await api.allusers())
    } catch (error) {
      return Promise.reject(error)
    }
  },
  updateUser: async (context, payload) => {
    try {
      return Promise.resolve(await api.updateuser(payload.privilege, payload.id))
    } catch (error) {
      return Promise.reject(error)
    }
  },
  campaigns: async () => {
    try {
      return Promise.resolve(await api.campaigns())
    } catch (error) {
      return Promise.reject(error)
    }
  },
  buildingMeters: async (context, payload) => {
    try {
      return Promise.resolve(await api.meters(payload.id))
    } catch (error) {
      return Promise.reject(error)
    }
  },
  metersByBuilding: async () => {
    try {
      let meters = await api.metersByBuilding()
      let returnedObject = {}
      for (let meter of meters) {
        if (!returnedObject[meter.building_name]) {
          returnedObject[meter.building_name] = [{ id: meter.id, name: meter.meter_name }]
        } else {
          returnedObject[meter.building_name].push({ id: meter.id, name: meter.meter_name })
        }
      }
      return Promise.resolve(returnedObject)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  meterPoints: async (context, payload) => {
    try {
      return Promise.resolve(await api.meterPoints(payload.id))
    } catch (error) {
      return Promise.reject(error)
    }
  },
  alerts: async () => {
    try {
      return Promise.resolve(await api.alerts())
    } catch (error) {
      return Promise.reject(error)
    }
  },
  newAlert: async (context, payload) => {
    try {
      let alert = await api.alert(payload, 'post')
      return Promise.resolve(alert.id)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  updateAlert: async (context, payload) => {
    try {
      await api.alert(payload, 'put')
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
  deleteAlert: async (context, payload) => {
    try {
      await api.alert(payload, 'delete')
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
  logout: async (context) => {
    try {
      let link = await api.logout()
      context.commit('loadUser', { name: '', privilege: 0, id: null })
      window.location.replace(link.url)
      // Technically I think this is unreachable code...
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
  baseline: async (context, payload) => {
    try {
      let start = new Date(payload.date_start)
      start.setMinutes(Math.floor(start.getMinutes() / 15) * 15)
      start.setSeconds(0)
      start.setMilliseconds(0)
      start = start.getTime()
      let weekcount = Math.round(((new Date(payload.date_end)).getTime() - start) / 604800000)
      let data = await context.dispatch('data', payload)
      let matrixBase = [new Array(96).fill(0), new Array(96).fill(0), new Array(96).fill(0), new Array(96).fill(0), new Array(96).fill(0), new Array(96).fill(0), new Array(96).fill(0)]
      let badAverages = {}
      // 672 Points in baseline data, averaged per weekcount
      // return baseline data in 2d array form no dates
      // 2d array dimensions are 7 by 96
      let i = 0
      for (let piece of data) {
        if (i === data.length - 1) {
          continue
        }
        // If this is ever less than zero something bad has happened
        while (((new Date(piece.x)).getTime() - start) - (i * 900000) > 0) {
          if (badAverages[((i / 96) % 7) + '-' + (i % 96)]) {
            badAverages[((i / 96) % 7) + '-' + (i % 96)] += 1
          } else {
            badAverages[((i / 96) % 7) + '-' + (i % 96)] = 1
          }
          i++
        }
        matrixBase[Math.floor((i / 96) % 7)][i % 96] += piece.y / weekcount
        if (payload.goal !== null) {
          matrixBase[Math.floor((i / 96) % 7)][i % 96] *= payload.goal / 100.0
        }
        i++
      }
      for (let key of Object.keys(badAverages)) {
        const dashI = key.indexOf('-')
        const dayOfWeek = parseInt(key.substring(0, dashI))
        const timeOfDay = parseInt(key.substring(dashI + 1, key.length))
        if (dayOfWeek >= 7) {
          continue
        }
        matrixBase[dayOfWeek][timeOfDay] *= weekcount
        matrixBase[dayOfWeek][timeOfDay] /= (weekcount - badAverages[key])
      }
      return Promise.resolve(matrixBase)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  campaign: async (context, payload) => {
    try {
      let campaign = await api.campaign(payload)

      /*
        campaigns will use the default story structure.
      */
      let defaultStory = new Story()
      defaultStory.media = campaign.media
      defaultStory.name = campaign.name
      defaultStory.loaded = true
      defaultStory.date_start = campaign.date_start
      defaultStory.date_end = campaign.date_end

      let topBlock = new Block()
      topBlock.date_start = campaign.date_start
      topBlock.date_end = campaign.date_end
      topBlock.date_interval = 1
      topBlock.interval_unit = 'day'
      topBlock.index = 0
      defaultStory.blocks.push(topBlock)
      context.commit('loadStory', defaultStory)

      for (let group of campaign.groups) {
        let meters = await context.dispatch('buildingMeters', { id: group.id })
        let baseline = await context.dispatch('baseline', {
          goal: group.goal,
          meters: meters,
          point: 'accumulated_real',
          date_start: campaign.compare_start,
          date_end: campaign.compare_end,
          date_interval: 'day',
          interval_unit: 1
        })
        // Fetch current data
        let currentData = await context.dispatch('data', {
          meters: meters,
          point: 'accumulated_real',
          date_start: campaign.date_start,
          date_end: campaign.date_end,
          date_interval: 1,
          interval_unit: 'day'
        })

        let defaultBlock = new Block(group.id, campaign.groups.indexOf(group) + 1, group.name, campaign.date_start, campaign.date_end, 5, 1, 'day')
        defaultBlock.goal = group.goal
        defaultBlock.accumulatedPercentage = null
        defaultBlock.loaded = true

        defaultBlock.charts.push(new Chart(null, null, null, 1, meters, 'accumulated_real', 'Current Data', 0, JSON.parse(JSON.stringify(currentData))))

        let fakeData = []
        for (let i in currentData) {
          currentData[i].y /= baseline[Math.floor((i / 96) % 7)][i % 96] / 100
          currentData[i].y -= 100
          fakeData.push({ x: currentData[i].x, y: baseline[Math.floor((i / 96) % 7)][i % 96] })
        }

        // const totalPercent = currentData.reduce((total, value) => total + value.y, 0) / currentData.length
        defaultBlock.accumulatedPercentage = 0

        defaultBlock.charts.splice(0, 0, new Chart(null, null, null, 0, meters, 'accumulated_real', 'Baseline Data', 0, fakeData))
        topBlock.charts.push(new Chart(null, null, null, campaign.groups.indexOf(group), meters, 'baseline_percentage', group.name, 0, currentData))
        defaultStory.blocks.push(defaultBlock)
      }
      topBlock.loaded = true
      await context.commit('loadStory', defaultStory)
      Promise.resolve()
    } catch (error) {
      Promise.reject(error)
    }
  },
  compare: async (context, payload) => {
    context.commit('loadStory', new Story()) // Load blank story to invalidate current story
    let defaultBlock = new Block(null, 0, 'Energy Consumption')
    let indexCount = 0
    let media = []
    for (let story of payload.stories) {
      let storyData = await api.story(story)
      media.push(storyData.media)

      let defaultChart = new Chart()
      defaultChart.index = indexCount
      defaultChart.group_id = storyData.openCharts[0].group_id
      defaultChart.name = storyData.name

      for (let meter of storyData.openMeters) {
        if (meter.type === 'e') {
          defaultChart.meters.push(meter)
        }
      }
      defaultBlock.charts.push(defaultChart)
      indexCount++
    }

    let defaultStory = new Story()
    defaultStory.media = media
    defaultStory.blocks.push(defaultBlock)
    defaultStory.loaded = true
    defaultStory.comparison = true
    let index = 0
    for (let chart of defaultStory.blocks[0].charts) {
      defaultStory.name += chart.name
      if (defaultStory.blocks[0].charts.length - 1 !== index) {
        defaultStory.name += ', '
      }
      index++
    }
    context.commit('loadStory', defaultStory)
    let obj = { index: 0, date_start: payload.dateStart, date_end: payload.dateEnd }
    if (payload.interval) {
      obj['date_interval'] = payload.interval
    }
    if (payload.unit) {
      obj['interval_unit'] = payload.unit
    }
    return async () => { await context.dispatch('block', obj) }
  },
  allDevices: async (context, payload) => {
    const meters = await api.allMeters()
    let devices = meters.reduce((accm, current) => {
      const deviceName = current.address.substr(0, 12)
      let DACIndex = accm.map(o => o.name).indexOf(deviceName)
      const newMeter = {
        name: current.name,
        id: current.id,
        port: current.address.replace(deviceName + '_', ''),
        class: current.class
      }
      if (DACIndex >= 0) {
        accm[DACIndex].meters.push(newMeter)
      } else {
        const newDAC = {
          name: deviceName,
          meters: [newMeter]
        }
        accm.push(newDAC)
      }
      return accm
    }, [])
    return devices
  }
}
