<template>
	<div class="container">
		<button
		v-if="page!='id'"
		class="close"
		:class="{disabled: playing}"
		@click="close"
	>x</button>
		<div v-if="page=='id'">
			<input
				class="idInput"
				type="text"
				name="id"
				placeholder="ID"
				:value="id"
				@input="setID"
				@change="setID"
			>
			<Keyboard class="keyboard" :input="id" @onChange="onChange"/>
			<button
			class="next playButton"
			:class="{disabled: id.length != 6}"
			@click="start()"
			><span class="arrow">→</span></button>
		</div>
		<div v-else-if="page=='longOrShort'" class="longOrShort">
			<div>
				<button @click="setShort(true)">
					<b>Kort</b>
					<div>Short</div>
					<div class="length">1 min</div>
				</button>
				<button @click="setShort(false)">
					<b>Lång</b>
					<div>Long</div>
					<div class="length">3 min</div>
				</button>
			</div>
		</div>
		<div v-else-if="page=='questions'" class="choose">
			<h1><b>{{ sceneData[index.scene].text.se }}</b> <span class="progress">{{ progress }}/{{ choices }}</span><br>{{ sceneData[index.scene].text.en }}</h1>
			<div class="playButtons">
				<button
					v-for="(buttonIndex) in arrayOfLength(number.sounds)"
					:key="buttonIndex"
					class="playButton"
					:class="{selected: buttonIndex == index.sound && playing, disabled: playing}"
					@click="play(buttonIndex)"
				>{{buttonIndex + 1}} <span class="tick" :class="{ticked: tried[buttonIndex] && !playing}">☑️</span></button>
			</div>
			<div
				class="questions"
				:class="{ hide: !triedAll }"
			>
				<div
					v-for="(texts, questionIndex) in shortenedQuestionText"
					:key="questionIndex"
					class="question"
				>
					<div class="questionText"><b>{{ texts.se }}</b><br>{{ texts.en }}</div>
					<div class="choiceButtons">
						<button
							v-for="(choiceButtonIndex) in arrayOfLength(number.sounds)"
							:key="choiceButtonIndex"
							class="choiceButton"
							:class="{selected: choiceButtonIndex == currentAnswers[questionIndex]}"
							@click="choose(questionIndex, choiceButtonIndex)"
						>{{choiceButtonIndex + 1}}</button>
						<button
							class="choiceButton cantChoose"
							:class="{selected: currentAnswers[questionIndex] == 'no answer'}"
							@click="choose(questionIndex, 'no answer')"
						><b>Ingen skillnad</b><br>No difference</button>
					</div>
				</div>
			</div>
			<button
				class="next"
				:class="{disabled: playing || !allAnswered }"
				@click="next"
			><span class="arrow">→</span></button>
			<div class="displayID">{{ id }}</div>
		</div>
		<div v-else-if="page=='prompt'" class="prompt">
			<!-- <h2>Do you want to keep going?</h2> -->
			<div class="buttons">
				<button @click="prompt(false)"><b>Avsluta</b><br>Finish</button>
				<button @click="prompt(true)"><b>Fortsätt till nästa scen</b><br>Go to the next scene</button>
			</div>
		</div>
		<div v-else-if="page=='end'" class="end">
			<h1>Tack!</h1>
			<h2>NAVET</h2>
			<img src="./../../assets/logos.jpg" alt="">
		</div>
		<div class="progressBar"><span /></div>
	</div>
</template>

<script>
import { ipcRenderer } from 'electron'
import questionary from '@/assets/scenes.json'
import arrayShuffle from 'array-shuffle/index.js'

import Keyboard from "./Keyboard"

const sceneData = questionary.scenes
const questionText = questionary.questions

const initAnswers = (number, short) => {

		const questions = new Array(number.questions).fill(-1)
		const makeMoves = () => new Array(number.moves).fill(0).map(() => ({questions: [...questions]}))
		const scenes = new Array(number.scenes).fill(0).map(() => ({moves: makeMoves()}))
		return {scenes, short}
}

