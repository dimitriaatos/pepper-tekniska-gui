const VLC = require('vlc-client')

class Video {
	constructor(options) {
		this.vlc = new VLC.Client({
			ip: 'localhost',
			port: 8080,
			username: '',
			password: 'pepper',
			...options
		})
	}

	async init(){
		this.playlist = await this.vlc.getPlaylist()
		await this.vlc.setRepeating(true)
		await this.vlc.setFullscreen(true)
		await this.vlc.setVolume(50)
		await this.stop()
		return this
	}

	async play(index) {
		await this.vlc.playFromPlaylist(this.playlist[index + 1].id)
	}

	async stop(){
		await this.vlc.playFromPlaylist(this.playlist[0].id)
	}

}

export default Video

// const video = new Video()

// const los = async () => {
// 	await video.init()
// 	await video.play(0)
// }

// los()