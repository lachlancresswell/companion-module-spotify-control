import { ModuleInstance } from './main.js'

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		clearQueue: {
			name: 'Clear Queue',
			options: [],
			callback: async () => self.clearQueue(),
		},

		removeURIFromQueue: {
			name: 'Remove URI from queue',
			options: [
				{
					id: 'uri',
					type: 'textinput',
					label: 'Spotify URI',
					default: '',
				},
			],
			callback: async (event) => {
				if (event.options.uri && typeof event.options.uri === 'string') self.removeURIFromQueue(event.options.uri)
			},
		},

		removeNextTrackFromQueue: {
			name: 'Remove next track from queue',
			options: [],
			callback: async () => self.removeNextTrackFromQueue(),
		},

		playURI: {
			name: 'Play URI',
			options: [
				{
					id: 'uri',
					type: 'textinput',
					label: 'Spotify URI',
					default: '',
				},
			],
			callback: async (event) => {
				if (event.options.uri && typeof event.options.uri === 'string') self.playURI(event.options.uri)
			},
		},
	})
}
