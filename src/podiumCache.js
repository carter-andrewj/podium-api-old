import { Map, fromJS } from 'immutable';






export class PodiumCache {
	
	constructor(emptyCache, lifetime) {
		this.last = Map()
		this.emptyCache = fromJS(emptyCache)
		this.cache = emptyCache
		this.lifetime = lifetime || 1000 * 60
	}


	get() {
		const args = Array.prototype.slice.call(arguments)
		if (args.length === 0) {
			return fromJS(this.cache)
		} else if (args.length === 1) {
			return this.cache[args[0]]
		} else {
			return this.cache[args[0]]
				.getIn(args.slice(1, args.length))
		}
	}


	is(key) {
		const now = (new Date).getTime()
		return this.last.getIn([key, "full"]) &&
			((now - this.age(key)) < this.lifetime)
	}

	age(key) {
		return Math.max(this.last.getIn([key, "update"]) || 0,
						this.last.getIn([key, "full"]) || 0)
	}


	add(key, value) {
		this.cache[key] = this.cache[key].add(value)
		this.last = this.last
			.setIn([key, "update"], (new Date).getTime())
	}

	remove(key, value) {
		this.cache[key] = this.cache[key].delete(value)
		this.last = this.last
			.setIn([key, "update"], (new Date).getTime())
	}


	append(key, value) {
		this.cache[key] = this.cache[key].push(value)
		this.last = this.last
			.setIn([key, "update"], (new Date).getTime())
	}


	set(keys, value) {
		this.cache[keys[0]] = this.cache[keys[0]]
			.setIn(keys.slice(1, keys.length), value)
		this.last = this.last
			.setIn([keys[0], "update"], (new Date).getTime())
	}

	unset(keys) {
		this.cache[keys[0]] = this.cache[keys[0]]
			.setIn(keys.slice(1, keys.length), undefined)
		this.last = this.last
			.setIn([keys[0], "update"], (new Date).getTime())
	}


	swap(key, values) {
		this.cache[key] = values
		this.last = this.last
			.setIn([key, "full"], (new Date).getTime())
	}

	union(key, values) {
		this.cache[key] = this.cache[key].union(values)
		this.last = this.last
			.setIn([key, "full"], (new Date).getTime())
	}

	clear(key) {
		this.cache[key] = this.emptyCache.get(key)
		this.last = this.last
			.setIn([key, "full"], undefined)
	}


	merge(key, other) {
		if (this.age[key] < other.age[key]) {
			this.cache[key] = other.cache[key]
		}
	}

	mergeAll(other) {
		this.emptyCache.keySeq()
			.forEach(k => this.merge(k, other))
	}



}