function safeSplice(array, start, deleteCount, ...replace) {
  const removed = array.splice(start, deleteCount, ...replace)
  return { 
    array: array,
    removed: removed,
  }
} 

const initNumber = {
	scenes: sceneData.length,
	moves: 3,
	sounds: 3,
	questions: 2,
}

const setNumbers = (short) => {

	let num = initNumber

	if (short) {
		num = {...num, questions: 2, moves: 1}
	} else {
		num.questions = {...num, questions: 4, moves: 2}
	}

	return num
}

export default {
	components: {
		Keyboard,
	},
	data() {
		return {
			id: '',
			questionText,
			sceneData,
			number: initNumber,
			...this.reset(initNumber, true)
		}
	},
	computed: {
		allAnswered(){
			let res = true
			for (let i = 0; i < this.number.questions; i++) {
				console.log(this.currentAnswers, this.currentAnswers[i])
				if (this.currentAnswers[i] == -1) {
					res = false
				}
			}
			return res
		},
		shortenedQuestionText() {
			return this.answers.short ? safeSplice(this.questionText, 0, 2).array : this.questionText
		},
		currentAnswers(){
			return this.answers
				.scenes[this.scenes[this.index.scene]]
				.moves[this.index.move]
				.questions.map((e) => e != 'no answer' ? this.sounds.indexOf(e) : 'no answer' || -1)
		},
		triedAll(){
			if (this.playing) {
				return this.lastTriedAll
			} else {
				return this.tried.reduce((accum, value) => accum + value, 0) == this.tried.length
			}
		},
		progress: {
			get(){
				return this.index.move + 1 + this.index.scene * this.number.moves
			},
			set(newProgress){
				this.index.move = (newProgress - 1) % this.number.moves
				this.index.scene = Math.floor((newProgress - 1) / this.number.moves)
			}
		},
		choices() {
			return this.number.scenes * this.number.moves
		}
	},
	watch: {
		triedAll(val) {
			this.lastTriedAll = val
		}
	},
	mounted(){
		// When the robot stops moving
		ipcRenderer.on('stop', () => {
			this.playing = false
		})
	},
	methods: {
		setShort(short) {
			this.answers.short = short
			this.number = setNumbers(this.answers.short)

			Object.assign(this, this.reset(this.number, short))
			this.page = 'questions'
		},
		prompt(state) {
			if (state) {
				this.page = 'questions'
			} else {
				this.page = 'end'
			}
		},
		reset(num, short){
			return {
				answers: initAnswers(num, short),

				number: num,
				index: {
					scene: 0,
					move: 0,
					sound: -1,
				},
				scenes: arrayShuffle(this.arrayOfLength(num.scenes)),
				moves: this.arrayOfLength(num.moves),
				sounds: arrayShuffle(this.arrayOfLength(num.sounds)),
				page: 'id',
				tried: new Array(num.sounds).fill(0),
				playing: false,
				lastTriedAll: false
			}
		},
		start(){
			const savedData = ipcRenderer.sendSync('load', this.id)
			if (savedData) {
				Object.assign(this, this.reset(setNumbers(savedData.answers.short), savedData.answers.short))
				this.answers = savedData.answers
				this.progress = savedData.metadata.progress
				this.tried = savedData.metadata.tried
				Object.assign(this, savedData.metadata.order)
				this.page = 'questions'
			} else {
				this.page = 'longOrShort'
			}
		},
		arrayOfLength(l){
			return new Array(l).fill(0).map((e, i) => i)
		},
		setID({target: {value}}){
			this.id = value
		},
		onChange(input) {
			this.id = input
		},
		play(index){
			this.index.sound = index
			this.tried = this.tried.map((e, i) => this.index.sound == i ? 1 : e)
			ipcRenderer.send('play', {scene: this.scenes[this.index.scene], move: this.index.move, sound: this.sounds[this.index.sound]})
			this.playing = true
			
		},
		next(){
			if (this.choices == this.progress) {
				this.page = 'end'
			}
			if (this.progress == this.number.moves) {
				this.page = 'prompt'
			}
			this.index.scene = this.number.moves == this.index.move + 1 ? this.index.scene + 1 : this.index.scene
			this.index.move = (this.index.move + 1) % this.number.moves
			this.tried = new Array(this.number.sounds).fill(0)
				this.sounds = arrayShuffle(this.arrayOfLength(this.number.sounds))
		},
		choose(questionIndex, soundIndex){
			//getting the real indexes
			this.answers
				.scenes[this.scenes[this.index.scene]]
				.moves[this.index.move]
				.questions.splice(questionIndex, 1, soundIndex != 'no answer' ? this.sounds[soundIndex] : 'no answer')
		},
		close(){
			this.page = 'id'
			ipcRenderer.send('save', 
				this.id,
				{
					answers: this.answers,
					metadata: {
						progress: this.progress,
						tried: this.tried,
						order: {
							scenes: this.scenes,
							moves: this.moves,
							sounds: this.sounds,
						}
					},
					timestamp: new Date(),
				}
			)
			this.id = ''
		}
	},
}
</script>

