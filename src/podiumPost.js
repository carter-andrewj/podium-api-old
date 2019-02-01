import { Map, fromJS, Set } from 'immutable';

import { PodiumRecord } from './podiumRecord';
import { PodiumCache } from './podiumCache';
import { checkThrow } from './utils';





export class PodiumPost extends PodiumRecord {


	constructor(podium, address, author) {
		super(podium, address)
		this.author = author
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


	constructor(podium, address, author) {
		super(podium, address, author)
		this.cache = new PodiumCache({
			content: {},
			replies: Set(),
			promotions: Set(),
			reports: Set()
		})
	}


	load() {
		this.content(true).catch(checkThrow)
		this.replies(true).catch(checkThrow)
		this.promotions(true).catch(checkThrow)
		this.reports(true).catch(checkThrow)
		return this
	}


	content(force) {
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



	replies(force) {
		return new Promise((resolve, reject) => {
			if (!force && this.cache.is("replies")) {
				resolve(this.cache.get("replies"))
			} else {
				PodiumPost.prototype.replies.call(this)
					.then(replyIndex => {
						this.cache.swap("replies", replyIndex)
						resolve(replyIndex)
					})
					.catch(error => reject(error))
			}
		})
	}

	promotions(force) {
		return new Promise((resolve, reject) => {
			if (!force && this.cache.is("promotions")) {
				resolve(this.cache.get("promotions"))
			} else {
				PodiumPost.prototype.promotions.call(this)
					.then(promoIndex => {
						this.cache.swap("promotions", promoIndex)
						resolve(promoIndex)
					})
					.catch(error => reject(error))
			}
		})
	}

	reports(force) {
		return new Promise((resolve, reject) => {
			if (!force && this.isCached("reports")) {
				resolve(this.cached("reports"))
			} else {
				PodiumPost.prototype.reports.call(this)
					.then(reportIndex => {
						this.cache.swap("reports", reportIndex)
						resolve(reportIndex)
					})
					.catch(error => reject(error))
			}
		})
	}



}



