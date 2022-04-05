<!-- Filename: App.vue -->
<script setup>
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale
);
</script>
<template>
  <span>
    <header>
      <div class="wrapper">
        <h1>Banner Here</h1>
      </div>
    </header>
    <main>
      <span v-if="loaded">
        <h2>Leaderboard</h2>
        <!--Leaderboard here-->
      </span>
      <span v-if="loaded">
        <h2>Chart here</h2>
        <!--Chart here w/ options-->
        <Line v-if="loaded" :chart-data="chartData" />
      </span>
      <span v-if="!loaded">
        <h2>Loading... {{ status }}</h2>
      </span>
    </main>
  </span>
</template>
<script>
const API_URL = "https://api.sustainability.oregonstate.edu/v2/energy";

export default {
  data: () => ({
    current: {},
    baseline: {},
    meterGroupMetadata: {},
    activeCampaign: null,
    loaded: false,
    status: "Fetching OSU building data...",
    styleC: {
      display: "inline-block",
      width: "98%",
      height: "340px",
      "padding-right": "0.5em",
      "padding-left": "0.5em",
      "padding-top": "1em",
    },
    chartData: [],
  }),
  created() {
    this.setupCampaign();
  },
  methods: {
    async setupCampaign() {
      // fetch building & campaign data from API
      const buildingData = await this.callAPI("allbuildings");
      console.log(buildingData.length);
      this.status = "Fetching campaign data...";
      const campaigns = await this.callAPI("campaigns");
      // just keep the meter group -> meter mappings
      for (let building of buildingData) {
        for (let mg of building.meterGroups) {
          this.meterGroupMetadata[mg.id] = mg.meters;
        }
      }
      this.activeCampaign = campaigns[campaigns.length - 1];

      // Need to do a little date normalization to make UTC time PST time.
      const dateStart = Math.floor(
        (new Date(this.activeCampaign.dateStart).getTime() -
          new Date().getTimezoneOffset() * 60 * 1000) /
          1000
      );
      const dateEnd = Math.floor(
        (new Date(this.activeCampaign.dateEnd).getTime() -
          new Date().getTimezoneOffset() * 60 * 1000) /
          1000
      );
      const compareStart = Math.floor(
        new Date(this.activeCampaign.compareStart).getTime() / 1000
      );
      const compareEnd = Math.floor(
        new Date(this.activeCampaign.compareEnd).getTime() / 1000
      );

      let count = 1;
      this.status = `Collecting data for ${count}/${this.activeCampaign.meterGroupIDs.length} buildings...`;
      for (let meterGroup of this.activeCampaign.meterGroupIDs) {
        // 1. find meters referenced in campaign meter-group
        for (let meter of this.meterGroupMetadata[meterGroup]) {
          // 2. get baseline data
          const baseline = await this.callAPI(
            `data/?id=${meter.id}&startDate=${compareStart}&endDate=${compareEnd}&point=accumulated_real&meterClass=${meter.classInt}`
          );
          // 3. get current data
          const current = await this.callAPI(
            `data/?id=${meter.id}&startDate=${dateStart}&endDate=${dateEnd}&point=accumulated_real&meterClass=${meter.classInt}`
          );
          // 4. store data sets
          // Assuming no multi-meter group.
          this.current[meter.id] = new Map();
          this.baseline[meter.id] = new Map();
          // chart data map building meter group -> % difference
          for (let i = 1; i < baseline.length; i++) {
            this.baseline[meter.id].set(
              baseline[i].time,
              baseline[i].accumluated_real - baseline[i - 1].accumluated_real
            );
          }
          this.chartData[meterGroup] = [];
          for (let i = 1; i < current.length; i++) {
            this.current[meter.id].set(
              current[i].time,
              current[i].accumluated_real - current[i - 1].accumluated_real
            );
            // 5. get % difference from baseline.
            this.chartData[meterGroup] =
              (this.current[meter.id].get(current[i].time) /
                this.baseline[meter.id].get(
                  baseline[i % current.length].time
                )) *
              100;
          }
          count++;
          this.status = `Collecting data for ${count}/${this.activeCampaign.meterGroupIDs.length} buildings...`;
        }
      }
      // 6. finally push data into chartJS friendly format!
      console.log(this.current, this.baseline);
      // Perform computations versus baseline.
      // And then we're ready to hand off the data-set to ChartJS.
      this.loaded = true;
    },
    // just hits API endpoint.
    async callAPI(route) {
      return await (await fetch(`${API_URL}/${route}`)).json();
    },
  },
};
</script>
<style>
</style>
