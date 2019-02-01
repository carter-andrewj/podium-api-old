import { Map } from 'immutable';







export class PodiumRecord {


	constructor(podium, address) {
		this.podium = podium
		this.debug = podium.debug
		this.address = address
		this.cache = Map()
	}


	debugOut() {
		if (this.debug) {
			console.log(this.constructor.name, " > ", ...arguments)
		}
	}
		

}




