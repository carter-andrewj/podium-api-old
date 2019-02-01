import { Map, fromJS } from 'immutable';






export class PodiumCache {
	
	constructor(emptyCache, lifetime) {
		this.last = Map()
		this.emptyCache = fromJS(emptyCache)
		this.cache = fromJS(emptyCache)
		this.lifetime = lifetime || 1000 * 60
	}


	get() {
		const args = Array.prototype.slice.call(arguments)
		if (args.length === 0) {
			return this.cache.toJS()
		} else if (args.length === 1) {
			return this.cache.get(args[0])
		} else {
			return this.cache.getIn(args)
		}
	}


	is(key) {
		const now = (new Date).getTime()
		return this.last.getIn([key, "full"]) &&
			((now - this.age(key)) < this.lifetime)
	}

	age(key) {
		return Math.max(this.last.getIn([key, "update"]),
						this.last.getIn([key, "full"]))
	}


	add(key, value) {
		this.cache.update(key, v => v.add(value))
		this.last.setIn([key, "update"], (new Date).getTime())
	}

	remove(key, value) {
		this.cache.update(key, v => v.delete(value))
		this.last.setIn([key, "update"], (new Date).getTime())
	}


	set(keys, value) {
		this.cache.setIn(keys, value)
		this.last.setIn([keys[0], "update"], (new Date).getTime())
	}

	unset(keys) {
		this.cache.setIn(keys, undefined)
		this.last.setIn([keys[0], "update"], (new Date).getTime())
	}


	swap(key, values) {
		this.cache.set(key, values)
		this.last.setIn([key, "full"], (new Date).getTime())
	}

	union(key, values) {
		this.cache.update(key, v => v.union(values))
		this.last.setIn([key, "full"], (new Date).getTime())
	}

	clear(key) {
		this.cache.set(key, this.emptyCache.get(key))
		this.last.setIn([key, "full"], undefined)
	}

}




