module.exports = {
	grid: {
		x: 40, // 20
		x2: 20, // 20
		y: 45, // 20
		y2: 20, // 0
		borderWidth: 0,
		borderColor: 'transparent'
	},
	categoryAxis: {
		boundaryGap: false,
		axisTick: false,
		axisLabel: {
			show: true,
			margin: 10,
			textStyle: {
				align: 'center',
				fontSize: 11,
				fontFamily: 'soleil'
			}
		}
	},
	valueAxis: {
		boundaryGap: false,
		axisTick: false,
		axisLabel: {
			margin: 10,
			textStyle: {
				align: 'right',
				fontSize: 11,
				fontFamily: 'soleil'
			}
		}
	},
	line: {
		z: 5
	}
}
