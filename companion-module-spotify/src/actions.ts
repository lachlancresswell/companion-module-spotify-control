import { ModuleInstance } from './main.js'

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		sample_action: {
			name: 'Queue Song',
			options: [
				{
					id: 'uri',
					type: 'textinput',
					label: 'Spotify URI',
					default: '',
				},
			],
			callback: async (event) => self.queueSong(event.options.uri as string),
		},
		clearQueue: {
			name: 'Clear Queue',
			options: [],
			callback: async () => self.clearQueue(),
		},

		removeFromQueue: {
			name: 'Remove from queue',
			options: [
				{
					id: 'uri',
					type: 'textinput',
					label: 'Spotify URI',
					default: '',
				},
			],
			callback: async (event) => self.removeFromQueue(event.options.uri as string),
		},

		removeNextFromQueue: {
			name: 'Remove next from queue',
			options: [],
			callback: async () => self.removeNextFromQueue(),
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
			callback: async (event) => self.playURI(event.options.uri as string),
		},
	})
}
