import { Line, mixins } from 'vue-chartjs'

export default {
	name: 'linechart',
	extends: Line,
	mixins: [mixins.reactiveProp],
	props: [],
	data() {
		return {
			datacollection: null
		}
	},
	mounted () {
		this.renderChart(this.chartData, this.options);
	},
	methods: {
		setOptions: function(opts) {
			this.options = opts;
			console.log(opts);
			this.update();
		}
	}
}