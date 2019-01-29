import { Map } from 'immutable';




const cacheLifetime = 1000 * 60		// Length of time (ms) between cache updates to
									// automatically force a reload on next read





export class PodiumRecord {


	constructor(podium, address) {
		this.podium = podium
		this.debug = podium.debug
		this.address = address
		this.cache = Map()
	}





// DEBUG


		debugOut() {
			if (this.debug) {
				console.log(arguments)
			}
		}
		




// CACHE

		cached() {
			const args = Array.prototype.slice.call(arguments)
			if (args.length === 0) {
				return this.cached.toJS()
			} else if (args.length === 1) {
				return this.cached.get(args[0])
			} else {
				return this.cached.getIn(args)
			}
		}


		isCached(key) {
			return this.cache.getIn(["last", key, "full"]) &&
				(((new Date).getTime() - this.cache.getIn(["last", key, "full"]))
					< cacheLifetime)
		}

		lastCached(key) {
			return Math.max(this.cache.getIn(["last", key, "update"]),
							this.cache.getIn(["last", key, "full"]))
		}


		addCache(key, value) {
			this.cache.update(key, v => v.add(value))
			this.cache.setIn(["last", key, "update"], (new Date).getTime())
		}

		removeCache(key, value) {
			this.cache.update(key, v => v.delete(value))
			this.cache.setIn(["last", key, "update"], (new Date).getTime())
		}


		setCache(keys, value) {
			this.cache.setIn(keys, value)
			this.cache.setIn(["last", keys[0], "update"], (new Date).getTime())
		}

		unsetCache(keys) {
			this.cache.setIn(keys, undefined)
			this.cache.setIn(["last", keys[0], "update"], (new Date).getTime())
		}


		swapCache(key, values) {
			this.cache.set(key, values)
			this.cache.setIn(["last", key, "full"], (new Date).getTime())
		}

		clearCache(key) {
			this.cache.set(key, this.emptyCache.get(key))
			this.cache.setIn(["last", key, "full"], undefined)
		}



}




