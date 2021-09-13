<template>
	<div class="container">
		<div v-if="!end" class="choose">
			<button
				v-for="(option, index) in options"
				:key="index"
				class="options"
				:class="{selected: index == choiceIndex}"
				@click="play(index)"
			>{{index + 1}}</button>
			<button
				class="next"
				:class="{disabled: choiceIndex < 0}"
				@click="choose"
			><span class="arrow">→</span></button>
		</div>
		<div v-else class="end">Tack</div>
	</div>
</template>

<script>
import { ipcRenderer } from 'electron'
import scenarios from '@/assets/options.json'
import arrayShuffle from 'array-shuffle/index.js'

export default {
	components: {
	},
	data () {
		const suffeldScenarios = arrayShuffle(scenarios)
		return {
			suffeldScenarios,
			scenarioIndex: 0,
			options: arrayShuffle(Array(suffeldScenarios[0].options).fill(0).map((e, i) => i)),
			choiceIndex: -1,
			choices: [],
			end: false,
			tried: [],
		}
	},
	methods: {
		play(index){
			this.choiceIndex = index
			ipcRenderer.send('play', {id: this.suffeldScenarios[this.scenarioIndex].id, index: this.options[this.choiceIndex]})
		},
		choose(){
			this.scenarioIndex++
			this.tried = []
			if (this.scenarioIndex < this.suffeldScenarios.length) {
				this.choices.push({id: this.options[this.scenarioIndex].id, choice: this.options[this.choiceIndex]})
				this.choiceIndex = -1
				this.options = arrayShuffle(Array(this.suffeldScenarios[this.scenarioIndex].options).fill(0).map((e, i) => i))
			} else {
				this.end = true
				ipcRenderer.send('save', this.choices)
				this.choiceIndex = -1
				this.scenarioIndex = 0
			}
		},
		restart(){
			this.end = false
		}
	}
}
</script>

<style scoped>

	/* .container {
		width: 100%;
	} */

	button {
		width: 20vmin;
		height: 20vmin;
		background-color: black;
		font-size: 10vmin;
		color: white;
		outline: none;
		margin: 10px;
	}

	button:active {
		color: black;
		background-color: white;
	}

	.selected {
		border: rgb(51, 146, 255) 8px solid;
		outline: black 2px solid;
		color: black;
		background-color: white;
	}

	.disabled {
		pointer-events: none;
		color: rgb(180, 180, 180);
		background-color: rgb(214, 214, 214);
	}

	.next {
		border-radius: 50%;
		position: absolute;
		bottom: 30px;
		right: 30px;
	}

	.arrow {
		font-size: 14vmin;
		line-height: 1px;
	}
</style>
