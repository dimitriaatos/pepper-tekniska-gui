import { Client, Server } from 'node-osc/dist/lib'
const fs = require('fs')
const Video = require('./video').default

// const axios = require('axios').default

const video = new Video()

const osc = (win) => {

	const filepath = 'data.json'
	

	// const remoteSave = (data) => {
	// 	try {
	// 		axios.post('https://idgenerator.xyz/pepper-data', data || JSON.parse(fs.readFileSync(filepath, 'utf8')))
	// 	} catch (error) {
	// 		console.log(error)
	// 	}
	// }

	// fs.writeFileSync('data.json', '{"los": "nai"}')
	video.init()

	const client = new Client('192.168.1.111', 3001)
	// const client = new Client('127.0.0.1', 3001)

	const oscServer = new Server(3003, '127.0.0.1', () => {
		console.log('OSC Server is listening');
	});

	oscServer.on('/pepperstop', () => {
		win.webContents.send('stop', true)
		// video.stop()
	});

	const { ipcMain } = require('electron')

	ipcMain.on('save', (event, id, data) => {
		let savedData = JSON.parse(fs.readFileSync(filepath, 'utf8') || "{}")
		savedData[id] = data
		fs.writeFileSync(filepath, JSON.stringify(savedData))
		// remoteSave(savedData)
	})

	ipcMain.on('play', (event, {scene, move, sound}) => {
		// client.send(`/pepper/${scene}/${move}/${sound}`, 'a', () => {
		// })
		video.play(scene)
		const fixed = [scene, move, sound].map(e => e+1)
		console.log(fixed)
		client.send(`/pepper`, fixed, () => {
		})
		// setTimeout(() => {
		// 	event.sender.send('stop', true)
		// 	// video.stop()
		// }, 400)
	})

	ipcMain.on('stop', () => {
		video.stop()
	})

	ipcMain.on('load', (event, id) => {
		let data = JSON.parse(fs.readFileSync(filepath, 'utf8'))
		event.returnValue = data[id] || false
	})

	ipcMain.on('kid', (event) => {
		const leadingZeros = (number, size) => {
			let string = String(number)
			while (string.length < (size || 2)) {string = '0' + string}
			return string
		}
		const day = new Date().getDay()
		const wrap = 100
		const week = JSON.parse(fs.readFileSync('kidIncrement.json', 'utf8'))
		week[day] = week[day] + 1
		fs.writeFileSync('kidIncrement.json', JSON.stringify(week))
		const letter = String.fromCharCode(Math.floor(week[day] / wrap)+65)
		const number = week[day] % wrap
		event.returnValue = letter+leadingZeros(number)
	})

	// setInterval(remoteSave, 5*60*1000)
}

export default osc