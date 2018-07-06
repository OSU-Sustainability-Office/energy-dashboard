import { Line, mixins } from 'vue-chartjs'

export default {
	name: 'linechart',
	extends: Line,
	mixins: [mixins.reactiveProp],
	props: [],
	data() {
	    return {
	      options: {
	      	layout: {
	          padding: {
	            left: 0,
	            right: 0,
	            bottom: 0,
	            top: 0
	          }
	        },
					legend: {
						labels: {
							fontColor: 'white'
						}
					},
					title: {
						fontColor: 'white'
					},
	        responsive: true, // my new default options
	        maintainAspectRatio: false, // my new default options
	        scales: {
	          yAxes: [{
	            ticks: {
	              beginAtZero: false,
								fontColor: 'white'
	            },

	            gridLines: {
	              display: true // my new default options
	            }
	          }],
	          xAxes: [{
	            gridLines: {
	              display: false,
	            },
							ticks: {
								fontColor: 'white'
							},
	            type: 'time',
	            time: {
	              unit: 'hour',
	              unitStepSize: 12,
	              displayFormats: {
	                'hour': 'M/DD h:00 a'
	              }
	            }
	          }]
	        }
	      }
	  }
	},
	mounted () {
		this.renderChart(this.chartData, this.options);
	},
	watch: {
		// chartData: function(value) {
		// 	this.renderChart(value);
		// }
	},
	methods: {
		setOptions: function(opts) {
			this.options = opts;
			this.renderChart(this.chartData, this.options);
		},
		update: function() {
			this.$data._chart.update();
		}
	}
}
