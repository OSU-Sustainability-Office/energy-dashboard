<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-02-04T11:40:29-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-02-08T14:43:11-08:00
-->
<template>
  <el-row class='campaignlistview'>
    <el-tabs v-model="activePane">
      <el-tab-pane label="Current Campaigns" name="new" ref='currentTab' class='list'>
        <campaignBlock v-for='campaign in currentCampaigns' :name='campaign.name' :media='campaign.media' :start='campaign.date_start' :end='campaign.date_end' :key='campaign.id' @click='$router.push("/campaign/" + campaign.id)'/>
        <span v-if='currentCampaigns.length <= 0'>
          No Current Campaigns
        </span>
      </el-tab-pane>
      <el-tab-pane label="Past Campaigns" name="old" ref='pastTab' class='list'>
        <campaignBlock v-for='campaign in pastCampaigns' :name='campaign.name' :media='campaign.media' :start='campaign.date_start' :end='campaign.date_end' :key='campaign.id' @click='$router.push("/campaign/" + campaign.id)'/>
        <span v-if='pastCampaigns.length <= 0'>
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
  created () {
    this.$store.dispatch('campaigns').then(r => {
      for (let camp of r) {
        if (this.checkDate(camp.date_end)) {
          this.currentCampaigns.push(camp)
        } else {
          this.pastCampaigns.push(camp)
        }
      }
    })
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
}
</style>
