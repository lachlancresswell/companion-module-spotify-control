import type { ModuleInstance } from './main.js'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions([
		{ variableId: 'currentSong', name: 'Current Song' },
		{ variableId: 'currentArtist', name: 'Current Artist' },
		{ variableId: 'currentUri', name: 'Current URI' },
		{ variableId: 'currentTrackDuration', name: 'Current Track Duration' },
		{ variableId: 'currentPosition', name: 'Current Track Position' },
		{ variableId: 'currentTimeRemaining', name: 'Current Track Time Remaining' },
		{ variableId: 'currentTimeRemainingFormatted', name: 'Current Track Time Remaining Formatted' },
		{ variableId: 'nextArtist', name: 'Next Artist' },
		{ variableId: 'nextTrackDuration', name: 'Next Track Duration' },
		{ variableId: 'nextTrackDurationFormatted', name: 'Next Track Duration Formatted' },
	])
}
