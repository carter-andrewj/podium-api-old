import { Map, fromJS, Set } from 'immutable';

import { PodiumRecord } from './podiumRecord';
import { PodiumCache } from './podiumCache';
import { checkThrow } from './utils';





export class PodiumPost extends PodiumRecord {


	constructor(podium, address, authorAddress) {
		super(podium, address)
		this.authorAddress = authorAddress
	}


	content() {
		return new Promise((resolve, reject) => {
			this.podium
				.getHistory(this.podium.path.forPost(this.address))
				.then(postHistory => {
					const postContent = postHistory
						.reduce((post, next) => {
							// TODO - Merge edits and retractions
							//		  into a single cohesive map

							// Collate timestamps
							const lastTime = post.get("created")
							const nextTime = next.get("created")
							let created;
							let latest;
							if (lastTime && nextTime) {
								created = Math.min(lastTime, nextTime)
								latest = Math.max(lastTime, nextTime)
							} else {
								created = lastTime || nextTime
								latest = lastTime || nextTime
							}

							// Return completed post
							return post
								.mergeDeep(next)
								.set("created", created)
								.set("latest", latest)

						}, Map({}))
					resolve(postContent)
				})
				.catch(error => reject(error))
		})
	}



	replies() {
		return new Promise((resolve, reject) => {
			this.podium
				.getHistory(this.podium.path
					.forRepliesToPost(this.address))
				.then(index => {
					index = index
						.map(r => r.get("address"))
						.toSet()
					resolve(index)
				})
				.catch(error => reject(error))
		})
	}

	promotions() {
		return new Promise((resolve, reject) => {
			this.podium
				.getHistory(this.podium.path.forPromotionsOfPost(this.address))
				.then(index => {
					index = index.map(r => r.get("address")).toSet()
					resolve(index)
				})
				.catch(error => reject(error))
		})
	}

	reports() {
		return new Promise((resolve, reject) => {
			this.podium
				.getHistory(this.podium.path
					.forReportsOfPost(this.address))
				.then(index => {
					index = index.map(r => r.get("address")).toSet()
					resolve(index)
				})
				.catch(error => reject(error))
		})
	}


}




export class PodiumClientPost extends PodiumPost {


	constructor(podium, address, authorAddress) {
		super(podium, address, authorAddress)
		this.cache = new PodiumCache({
			content: {},
			replies: Set(),
			promotions: Set(),
			reports: Set()
		})
	}



	get text() { return this.cache.get("content", "text") }
	get mentions() { return this.cache.get("content", "mentions") }

	get created() { return new Date(this.cache.get("content", "created")) }
	get latest() { return new Date(this.cache.get("content", "latest")) }

	get parentAddress() { return this.cache.get("content", "parent")}
	get parent() { return this.podium.post(this.parentAddress) }
	get grandparentAddress() { return this.cache.get("content", "grandparent") }
	get grandparent() { return this.podium.post(this.grandparentAddress) }
	get originAddress() { return this.cache.get("content", "origin") }
	get origin() { return (this.address !== this.originAddress) ? 
		this.podium.post(this.originAddress) : this }
	get depth() { return this.cache.get("content", "depth") }

	get author() { return this.podium.user(this.authorAddress) }


	load() {
		return new Promise((resolve, reject) => {
			var contentPromise = this.content(true)
			var replyPromise = this.replies(true)
			var promoPromise = this.promotions(true)
			var reportPromise = this.reports(true)
			Promise.all([contentPromise, replyPromise,
						 promoPromise, reportPromise])
				.then(() => resolve(this))
				.catch(error => reject(error))
		})
	}


	content(force = false) {
		return new Promise((resolve, reject) => {
			if (!force && this.cache.is("content")) {
				resolve(this.cache.get("content"))
			} else {
				PodiumPost.prototype.content.call(this)
					.then(postContent => {
						this.cache.swap("content", postContent)
						resolve(postContent)
					})
					.catch(error => reject(error))
			}
		})
	}



	replies(force = false) {
		return new Promise((resolve, reject) => {
			if (!force && this.cache.is("replies")) {
				resolve(this.cache.get("replies"))
			} else {
				PodiumPost.prototype.replies.call(this)
					.then(replyIndex => {
						this.cache.swap("replies", replyIndex)
						resolve(replyIndex)
					})
					.catch(error => {
						if (error.code === 2) {
							this.cache.clear("replies")
							resolve(Set())
						} else {
							reject(error)
						}
					})
			}
		})
	}

	promotions(force = false) {
		return new Promise((resolve, reject) => {
			if (!force && this.cache.is("promotions")) {
				resolve(this.cache.get("promotions"))
			} else {
				PodiumPost.prototype.promotions.call(this)
					.then(promoIndex => {
						this.cache.swap("promotions", promoIndex)
						resolve(promoIndex)
					})
					.catch(error => {
						if (error.code === 2) {
							this.cache.clear("promotions")
							resolve(Set())
						} else {
							reject(error)
						}
					})
			}
		})
	}

	reports(force = false) {
		return new Promise((resolve, reject) => {
			if (!force && this.isCached("reports")) {
				resolve(this.cached("reports"))
			} else {
				PodiumPost.prototype.reports.call(this)
					.then(reportIndex => {
						this.cache.swap("reports", reportIndex)
						resolve(reportIndex)
					})
					.catch(error => {
						if (error.code === 2) {
							this.cache.clear("reports")
							resolve(Set())
						} else {
							reject(error)
						}
					})
			}
		})
	}



}



