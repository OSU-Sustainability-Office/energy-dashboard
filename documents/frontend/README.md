# Documentation

This is the front-end Vue application documentation explaining how the frontend works.

### Top Level Index

- [0 About](#0-about)
- [1 Overview](#1-overview)
- [2 Components](#2-components)
- [3 Vuex Store](#3-vuex-store)
- [4 Testing](#4-testing)
- [5 Deployment](#5-deployment)

  ***

## 0 About

This Front End to the OSU Energy Dashboard. It uses Vue.js as a Front End framework and uses many other supporting libraries. Notable libraries include Chart.js for the graphing of energy data and Axios for communication with our cloud API services. Vuex is also used to handle shared data between components.

The Energy Dashboard also performs a few other miscellaneous tasks:

- Displays campaigns for the annual Killowatt Crackdown
- Hosts a web-page to display the Sustainability Map
- Shows energy trend for last 60 days

--

## 1 Overview

At a high-level, the dashboard just retrieves meter data from our API, stores it in a cache, and then displays the data as a line-chart using chartJS.

Basically when the dashboard first loads, it requests the map-building-meter layout of the database through the `allbuildings` API route. The dashboard then dynamically loads a Vuex module for each `building`, their `meter-group`, and each `meter` within said meter-group with attributes corresponding to the field values in the MySQL database.

Those datasets themselves we store as "block" modules which themselves load "charts" to actually visualize the data.

Basically here's the initial load procedure:

1. App.vue calls `map/loadMap` which hits the Cloud API route "allbuildings"
2. `map/loadMap` calls `map/loadBuilding` action on each building retrieved from the "allbuildings" API call.
3. `map/loadBuilding` dynamically registers a `building` module for each building and then calls `<loaded building module>/loadMeterGroup` to load each meter group before then calling the `<loaded building module>/buildDefaultBlocks` action.
4. `building/loadMeterGroup` similarly to `loadBuilding` dynamically loads the corresponding MeterGroup module for the building and then calls the `<loaded metergroup module>/loadMeter` action to load each meter module.
5. `metergroup/loadMeter` loads the meter module.
6. The `building/buildDefaultBlocks` action gets called loading the 'blocks' There is a block module generated for each meter group, and each block will load an array of charts.

Each building has a set of "blocks" which store the dataset (meter data) which we can display as a chart.

By default each meter group loads its own "block" which in turn lets us load a type of chart.

---

## 2 Components

- [2.1 Account](#21-account)
  - [2.1.1 account.vue](#211-accountvue)
  - [2.1.2 card.vue](#212-cardvue)
  - [2.1.3 featureController.vue](#213-featurecontrollervue)
  - [2.1.4 featured.vue](#214-featuredvue)
  - [2.1.5 HeroPicture.vue](#215-HeroPicturevue)
  - [2.1.7 navdir.vue](#217-navdirvue)
  - [2.1.8 storyCard.vue](#218-storycardvue)
- [2.2 Admin](#22-admin)
  - [2.2.1 admin.vue](#221-adminvue)
- [2.3 Charts](#23-charts)
  - [2.3.1 Barchart.vue](#231-Barchartvue)
  - [2.3.2 ChartController.vue](#232-chartcontrollervue)
  - [2.3.4 Linechart.vue](#234-Linechartvue)
- [2.4 Dashboard](#24-dashboard)
  - [2.4.1 dashboard_alerts.vue](#241-dashboard_alertsvue)
  - [2.4.2 dashboard_main.vue](#242-dashboard_mainvue)
  - [2.4.3 dashboard_BuildingModal.vue](#243-dashboard_BuildingModalvue)
- [2.5 Directory](#25-directory)
  - [2.5.1 directoyMain.vue](#251-directorymainvue)
  - [2.5.2 directoryPrivate.vue](#252-directoryprivatevue)
  - [2.5.3 directoryPublic.vue](#253-directorypublicvue)
  - [2.5.4 editGroup.vue](#254-editgroupvue)
  - [2.5.5 editStory.vue](#255-editstoryvue)
- [2.6 Home](#26-home)
  - [2.6.1 commitment.vue](#261-commitmentvue)
  - [2.6.2 homeContent.vue](#262-homecontentvue)
  - [2.6.3 homeSide.vue](#263-homesidevue)
  - [2.6.4 index.vue](#264-indexvue)
- [2.7 Map](#27-map)
  - [2.7.1 BuildingCompare.vue](#271-BuildingComparevue)
  - [2.7.2 ComparePrompt.vue](#272-ComparePromptvue)
  - [2.7.3 map.vue](#273-mapvue)
  - [2.7.4 BuildingModal.vue](#274-BuildingModalvue)
- [2.8 Other](#28-other)
  - [2.8.1 navBar.vue](#281-navbarvue)
  - [2.8.2 App.vue](#282-appvue)

#### 2.1 Account

These components are associated with the full view of graphs and charts. Additionally they allow you to edit parameters of the chart and if logged in give you full custimization to how the data is displayed.

###### 2.1.1 account.vue

The main component for the account view. It contains logic for checking URL parameters that set the range of data displayed for public stories.

###### 2.1.2 card.vue

This component handles the layout of the chart and title for the chart.

###### 2.1.3 featureController.vue

This component is part of the modal that popups when editing a graph. It contains the logic for setting multiple datasets on the graph.

###### 2.1.4 featured.vue

This is the modal that is displayed when editing a chart. It gives adjustable parameters like setting data and interval. It also contains the featureController.

###### 2.1.5 HeroPicture.vue

This component displays the large banner picture at the top of the account view.

###### 2.1.7 navdir.vue

This component is the small navigation bar underneath the heroPicture. It offers quick routing between stories and groups.

###### 2.1.8 storyCard.vue

This is the small card preview for a view.

#### 2.2 Admin

These components are currently unused but will be reimplemented soon.

###### 2.2.1 admin.vue

This component is not packaged into the application currently. It will soon be reimplemented to offer priviliged users a way for setting meter-building configurations, public stories and other administrative tasks.

#### 2.3 Charts

These components coordinate parsing data into usable forms for Chart.js.

###### 2.3.1 Barchart.vue

This component is used to set default settings for bar charts.

###### 2.3.2 ChartController.vue

This component is the main work horse of the charting. All charts use this component to parse the data into the correct format and display the correct chart type.

###### 2.3.4 Linechart.vue

This component is used to set default settings for line charts.

#### 2.4 Dashboard

These components pertain to alerts and other controls that a user may have when logged in and in their personal dashboard view.

###### 2.4.1 dashboard_alerts.vue

This component is used to display and handle the logic for user alerts.

###### 2.4.2 dashboard_main.vue

This component is used to unify all personal dashboard components.

###### 2.4.3 dashboard_BuildingModal.vue

This component is used to handle logic and UI for switching between user panes (currently only alerts and views)

#### 2.5 Directory

These components are used for the building list display and contain some modals for editing stories and groups.

###### 2.5.1 directoryMain.vue

This component encompasses all logic for displaying the building list and personal views

###### 2.5.2 direcroryPrivate.vue

This component is used as a wrapper for the directoryMain component to only display personal stories.

###### 2.5.3 direcroryPublic.vue

This component is used as a wrapper for the directoryMain component to only display public stories.

###### 2.5.4 editGroup.vue

This component is the UI and logic for the group editing modal.

###### 2.5.5 editStory.vue

This component is the UI and logic for the story editing modal.

#### 2.6 Home

These components are used for the landing page.

###### 2.6.1 commitment.vue

This component contains logic and information for the animated text on the landing page

###### 2.6.2 homeContent.vue

This component is used for the layout of the animated text and the text 'commited to:'

###### 2.6.3 homeSide.vue

This component contains the layout and text of the box in the middle of the landing page.

###### 2.6.4 index.vue

This is the main component of the landing page. It encompasses all other components and the buttons.

#### 2.7 Map

These components are used for the main map page and contain all logic for the small side popups.

###### 2.7.1 BuildingCompare.vue

This component is used for the small quick pop up that offers infomation when comparing buildings in the map view

###### 2.7.2 ComparePrompt.vue

This component handles UI with the prompt telling you to select building to compare.

###### 2.7.3 map.vue

This component is used to display the map and polygons of buildings on the map.

###### 2.7.5 BuildingModal.vue

This component is the key of the map.

#### 2.8 Other

These objects are relevant for the entire application.

###### 2.8.1 navBar.vue

This component is the navbar at the top of all pages.

###### 2.8.2 App.vue

This is the main component of the application. All other components live inside this one.

---

### 3 Vuex Store

- [3.1 Layout](#31-layout)
- [3.2 Getters](#32-getters)
  - [3.2.1 story](#321-story)
  - [3.2.2 user](#322-user)
  - [3.2.3 stories](#323-stories)
  - [3.2.4 block](#324-block)
  - [3.2.5 chart](#325-chart)
  - [3.2.6 data](#326-data)
  - [3.2.7 mapPoint](#327-mappoint)
- [3.3 Mutations](#33-mutations)
  - [3.3.1 resetRemoved](#331-resetremoved)
  - [3.3.2 loadStory](#332-loadstory)
  - [3.3.3 loadStories](#333-loadstories)
  - [3.3.4 addGroup](#334-addgroup)
  - [3.3.5 deleteGroup](#335-deletegroup)
  - [3.3.6 updateGroup](#336-updategroup)
  - [3.3.7 addStory](#337-addstory)
  - [3.3.8 deleteStory](#338-deletestory)
  - [3.3.9 loadUser](#339-loaduser)
  - [3.3.10 loadBlock](#3310-loadblock)
  - [3.3.11 changeBlockName](#3311-changeblockname)
  - [3.3.12 setBlockId](#3312-setblockid)
  - [3.3.13 removeBlock](#3313-removeblock)
  - [3.3.14 loadChart](#3312-loadchart)
  - [3.3.15 setChartId](#3315-setchartid)
  - [3.3.16 removeChart](#3316-removechart)
  - [3.3.17 loadData](#3317-loaddata)
  - [3.3.18 modifyFlag](#3318-modifyflag)
- [3.4 Actions](#34-actions)
  - [3.4.1 story](#341-story)
  - [3.4.2 stories](#342-stories)
  - [3.4.3 buildings](#343-buildings)
  - [3.4.4 building](#344-building)
  - [3.4.5 block](#345-block)
  - [3.4.6 user](#346-user)
  - [3.4.7 addChart](#347-addchart)
  - [3.4.8 createGroup](#348-creategroup)
  - [3.4.9 updateGroup](#349-updategroup)
  - [3.4.10 deleteGroup](#3410-deletegroup)
  - [3.4.11 createStory](#3411-createstory)
  - [3.4.12 updateStory](#3412-updatestory)
  - [3.4.13 deleteStory](#3413-deletestory)
  - [3.4.14 createBlock](#3414-createblock)
  - [3.4.15 updateBlock](#3415-updateblock)
  - [3.4.16 deleteBlock](#3416-deleteblock)
  - [3.4.17 createChart](#3417-createchart)
  - [3.4.18 updateChart](#3418-createchart)
  - [3.4.19 deleteChart](#3419-deletechart)
  - [3.4.20 mapdata](#3420-mapdata)
  - [3.4.21 media](#3421-media)
  - [3.4.22 buildingMeters](#3422-buildingmeters)
  - [3.4.23 metersByBuilding](#3423-metersbybuilding)
  - [3.4.24 meterPoints](#3424-meterpoints)
  - [3.4.25 alerts](#3425-alerts)
  - [3.4.26 newAlert](#3426-newalert)
  - [3.4.27 updateAlert](#3427-updatealert)
  - [3.4.28 deleteAlert](#3428-deletealert)
  - [3.4.29 logout](#3429-logout)

#### 3.1 Layout

The base layout of the store contains three objects: user, stories and currentStory.

User is the simplest object only containing information about the current logged in user. This information is used for conditional rendering but this information is not used in any backend calls, a session is used instead.

Stories are an array of all stories currently accesible to the user. They contain only the base level of information.

currentStory contains the complete information of a story. It has the base level as well as all smaller levels. These are broken up into an array of blocks. A block corresponds to a graph. Inside the block is an array of charts which correponds to a dataset inside that graph. Each chart contains the meters which to pull data from and a place to store that data.

```
{
  currentStory: {
    name,
    description,
    id,
    media,
    public
    blocks: [
      {
        id,
        name,
        start,
        end,
        interval,
        unit,
        type,
        charts:[
          {
            point,
            name,
            meters: [
              {
                name,
                type,
                relation
              }
            ],
            data: [
              {
                time,
                value
              }
            ]
          }
        ]
      }
    ]
  },
  stories: [
    {
      id,
      group,
      stories: [
        {
          name,
          description,
          id,
          media,
          public
        }
      ]
    }
  ],
  user: {
    name,
    privilege
  }
}
```

#### 3.2 Getters

These getters are used to gather the basic elements from the Vuex store.

###### 3.2.1 story

- Parameters: none
- Post Conditions: none
- Returns: the currentStory object as described in the layout

###### 3.2.2 user

- Parameters: none
- Post Conditions: none
- Returns: the user object as described in the layout

###### 3.2.3 stories

- Parameters: none
- Post Conditions: none
- Returns: the stories object as described in the layout

###### 3.2.4 block

- Parameters: Int blockIndex
- Post Conditions: none
- Returns: the block object at the index specified in the currentStory

###### 3.2.5 chart

- Parameters: Int blockIndex, Int chartIndex
- Post Conditions: none
- Returns: the chart object at the specified indexes

###### 3.2.6 data

- Parameters: Int blockIndex, Int chartIndex
- Post Conditions: none
- Returns: the data for the chart object in the current story for the specified indexes.

###### 3.2.7 mapPoint

- Parameters: String point
- Post Conditions: none
- Returns: the corresponding full name with unit for the table column name.

#### 3.3 Mutations

These functions directly modify the Vuex store. For the most part they are not directly called (in fact I dont think they are at all), they are used during the Vuex actions. Actions should be used over the mutators as they also modify the apropriate DB instances.

###### 3.3.1 resetRemoved

- Parameters: none
- Post Conditions: the current story removed array is contains no elements
- Returns: nothing

###### 3.3.2 loadStory

- Parameters: Object (Matches currentStory layout)
- Post Conditions: The passed in object is loaded into the currentStory
- Returns: nothing

###### 3.3.3 loadStories

- Parameters: Object (Array of stories)
- Post Conditions: the passed in object is loaded into stories
- Returns: nothing

###### 3.3.4 addGroup

- Parameters: Object (simple story as shown in layout)
- Post Conditions: pushes the passed object to stories array
- Returns: nothing

###### 3.3.5 deleteGroup

- Parameters: Object `{ id: Integer }`
- Post Conditions: removes the object in the stories element with the specified id
- Returns: nothing

###### 3.3.6 updateGroup

- Parameters: Object `{ id: Integer, name: String }`
- Post Conditions: sets the name to the passed in objects name of the group contained in the stories that has a matching id
- Returns: nothing

###### 3.3.7 addStory

- Parameters: Object (matches story object in layout)
- Post Conditions: the object is pushed into the matching groups (specified by group_id in the passed object) stories
- Returns: nothing

###### 3.3.8 deleteStory

- Parameters: Object `{ group_id: Integer, id: Integer }`
- Post Conditions: deletes the matching story with the specified group and id from the stories array
- Returns: nothing

###### 3.3.9 loadUser

- Parameters: Object (matches user object in layout)
- Post Conditions: the object is placed into user object of the state. If the value is different from the current value then the stories object is also cleared.
- Returns: nothing

###### 3.3.10 loadBlock

- Parameters: Object (matches block object in layout)
- Post Conditions: the object is pushed into blocks array of the currentStory
- Returns: nothing

###### 3.3.11 changeBlockName

- Parameters: Object `{ index: Integer, name: String }`
- Post Conditions: the block's name at the specified index of the currentStory is changed to the specified name.
- Returns: nothing

###### 3.3.12 setBlockId

- Parameters: Object `{ index: Integer, id: Integer }`
- Post Conditions: the block's id at the specified index is changed to the specified id
- Returns: nothing

###### 3.3.13 removeBlock

- Parameters: Object `{ index: Integer }`
- Post Conditions: The block at the specified index is removed from the blocks object of the currentStory. If the object has a valid id, an object containing the type of element and id is moved to the removed array.
- Returns: nothing

###### 3.3.14 loadChart

- Parameters: Object (matches chart object in layout)
- Post Conditions: the object is pushed into the matching block's charts array
- Returns: nothing

###### 3.3.15 setChartId

- Parameters: Object `{ block_index: Integer, chart_index: Integer, id: Intger }`
- Post Conditions: the matching chart based on both indexes has its id updated to the specified value
- Returns: nothing

###### 3.3.16 removeChart

- Parameters: Object `{ block_index: Integer, chart_index: Integer }`
- Post Conditions: The chart object at the matching indexes is removed. If it has a valid id it is placed in the removed array.
- Returns: nothing

###### 3.3.17 loadData

- Parameters: Object `{ block_index: Integer, chart_index: Integer, data: Array }`
- Post Conditions: The matching chart object's data is populated by the specified array.
- Returns: nothing

###### 3.3.18 modifyFlag

- Parameters: Boolean
- Post Conditions: The currentStory modifyFlag is set to the specified value
- Returns: nothing

#### 3.4 Actions

Actions are called directly in components. These are used primarily for modifying state and communicating with the backend.

###### 3.4.1 story

- Parameters: Integer id
- Post Conditions: The current story is loaded with the story thats id matches what was specified. All fields are populated.
- Returns: A promise that resolves to the matching story when it is fully loaded

###### 3.4.2 stories

- Parameters: None
- Post Conditions: The stories array is populated with the public and logged in user's groups.
- Returns: A promise that resolves to the groups.

###### 3.4.3 buildings

- Parameters: None
- Post Conditions: None
- Returns: An array of meter configurations that make up a particular building.

###### 3.4.4 building

- Parameters: Object `{ blockIndex: Integer, chartIndex: Integer, group_id: Integer }`
- Post Conditions: Updates the specified chart to a new building.
- Returns: A promise that resolves to the updated block specified by the index.

###### 3.4.5 block

- Parameters: Object `{ index: Integer ... }` can contain any paramater as specified by the block object in the layout section
- Post Conditions: The block at the specified index is updated with the matching parameters and new data for that block is collected
- Returns: A promise that resolves to the updated block.

###### 3.4.6 user

- Parameters: None
- Post Conditions: The user object is populated.
- Returns: A promise that resolves to an object associated with the logged in user.

###### 3.4.7 addChart

- Parameters: Object (matches chart)
- Post Conditions: A chart is added to the corresponding index with data.
- Returns: Promise

###### 3.4.8 createGroup

- Parameters: Object (matches group but no id)
- Post Conditions: A group is created in the DB with the matching parameters
- Returns: A promise that resolves to the created groups id in the DB

###### 3.4.9 updateGroup

- Parameters: Object (matches group)
- Post Conditions: The group in the DB is updated with the specified parameters.
- Returns: Promise

###### 3.4.10 deleteGroup

- Parameters: Object `{ id: Integer }`
- Post Conditions: The group in the DB with the matching ID is deleted
- Returns: Promise

###### 3.4.11 createStory

- Parameters: Object `{ id: Integer }`
- Post Conditions: The group in the DB with the matching ID is deleted
- Returns: Promise

###### 3.4.12 updateStory

- Parameters: Object (matches story)
- Post Conditions: The story in the DB is updated with the specified values
- Returns: Promise

###### 3.4.13 deleteStory

- Parameters: Object `{ id: Integer }`
- Post Conditions: The story in the DB with the matching ID is deleted
- Returns: Promise

###### 3.4.14 createBlock

- Parameters: Object (matches block)
- Post Conditions: A block is created in the DB with the matching values
- Returns: Promise that resolves to the created objects ID

###### 3.4.15 updateBlock

- Parameters: Object (matches block)
- Post Conditions: The block is updated in the DB
- Returns: Promise

###### 3.4.16 deleteBlock

- Parameters: Object `{ id: Integer }`
- Post Conditions: The block in the DB with the matching ID is deleted
- Returns: Promise

###### 3.4.17 createChart

- Parameters: Object (matches block)
- Post Conditions: A chart is created in the DB with the matching values
- Returns: Promise that resolves to the created objects ID

###### 3.4.18 updateChart

- Parameters: Object (matches block)
- Post Conditions: The chart is updated in the DB
- Returns: Promise

###### 3.4.19 deleteChart

- Parameters: Object `{ id: Integer }`
- Post Conditions: The chart in the DB with the matching ID is deleted
- Returns: Promise

###### 3.4.20 mapData

- Parameters: None
- Post Conditions: None
- Returns: Promise that resolves to an Object containing the polygon information that is used on the map

###### 3.4.21 media

- Parameters: None
- Post Conditions: None
- Returns: A promise that resolves to an array listing the file names of available pictures for a story.

###### 3.4.22 buildingMeters

- Parameters: `{ id: Integer }`
- Post Conditions: None
- Returns: A promise that resolves to an array listing the meters for a particular building.

###### 3.4.23 metersBybuilding

- Parameters: None
- Post Conditions: None
- Returns: A promise that resolves to an object with the keys being the building names and the values an array of the meters contained by that building.

###### 3.4.24 meterPoints

- Parameters: `{ id: Integer }`
- Post Conditions: None
- Returns: A promise that resolves to an array listing the points that the meter collects data for.

###### 3.4.25 alerts

- Parameters: None
- Post Conditions: None
- Returns: A promise that resolves to an array of alerts the user has.

###### 3.4.26 newAlert

- Parameters: Object `{ meter_id: Integer, point: String, threshold: Number}`
- Post Conditions: an alert entry is created in the DB
- Returns: A promise that resolves to the id of the created alert.

###### 3.4.27 updateAlert

- Parameters: Object `{ id: Integer, meter_id: Integer, point: String, threshold: Number}`
- Post Conditions: The alert is updated in the DB
- Returns: Promise

###### 3.4.28 deleteAlert

- Parameters: Object `{ id: Integer }`
- Post Conditions: The alert is deleted from the DB
- Returns: Promise

###### 3.4.29 logout

- Parameters: None
- Post Conditions: The user is logged out of the server. The local user object is cleared. The user is logged out of OSU CAS.
- Returns: Promise

---

## 4 Testing

Two types of testing are paired with this energy dashboard to ensure that the deployment scheme does not accidentally push breaking changes. Testing coverage is currently small but is continually updated to get to a goal of 90% coverage.

#### Unit Testing

Unit testing for the energy dashboard is done through [Jest](https://jestjs.io/en/).

##### Vuex Testing

The Vuex store is one of the most important components to test and one of the most complicated. This module is usually associated with our backend API. Jest, has a nice feature to mock our API functions and return on disk data. This layout can be seen in the directory [store/\_\_mocks\_\_](https://github.com/OSU-Sustainability-Office/energy-dashboard/tree/master/src/store/__mocks__). In this directory is the api.js file which overrides the default modules functionality during testing.

##### Componenent Testing

Jest also allows for dynamic component rendering during testing. Currently none of these tests are implemented but there are plans to implement them.

#### Integration Testing

Integration testing is done through the [BrowserStack](https://www.browserstack.com). After a succesful push to the devlopment S3 bucket BrowserStack is ran and the output of the test is saved as a check that becomes transparent during a master branch merge on GitHub.

<img src="https://p14.zdusercontent.com/attachment/1015988/nkChJRSujn816fhQEYhmy7Gdt?token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..6LAi9465YrwSaAz_zWV7xA.H-Q-itcCZoAb6iNxFdET6YuGVYQEXYg5tmRRoq0wi8uANWapoYMkzigrCyEu7LCRSmkfwwFiz164eMfvFlU7OHI8y2VPN5DVuQqIGiY68UBjfNscErII7ksrHQk9jKc7nhkmmjgX3wCqYFF_3ceOUcSa2JtOT-oS9GubEFpGLeVvP59pxv4jzUUphwyoRVT0ICv5C3Fkrr1xgKs_sRA956BaUu3v1fNLVyw2eg1TAW9yil5_o14cFK6MrcTv6NbC2drRRWwvflcU3VBGD4N_tX3RmFhoTygVriOucguWLqQ.YRCmhj8ZxqFTcrt2_L0IVQ" width="200">

---

## 5 Deployment

The Energy Dashboard uses a continuous integration scheme through Travis CI to deploy quickly and painlessly.

#### Dev Deployment

When a branch is pushed to GitHub Travis CI hooks into the push and begins running. Travis first tests the package with unit tests as described above. On success of the unit tests the package is built. If successful, the application will be uploaded to the gh-pages branch of the repo, updating our github-pages display. We used to have an S3 bucket display a test-build but it's currently defunct.

#### Production Deployment

Production deployment happens when a branch is merged into master. During this Travis CI is told once again to process the package. The same actions above are taken except the aplication is also deployed to the gh-pages branch of this repo. The gh-pages branch is set up for static hosting and our domain name is pointed to this page.
