import { Client, Server } from 'node-osc/dist/lib'
const fs = require('fs')
const Video = require('./video').default

const axios = require('axios').default

const video = new Video()

const osc = (win) => {

	const filepath = 'data.json'
	

	const remoteSave = (data) => {
		try {
			axios.post('https://idgenerator.xyz/pepper-data', data || JSON.parse(fs.readFileSync(filepath, 'utf8')))
		} catch (error) {
			console.log(error)
		}
	}

	// fs.writeFileSync('data.json', '{"los": "nai"}')
	video.init()

	const client = new Client('192.168.1.111', 3001)
	// const client = new Client('127.0.0.1', 3001)

	const oscServer = new Server(3003, '127.0.0.1', () => {
		console.log('OSC Server is listening');
	});

	oscServer.on('/pepperstop', () => {
		win.webContents.send('stop', true)
		video.stop()
	});

	const { ipcMain } = require('electron')

	ipcMain.on('save', (event, id, data) => {
		let savedData = JSON.parse(fs.readFileSync(filepath, 'utf8') || "{}")
		savedData[id] = data
		fs.writeFileSync(filepath, JSON.stringify(savedData))
		remoteSave(savedData)
	})

	ipcMain.on('play', (event, {scene, move, sound}) => {
		// client.send(`/pepper/${scene}/${move}/${sound}`, 'a', () => {
		// })
		video.play(scene)
		const fixed = [scene+1, move+1, sound+1]
		client.send(`/pepper`, fixed, () => {
		})
		setTimeout(() => {
			event.sender.send('stop', true)
			video.stop()
		}, 100)
	})

	ipcMain.on('load', (event, id) => {
		let data = JSON.parse(fs.readFileSync(filepath, 'utf8'))
		event.returnValue = data[id] || false
	})

	setInterval(remoteSave, 5*60*1000)
}

export default osc