<style scoped>

	.container {
		user-select: none;
	}

	.displayID {
		bottom: 0;
		left: 0;
		padding: 1vmin;
		position: fixed;
	}

	.idInput {
		margin: auto;
		font-size: 8vw;
		outline: none;
		text-align: center;
		border: 5px solid black;
	}

	.idInput::placeholder {
		color: rgb(230, 230, 230);
	}

	h1 {
		font-weight: 100;
		text-align: center;
		margin-bottom: 10px;
	}

	.choiceButtons {
		display: flex;
		justify-content: center;
	}

	.questions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}

	.hide {
		display: none;
	}

	.questionText {
		display: block;
		text-align: center;
		font-size: 3vmin;
		margin-top: 4vh;
	}

	.question {
		margin: 0 1vw;
	}

	.choiceButton {
		border-radius: 50%;
		width: 12vmin;
		height: 12vmin;
		font-size: 5vmin;
		border: none;
		outline: none;
	}

	.playButtons {
		display: flex;
		justify-content: center;
	}

	.playButton {
		width: 17vmin;
		height: 17vmin;
	}

	button {
		background-color: black;
		font-size: 10vmin;
		color: white;
		outline: none;
		margin: 10px;
		position: relative;
		cursor: pointer;
	}

	button:active {
		color: black;
		background-color: white;
	}

	.cantChoose {
		font-size: 3vmin;
		border-radius: 20%;
		padding: 1vmin;
		width: inherit;
	}

	.selected {
		border: rgb(51, 146, 255) 8px solid;
		/* outline: black 2px solid; */
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
		position: fixed;
		bottom: 30px;
		right: 30px;
		width: 20vmin;
		height: 20vmin;
	}

	.arrow {
		font-size: 14vmin;
		line-height: 1px;
	}

	.tick{
		position: absolute;
		top: 0;
		right: 4px;
		font-size: 20px;
		display: none;
	}

	.ticked{
		display: block;
	}

	.progressBar {
		display: none;
		height: 1px;
		position: relative;
		background-color: black;
		width: 100vw;
	}

	.progressBar > span {
		height: 100%;
		background-color: blue;
		position: absolute;
		top: 0;
		left: 0;
		right: 300px;
		display: none;
	}

	.end {
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: center;
		align-items: center;
	}

	.end img {
		/* width: 30vmin; */
		height: 30vmin;
	}

	.end h2 {
		font-size: 10vmin;
		text-align: center;
	}

	.close {
		position: fixed;
		font-size: 6vmin;
		background-color: rgba(1,1,1,0);
		color: black;
		border: none;
		top: 0;
		right: 0;
		width: inherit;
		height: inherit;
	}

	.close:active {
		color: inherit;
		background-color: inherit;
	}

	.progress {
		font-size: 2vmin;
		text-justify: center;
	}

	.prompt {
		font-size: 4vmin;
	}

	.buttons button {
		padding: 3vmin;
		font-size: 6vmin;
	}

	.buttons {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.longOrShort {
		font-size: 1vmin;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.longOrShort button {
		padding: 3vmin;
	}

	.length {
		font-size: 3vmin;
	}
</style>
