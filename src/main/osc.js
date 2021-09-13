import { Client, Server } from 'node-osc/dist/lib'
const fs = require('fs')
const path = require('path')

const filepath = path.resolve('./data.json')

const client = new Client('127.0.0.1', 8000)

const oscServer = new Server(3333, '127.0.0.1', () => {
  console.log('OSC Server is listening');
});

oscServer.on('message', (msg) => {
	console.log(msg)
});

const { ipcMain } = require('electron')

ipcMain.on('save', (event, choices) => {
	let data = JSON.parse(fs.readFileSync(filepath, 'utf8') || [])
	data.push(choices)
	fs.writeFileSync(filepath, JSON.stringify(data))
})

ipcMain.on('play', (event, {id, index, playpause}) => {
	client.send(`/play/${id}/${index}`, playpause, () => {
	})
})