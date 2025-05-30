<!--
  Filename: CampaignList.vue
  Description: Display a list of current and past campaigns.
-->
<template>
  <el-row class="campaignlistview">
    <el-tabs v-model="activePane">
      <el-tab-pane label="Current Campaigns" name="new" ref="currentTab" class="list">
        <CampaignListItem
          v-for="campaign in currentCampaigns"
          :camp="campaign"
          :key="campaign.id"
          @click="$router.push('/campaign/' + campaign.id)"
        />
        <span class="noText" v-if="currentCampaigns.length <= 0 && loaded"> No Current Campaigns </span>
        <span class="noText" v-if="!loaded"> Loading... </span>
      </el-tab-pane>
      <el-tab-pane label="Past Campaigns" name="old" ref="pastTab" class="list">
        <CampaignListItem
          v-for="campaign in pastCampaigns"
          :camp="campaign"
          :key="campaign.id"
          @click="$router.push('/campaign/' + campaign.id)"
        />
        <span class="noText" v-if="pastCampaigns.length <= 0 && loaded"> No Past Campaigns </span>
        <span class="noText" v-if="!loaded"> Loading... </span>
      </el-tab-pane>
    </el-tabs>
  </el-row>
</template>
<script>
import CampaignListItem from '@/components/campaigns/CampaignListItem.vue'
export default {
  components: {
    CampaignListItem
  },
  data() {
    return {
      loaded: false,
      activePane: 'new',
      currentCampaigns: [],
      pastCampaigns: []
    }
  },
  async mounted() {
    await this.$store.dispatch('campaigns/loadCampaigns')
    this.loaded = true
    for (let camp of this.$store.getters['campaigns/campaigns']) {
      if (this.checkDate(camp.dateEnd) && !camp.name.toLowerCase().startsWith('test')) {
        console.log(this.checkDate(camp.dateEnd))
        this.currentCampaigns.push(camp)
      } else if (!camp.name.toLowerCase().startsWith('test')) {
        this.pastCampaigns.push(camp)
      } else if (
        this.checkDate(camp.dateEnd) &&
        camp.name.toLowerCase().startsWith('test') &&
        import.meta.env.VITE_HOST_ADDRESS === 'http://localhost:8080'
      ) {
        this.currentCampaigns.push(camp)
      } else if (
        camp.name.toLowerCase().startsWith('test') &&
        import.meta.env.VITE_HOST_ADDRESS === 'http://localhost:8080'
      ) {
        this.pastCampaigns.push(camp)
      }
    }
    this.currentCampaigns.sort((a, b) => {
      return new Date(b.dateEnd).getTime() - new Date(a.dateEnd).getTime()
    })
    this.pastCampaigns.sort((a, b) => {
      return new Date(b.dateEnd).getTime() - new Date(a.dateEnd).getTime()
    })
  },
  methods: {
    checkDate: function (end) {
      return new Date().getTime() < new Date(end).getTime()
    }
  }
}
</script>
<style scoped lang="scss">
.campaignlistview {
  padding: 1em;
  display: block;
}
.list {
  padding: 1em;
  text-align: center;
}
.noText {
  font-size: 24px;
}
</style>
