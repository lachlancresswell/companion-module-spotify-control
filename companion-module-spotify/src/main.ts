import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { Server, Socket } from 'socket.io'

const SPOTIFY_PORT = 9999

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	io: Server
	socket?: Socket
	config!: ModuleConfig // Setup in init()

	constructor(internal: unknown) {
		super(internal)
		this.io = new Server(SPOTIFY_PORT)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		this.io.on('disconnect', (reason, details) => {
			console.info('disconnected', reason, details)
		})

		this.io.on('disconnecting', () => {
			console.info('disconnecting')
		})

		this.io.on('connect_error', () => {
			console.error('connect_error')
		})

		this.io.on('connection', (socket) => {
			console.info('connected')
			this.updateStatus(InstanceStatus.Ok)

			this.socket = socket

			socket.emit('spotify:read:state')

			socket.on('spotify:update:state', (data: Spicetify.PlayerState) => {
				const currentSong = data.item.name
				const currentArtist =
					data.item.artists?.reduce(
						(prev, cur, i, array) => prev + cur.name + (i < array.length - 1 ? ', ' : ''),
						'',
					) || ''
				const currentUri = data.item.uri
				const currentTrackDuration = data.item.duration.milliseconds / 1000

				const nextTrack = data.nextItems?.length ? data.nextItems[0] : undefined

				const nextSong = nextTrack?.name || ''
				const nextArtist =
					nextTrack?.artists?.reduce(
						(prev, cur, i, array) => prev + cur.name + (i < array.length - 1 ? ', ' : ''),
						'',
					) || ''
				const nextUri = nextTrack?.uri || ''
				const nextTrackDuration = (nextTrack?.duration.milliseconds || 0) / 1000
				const nextTrackDurationFormatted =
					(nextTrackDuration &&
						`${Math.floor(nextTrackDuration / 60)
							.toString()
							.padStart(2, '0')}:${(nextTrackDuration % 60).toString().padStart(2, '0')}`) ||
					'0:0'

				this.setVariableValues({
					currentSong,
					currentArtist,
					currentUri,
					currentTrackDuration,
					nextSong,
					nextArtist,
					nextUri,
					nextTrackDuration,
					nextTrackDurationFormatted,
				})
			})

			socket.on('spotify:update:position', (data: number) => {
				const currentPosition = Math.round(data / 1000)
				const currentTrackDuration = this.getVariableValue('currentTrackDuration') as number | undefined
				const currentTimeRemaining = currentTrackDuration ? currentTrackDuration - currentPosition : 0
				const currentTimeRemainingFormatted = `${Math.floor(currentTimeRemaining / 60)
					.toString()
					.padStart(2, '0')}:${(currentTimeRemaining % 60).toString().padStart(2, '0')}`
				this.setVariableValues({
					currentPosition,
					currentTimeRemaining,
					currentTimeRemainingFormatted,
				})
			})
		})

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
	}

	queueSong(uri: string): void {
		this.socket?.emit('spotify:update:queue', uri)
	}

	removeURIFromQueue(uri: string): void {
		this.socket?.emit('spotify:delete:queue', uri)
	}

	removeNextTrackFromQueue(): void {
		this.socket?.emit('spotify:delete:nextSong')
	}

	clearQueue(): void {
		this.socket?.emit('spotify:delete:queue')
	}

	playURI(uri: string): void {
		this.socket?.emit('spotify:create:queue', uri)
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
