import { Map, fromJS, Set } from 'immutable';

import { PodiumRecord } from './podiumRecord';
import { checkThrow } from './utils';





export class PodiumPost extends PodiumRecord {



	constructor(podium, address, author) {
		super(podium, address)
		this.author = author
		this.emptyCache = fromJS({
			last: {},
			content: {},
			replies: Set(),
			promotions: Set(),
			reports: Set()
		})
		this.cache = this.emptyCache
	}



	isMine(user) {
		return user.address === this.cache.content.get("author")
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

			// Check if content can be served from cache
			if (!force && this.isCached("content")) {

				this.debugOut()
				resolve(this.cached("content"))

			} else {

				this.podium
					.getHistory(this.podium.route.forPost(this.address))
					.then(postHistory => {
						const content = postHistory
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
								resolve(post
									.mergeDeep(next)
									.set("created", created)
									.set("latest", latest)
								)

							}, Map({}))
						this.swapCache("content", content)
						resolve(content)
					})
					.catch(error => reject(error))
			}

		})
	}



	replies(force) {
		return new Promise((resolve, reject) => {

			if (!force && this.isCached("replies")) {
				resolve(this.cached("replies"))
			} else {

				this.podium
					.getHistory(this.podium.route.forRepliesToPost(this.address))
					.then(index => {
						index = index.map(r => r.get("address")).toSet()
						this.swapCache("replies", index)
						resolve(index)
					})
					.catch(error => reject(error))

			}
		})
	}

	promotions(force) {
		return new Promise((resolve, reject) => {

			if (!force && this.isCached("promotions")) {
				resolve(this.cached("promotions"))
			} else {

				this.podium
					.getHistory(this.podium.route.forPromotionsOfPost(this.address))
					.then(index => {
						index = index.map(r => r.get("address")).toSet()
						this.swapCache("promotions", index)
						resolve(index)
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

				this.podium
					.getHistory(this.podium.route.forReportsOfPost(this.address))
					.then(index => {
						index = index.map(r => r.get("address")).toSet()
						this.swapCache("reports", index)
						resolve(index)
					})
					.catch(error => reject(error))

			}
		})
	}


}



