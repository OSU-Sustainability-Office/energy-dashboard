<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-02-04T11:40:29-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-02-11T09:06:12-08:00
-->
<template>
  <el-row class='campaignlistview'>
    <el-tabs v-model="activePane">
      <el-tab-pane label="Current Campaigns" name="new" ref='currentTab' class='list'>
        <campaignBlock v-for='campaign in currentCampaigns' :camp='campaign' :key='campaign.id' @click='$router.push("/campaign/" + campaign.id)'/>
        <span class='noText' v-if='currentCampaigns.length <= 0'>
          No Current Campaigns
        </span>
      </el-tab-pane>
      <el-tab-pane label="Past Campaigns" name="old" ref='pastTab' class='list'>
        <campaignBlock v-for='campaign in pastCampaigns' :camp='campaign' :key='campaign.id' @click='$router.push("/campaign/" + campaign.id)'/>
        <span class='noText' v-if='pastCampaigns.length <= 0'>
          No Past Campaigns
        </span>
      </el-tab-pane>
    </el-tabs>
  </el-row>
</template>
<script>
import campaignBlock from '@/components/campaigns/campaign_list_block'
export default {
  components: {
    campaignBlock
  },
  data () {
    return {
      activePane: 'new',
      currentCampaigns: [],
      pastCampaigns: []
    }
  },
  async mounted () {
    // await this.$store.dispatch('map/allBuildingPromise')
    await this.$store.dispatch('campaigns/loadCampaigns')
    // this.$store.dispatch('campaigns/getCampaigns').then(campaigns => {
    for (let camp of this.$store.getters['campaigns/campaigns']) {
      if (this.checkDate(camp.dateEnd)) {
        this.currentCampaigns.push(camp)
      } else {
        this.pastCampaigns.push(camp)
      }
    }
    this.currentCampaigns.sort((a, b) => { return (new Date(b.dateEnd)).getTime() - (new Date(a.dateEnd)).getTime() })
    this.pastCampaigns.sort((a, b) => { return (new Date(b.dateEnd)).getTime() - (new Date(a.dateEnd)).getTime() })
    // })
  },
  methods: {
    checkDate: function (end) {
      return (new Date()).getTime() < (new Date(end)).getTime()
    }
  }
}

</script>
<style scoped lang='scss'>
.campaignlistview {
  padding: 1em;
}
.list {
  padding: 1em;
  text-align: center;
}
.noText {
  font-size: 24px;
}
</style>
