import { Map, Set, List, fromJS } from 'immutable';

import { RadixSimpleIdentity, RadixKeyStore, RadixLogger } from 'radixdlt';

import { PodiumRecord } from './podiumRecord';
import { PodiumError } from './podiumError';
import { PodiumCache } from './podiumCache';

import { filterAsync, checkThrow } from './utils';






export class PodiumUser extends PodiumRecord {



	constructor(podium, address) {
		super(podium, address)
	}




// SIGN IN

	signIn(id, pw) {
		this.debugOut("Signing In: ", id, pw)
		return new Promise((resolve, reject) => {
			this.podium

				// Retrieve keypair
				.getLatest(this.podium.path.forKeystoreOf(id, pw))

				// Decrypt keypair
				.then(encryptedKey => {
					this.debugOut("Received Keypair")
					return RadixKeyStore
						.decryptKey(encryptedKey.toJS(), pw)
				})

				// Construct and save identity from keypair
				.then(keyPair => {
					this.debugOut("Decrypted Keypair: ", keyPair)
					const ident = new RadixSimpleIdentity(keyPair);
					resolve(this.activeUser(ident))
				})

				// Handle errors
				.catch(error => reject(error))

		})
	}


	activeUser(identity) {
		var newActiveUser = new PodiumActiveUser(this.podium, identity)
		return newActiveUser
	}





// USER PROFILES

	profile() {
		this.debugOut("Fetching Profile...")
		return new Promise((resolve, reject) => {
			this.podium
				.getHistory(this.podium.path.forProfileOf(this.address))
				.then(history => history.reduce((a, b) =>
						a.mergeDeep(b.delete("record").delete("type"))
					), Map())
				.then(profile => {
					profile = profile.set("pictureURL",
						`https://${this.podium.media}/${profile.get("picture")}`)
					resolve(profile)
				})
				.catch(error => reject(error))
		})
	}





// POSTS

	postIndex() {
		this.debugOut("Fetching posts...")
		return new Promise((resolve, reject) => {
			this.podium
				.getHistory(this.podium.path.forPostsBy(this.address))
				.then(index => {
					index = index.map(i => i.get("address")).toSet()
					resolve(index)
				})
				.catch(error => reject(error))
		})
	}


	onPost(callback) {
		this.podium.openChannel(
			this.podium.path.forPostsBy(this.address),
			callback
		);
	}





// FOLLOWING


	isFollowing(address) {
		this.debugOut(`Testing if following ${address}`)
		return new Promise((resolve, reject) => {
			const relationAccount = this.podium.path
				.forRelationOf(this.address, address)
			this.podium
				.getLatest(relationAccount)
				.then(relation => resolve(relation.get(this.address)))
				.catch(error => resolve(false))
		})
	}


	isFollowedBy(address) {
		this.debugOut(`Testing if followed by ${address}`)
		return new Promise((resolve, reject) => {
			const relationAccount = this.podium.path
				.forRelationOf(this.address, address)
			this.podium
				.getLatest(relationAccount)
				.then(relation => resolve(relation.get(address)))
				.catch(error => resolve(false))
		})
	}


	followingIndex() {
		this.debugOut(`Fetching users I follow...`)
		return new Promise((resolve, reject) => {

			// Get location for records of followed users
			const followingAccount = this.podium.path
				.forUsersFollowedBy(this.address)

			// Load following users
			this.podium
				.getHistory(followingAccount)
				.then(async following => filterAsync(following,
					f => this.isFollowing(f.get("address"))
				))
				.then(following => {
					const index = following
						.map(f => f.get("address"))
						.toSet()
					resolve(index)
				})
				.catch(error => {
					if (error instanceof PodiumError && error.code === 2) {
						resolve(List())
					} else {
						reject(error)
					}
				})

		})
	}


	followerIndex() {
		this.debugOut(`Fetching users I follow`)
		return new Promise((resolve, reject) => {

			// Get location for records of followed users
			const followAccount = this.podium.path
				.forUsersFollowing(this.address)

			// Load followers
			this.podium.getHistory(followAccount)

				// Check relation records for each follower
				// (As there is currently no means to delete
				// radix atoms, this is the only way to allow
				// unfollowing. The follower address lists all
				// users who have ever followed the user, and
				// the corresponding relation address lists
				// the current relation between the users)
				.then(followers => filterAsync(followers,
					f => this.isFollowedBy(f.get("address"))
				))

				// Strip the index records to return the
				// address for each following user
				.then(followers => {
					const followerList = followers
						.map(f => f.get("address"))
						.toSet()
					resolve(followerList)
				})

				// Handle errors and assume any time-out
				// error resulted from an empty address
				// (i.e. a user with 0 followers)
				.catch(error => {
					if (error instanceof PodiumError && error.code === 2) {
						resolve(List())
					} else {
						reject(error)
					}
				})

		})
	}


	onFollow(callback) {
		this.podium.openChannel(
			this.podium.path.forUsersFollowedBy(this.address),
			callback
		);
	}

	onFollowed(callback) {
		this.podium.openChannel(
			this.podium.path.forUsersFollowing(this.address),
			callback
		);
	}


}






export class PodiumServerUser extends PodiumUser {

	activeUser(identity) {
		var newActiveUser = new PodiumServerActiveUser(this.podium, identity)
		return newActiveUser
	}

}




export class PodiumClientUser extends PodiumUser {
	

	constructor(podium, address) {
		super(podium, address)
		this.cache = new PodiumCache({
			profile: Map(),
			followers: Set(),
			following: Set(),
			posts: Set(),
			promoted: Set(),
			reports: Set(),
			alerts: Set()
		})
	}


	// GETTERS

	get id() { return this.cache.get("profile", "id") }
	get name() { return this.cache.get("profile", "name") }
	get bio() { return this.cache.get("profile", "bio") }

	get created() { return new Date(this.cache.get("profile", "created")) }
	get latest() { return new Date(this.cache.get("content", "latest")) }

	get picture() { return this.cache.get("profile", "pictureURL") }

	get posts() {
		return this.cache
			.get("posts")
			.map(p => this.podium.post(p))
			.toList()
	}

	get following() {
		return this.cache
			.get("following")
			.map(f => this.podium.user(f))
			.toList()
	}

	get follower() {
		return this.cache
			.get("followers")
			.map(f => this.podium.user(f))
			.toList()
	}


	load() {
		return new Promise((resolve, reject) => {
			var profilePromise = this.profile(true)
			var followedPromise = this.followingIndex(true)
			var followerPromise = this.followerIndex(true)
			var postsPromise = this.postIndex(true)
			Promise.all([profilePromise, followedPromise,
						 followerPromise, postsPromise])
				.then(() => resolve(this))
				.catch(error => reject(error))
		})
	}


	activeUser(identity) {
		var newActiveUser = new PodiumClientActiveUser(this.podium, identity)
		return newActiveUser
	}


	profile(force = false) {
		return new Promise((resolve, reject) => {
			if (!force && this.cache.is("profile")) {
				this.debugOut("Serving cached Profile...")
				resolve(this.cache.get("profile"))
			} else {
				PodiumUser.prototype.profile.call(this)
					.then(profile => {
						this.cache.swap("profile", profile)
						resolve(profile)
					})
					.catch(error => reject(error))
			}
		})
	}


	postIndex(force = false) {
		return new Promise((resolve, reject) => {
			if (!force && this.cache.is("posts")) {
				this.debugOut("Serving cached Posts...")
				resolve(this.cache.get("posts"))
			} else {
				PodiumUser.prototype.postIndex.call(this)
					.then(posts => {
						this.cache.swap("posts", posts)
						resolve(posts)
					})
					.catch(error => {
						if (error.code === 2) {
							this.cache.clear("posts")
							resolve(Set())
						} else {
							reject(error)
						}
					})
			}
		})
	}


	followingIndex(force = false) {
		return new Promise((resolve, reject) => {
			if (!force && this.cache.is("followed")) {
				this.debugOut("Serving cached Posts...")
				resolve(this.cache.get("followed"))
			} else {
				PodiumUser.prototype.followingIndex.call(this)
					.then(followed => {
						this.cache.swap("followed", followed)
						resolve(followed)
					})
					.catch(error => {
						if (error.code === 2) {
							this.cache.clear("followed")
							resolve(Set())
						} else {
							reject(error)
						}
					})
			}
		})
	}


	followerIndex(force = false) {
		return new Promise((resolve, reject) => {
			if (!force && this.cache.is("followers")) {
				this.debugOut("Serving cached Posts...")
				resolve(this.cache.get("followers"))
			} else {
				PodiumUser.prototype.followerIndex.call(this)
					.then(followers => {
						this.cache.swap("followers", followers)
						resolve(followers)
					})
					.catch(error => {
						if (error.code === 2) {
							this.cache.clear("followers")
							resolve(Set())
						} else {
							reject(error)
						}
					})
			}
		})
	}


}











export class PodiumActiveUser extends PodiumUser {


	constructor(podium, identity) {
		super(podium, identity.account.getAddress())
		this.identity = identity
	}



// ACCOUNT UPDATING

	updateUserIdentifier() {}

	updatePassword() {}





// USER PROFILES

	updateProfileName(name) {
		this.debugOut(`Updating profile name: ${name}`)
		return new Promise(async (resolve, reject) => {
			
			// Generate user public record
			const profileAccount = this.podium.path.forProfileOf(this.address);
			const profilePayload = {
				record: "profile",
				type: "image",
				name: name
			}

			// Write record
			this.podium
				.storeRecord(this.identity, [profileAccount], profilePayload)
				.then(() => resolve())
				.catch(error => reject(error))

		})
	}

	updateProfileBio(bio) {
		this.debugOut(`Updating profile bio: ${bio}`)
		return new Promise(async (resolve, reject) => {
			
			// Generate user public record
			const profileAccount = this.podium.path.forProfileOf(this.address);
			const profilePayload = {
				record: "profile",
				type: "bio",
				bio: bio
			}

			// Write record
			this.podium
				.storeRecord(this.identity, [profileAccount], profilePayload)
				.then(() => resolve())
				.catch(error => reject(error))

		})
	}

	updateProfilePicture(image, ext) {
		this.debugOut(`Updating profile picture`)
		return new Promise(async (resolve, reject) => {
			
			// Store media
			this.createMedia(image, ext)
				.then(url => {

					// Generate user public record
					const profileAccount = this.podium.path.forProfileOf(this.address)
					const profilePayload = {
						record: "profile",
						type: "image",
						picture: url
					}

					// Write record
					this.podium
						.storeRecord(this.identity, [profileAccount], profilePayload)
						.then(() => resolve())
						.catch(error => reject(error))

				})
				.catch(error => reject(error))

		})
	}






// MEDIA

	createMedia(media, ext) {
		return new Promise((resolve, reject) => {

			//TODO - Validate media with 3rd party service
			//		 to detect image manipulation, etc...

			// Register media on ledger
			const mediaAccount = this.podium.path.forMedia(media)
			const mediaAddress = mediaAccount.getAddress()
			const mediaURL = `${mediaAddress}.${ext}`

			// Generate file record
			//TODO - Ensure media address is independent of
			//		 the uploading user so the same image
			//		 uploaded by different users is still
			//		 only stored once on S3.
			const mediaPayload = {
				record: "media",
				type: "image", 		//TODO - Handle gifs/videos/audio
				address: mediaAddress,
				url: mediaURL,
				uploader: this.address
			}

			// Register media on ledger
			//TODO - Check if media already exists and skip
			//		 this step, if required
			this.debugOut(`Registering Media: ${mediaAddress}`)
			this.podium
				.storeRecord(this.identity, [mediaAccount], mediaPayload)
				.then(() => this.podium.storeMedia(media, mediaURL))
				.then(() => resolve(mediaURL))
				.catch(error => reject(error))

		})
	}






// TOPICS

	createTopic(
			id,				// Unique identifier for topic
			name,			// Display name of topic
			description		// Description of topic
		) {
		this.debugOut(`Creating Topic: ${id}`)
		return new Promise((resolve, reject) => {

			// Resolve topic address
			const topicAccount = this.podium.path.forTopicWithID(id);
			const topicAddress = topicAccount.getAddress();

			// Build topic record
			const topicRecord = {
				record: "topic",
				type: "topic",
				id: id,
				name: name,
				description: description,
				owner: this.address,
				address: topicAddress
			}

			//TODO - Topic ownership record

			// Store topic
			this.podium
				.storeRecord(this.identity, [topicAccount], topicRecord)
				//TODO - Add topic to index database
				.then(result => resolve(topicRecord))
				.catch(error => reject(error))

		})
	}





// POSTS

	createPost(
			text,					// Content of new post
			references = Map(),		// References contained in new post
			parentAddress = null,	// Address of post being replied to (if any)
		) {
		this.debugOut(`Creating Post: ${text}`)
		return new Promise(async (resolve, reject) => {

			// Load parent post
			let parent;
			if (parentAddress) {
				parent = await this.podium.post(parentAddress).content()
			}

			// Validate text string
			if (!text || text === "") {
				reject(new PodiumError().withCode(4))

			// Validate parent post
			} else if (parentAddress && !parent) {
				reject(new PodiumError().withCode(5))

			} else {

				//TODO - Upload media

				// Build post accounts
				//TODO - Fix deterministic posting addresses
				//const postAccount = this.path.forNextPostBy(this.state.data.get("user"));
				const postAccount = this.podium.path.forNewPost(text);
				const postAddress = postAccount.getAddress();

				// Unpack references
				const mentions = references.get("mentions") || List()


				// Build post record
				const postRecord = {

					record: "post",
					type: "post",

					text: text,
					address: postAddress,

					author: this.address,
					parent: (parent) ? parentAddress : null,
					grandparent: (parent) ? parent.get("parent") : null,

					origin: (parent) ? parent.get("origin") : postAddress,
					depth: (parent) ? parent.get("depth") + 1 : 0,

					mentions: mentions.toJS(),

				}

				// Build destination accounts for index record
				const indexAccount = this.podium.path.forPostsBy(this.address)
				const indexRecord = {
					record: "post",
					type: "index",
					address: postAddress
				}

				// Write main post records
				var postWrite = this.podium.storeRecords(
					this.identity,
					[postAccount], postRecord,
					[indexAccount], indexRecord
				)

				// Handle mention-specific records
				let mentionWrite;
				if (mentions.size > 0) {

					// Build alert payload
					const mentionAccounts = mentions
						//.filter(ref => ref.get("address") !== userAddress)
						.map(address => this.podium.path.forAlertsTo(address))
						.toJS()
					const mentionRecord = {
						record: "alert",
						type: "mention",
						post: postAddress,
						user: this.address
					}

					mentionWrite = this.podium.storeRecord(
						this.identity, mentionAccounts, mentionRecord
					)

				}

				//TODO - Topics (and other references, etc...)

				// Handle reply records
				let replyWrite;
				if (parent) {

					// Build reply index
					const replyAccount = this.podium.path
						.forRepliesToPost(parentAddress)

					// Store records in ledger
					replyWrite = this.podium.storeRecord(
						this.identity, [replyAccount], indexRecord
					)

				} 

				// Wait for all writes to complete
				Promise.all([postWrite, mentionWrite, replyWrite])
					.then(() => {
						var post = this.podium
							.post(postAddress, this.address)
						resolve(post)
					})
					.catch(error => reject(error))

			}

		});

	}


	promotePost(
			postAddress,	// Address of the promoted post
			authorAddress	// Address of the post's author
		) {
		this.debugOut(`Promoting Post ${postAddress}`)
		return new Promise((resolve, reject) => {

			// Get account for the promoting user's posts
			const postAccount = this.podium.path.forPostsBy(this.address)
			const postRecord = {
				record: "post",
				type: "promotion",
				address: postAddress
			}

			// Get account for logging promotions of target post
			const promoteAccount = this.podium.path.forPromosOfPost(postAddress)
			const promoteRecord = {
				record: "post",
				type: "promotion",
				address: postAddress,
				by: this.address
			}

			// Build alert payload
			const alertAccount = this.podium.path.forAlertsTo(authorAddress)
			const alertRecord = {
				record: "alert",
				type: "promotion",
				post: postAddress,
				user: this.userAddress
			}

			// Store records in ledger
			this.podium.storeRecords(
					this.identity,
					[postAccount], postRecord,
					[promoteAccount], promoteRecord,
					[alertAccount], alertRecord
				)
				.then(result => resolve(fromJS(postRecord)))
				.catch(error => reject(error))

		});

	}


	amendPost() {}


	retractPost() {}





// REPORTING

	createReport() {}






// FOLLOWING


	follow(address) {
		this.debugOut(`Following ${address}`)
		return new Promise((resolve, reject) => {

			// Check user is not currently following the user to be followed
			this.isFollowing(address)
				.then(followed => {
					if (!followed) {

						// Build follow account payload
						const followAccount = this.podium.path
							.forUsersFollowing(address)
						const followRecord = {
							record: "follower",
							type: "index",
							address: this.address
						}

						// Build relation account and payload
						const relationAccount = this.podium.path
							.forRelationOf(this.address, address)
						const relationRecord = {
							record: "follower",
							type: "relation"
						}
						relationRecord[this.address] = true

						// Build following payload
						const followingAccount = this.podium.path
							.forUsersFollowedBy(this.address)
						const followingRecord = {
							record: "following",
							type: "index",
							address: address
						}

						// Build alert payload
						const alertAccount = this.podium.path
							.forAlertsTo(address)
						const alertRecord = {
							record: "alert",
							type: "follow",
							user: this.address
						}

						// Store following record
						this.podium.storeRecords(
								this.identity,
								[followAccount], followRecord,
								[relationAccount], relationRecord,
								[followingAccount], followingRecord,
								[alertAccount], alertRecord
							)
							.then(() => resolve())
							.catch(error => reject(error))

					} else {
						resolve()
					}
				})
				.catch(error => reject(error))

		})

	}


	unfollow(address) {
		this.debugOut(`Unfollowing ${address}`)
		return new Promise((resolve, reject) => {

			// Check user is currently following the user to be unfollowed
			this.isFollowing(address)
				.then(followed => {
					if (followed) {

						// Build relation account and payload
						const relationAccount = this.podium.path
							.forRelationOf(this.address, address);
						const relationRecord = {
							record: "follower",
							type: "relation"
						}
						relationRecord[this.address] = false;

						// Store following record
						this.podium
							.storeRecord(
								this.identity,
								[relationAccount],
								relationRecord
							)
							.then(() => resolve())
							.catch(error => reject(error))

					} else {
						resolve()
					}
				})
				.catch(error => reject(error))

		})
	}


}





export class PodiumServerActiveUser extends PodiumActiveUser {




// ALERTS

	alerts(seen=false, limit=25) {
		return new Promise((resolve, reject) => {
			let finder;
			if (seen) {
				finder = {
					to: this.address
				}
			} else {
				finder = {
					to: this.address,
					seen: false
				}
			}
			const alerts = this.podium.db
				.getCollection("alerts")
				.chain()
				.find(finder)
				.simplesort("created", { desc: true })
				.limit(limit)
				.data()
			resolve(fromJS(alerts).valueSeq().toList())
		})
	}


	createAlert(type, userAddress, subjectAddress) {
		this.podium.db
			.getCollection("alerts")
			.insert({
				created: (new Date()).getTime(),
				to: userAddress,
				from: this.address,
				type: type,
				about: subjectAddress,
				seen: false
			})
	}


	clearAlerts(ids) {
		this.podium.db
			.getCollection("alerts")
			.chain()
			.find({
				to: { '$eq': this.address },
				'$loki': { '$in': ids.toJS() }
			})
			.update(item => {
				item.seen = true
			})
	}




// ALERT WRAPPERS FOR CREATION METHODS

	createPost(
			text,
			references = Map(),
			parentAddress = null
		) {
		return new Promise((resolve, reject) => {
			PodiumActiveUser.prototype.createPost
				.call(this, text, references, parentAddress)
				.then(post => {

					// Alert mentions
					if (references.get("mentions")) {
						references
							.get("mentions")
							.map(mention => {
								this.createAlert(
									"mention",
									mention,
									post.address
								)
							})
					}

					// Alert reply
					let replyAlert;
					if (parentAddress) {
						this.podium
							.post(parentAddress)
							.content()
							.then(content => {
								this.createAlert(
									"reply",
									content.get("author"),
									post.address
								)
								resolve(post)
							})
							.catch(error => reject(error))
					} else {
						resolve(post)
					}

				})
				.catch(error => reject(error))
		})
	}


	follow(address) {
		return new Promise((resolve, reject) => {
			PodiumActiveUser.prototype.follow.call(this, address)
				.then(() => {
					this.createAlert("follow", address)
					resolve()
				})
				.catch(error => reject(error))
		})
	}




}




export class PodiumClientActiveUser extends PodiumClientUser {
	

	constructor(podium, identity) {
		super(podium, identity.account.getAddress())
		this.identity = identity
	}



// ALERTS

	alerts(seen=false, limit=25, force=false) {
		return new Promise(async (resolve, reject) => {
			if (!force && this.cache.is("alerts")) {
				resolve(this.cache.get("alerts"))
			} else {
				this.podium
					.dispatch(
						"/alerts",
						{ limit: limit, seen: seen },
						this.identity
					)
					.then(response => {
						const alerts = response.get("alerts").toList()
						this.cache.swap("alerts", alerts)
						resolve(alerts)
					})
					.catch(error => reject(error))
			}
		})
	}


	clearAlerts(ids) {
		return new Promise(async (resolve, reject) => {
			this.podium
				.dispatch(
					"/clearalerts",
					{ ids: JSON.stringify(ids.toJS()) },
					this.identity
				)
				.then(() => resolve())
				.catch(error => reject(error))
		})
	}





// ACCOUNT UPDATING

	updateUserIdentifier() {}

	updatePassword() {}





// USER PROFILES

	updateProfileName(name) {
		this.debugOut(`Updating profile name: ${name}`)
		return new Promise(async (resolve, reject) => {
			
			// DISPATCH

		})
	}

	updateProfileBio(bio) {
		this.debugOut(`Updating profile bio: ${bio}`)
		return new Promise(async (resolve, reject) => {
			
			// DISPATCH

		})
	}

	updateProfilePicture(pictureAddress) {
		this.debugOut(`Updating profile picture: ${pictureAddress}`)
		return new Promise(async (resolve, reject) => {
			
			// DISPATCH

		})
	}






// MEDIA

	createMedia(image, ext) {
		return new Promise((resolve, reject) => {

			// DISPATCH

		})
	}





// TOPICS

	createTopic(
			id,				// Unique identifier for topic
			name,			// Display name of topic
			description		// Description of topic
		) {
		this.debugOut(`Creating Topic: ${id}`)
		return new Promise((resolve, reject) => {

			// DISPATCH

		})
	}





// POSTS

	createPost(
			text,
			references = Map(),
			parentAddress = null
		) {
		this.debugOut(`Creating Post: ${text}`)
		return new Promise(async (resolve, reject) => {
			this.podium
				.dispatch(
					"/post",
					{
						text: text,
						references: JSON.stringify(references.toJS()),
						parentAddress: parentAddress
					},
					this.identity
				)
				.then(response => {
					const postAddress = response.get("address")
					var post = this.podium.post(postAddress, this.address)
					this.cache.add("posts", postAddress)
					resolve(post)
				})
				.catch(error => reject(error))
		})
	}


	promotePost(
			postAddress,	// Address of the promoted post
			authorAddress	// Address of the post's author
		) {
		this.debugOut(`Promoting Post ${postAddress}`)
		return new Promise((resolve, reject) => {

			// DISPATCH

		});

	}


	amendPost() {}


	retractPost() {}





// REPORTING

	createReport() {}






// FOLLOWING

	follow(address) {
		this.debugOut(`Following ${address}`)
		return new Promise((resolve, reject) => {
			this.podium
				.dispatch(
					"/follow",
					{ address: address },
					this.identity
				)
				.then(() => {
					this.cache.add("following", address)
					resolve()
				})
				.catch(error => reject(error))
		})
	}

	unfollow(address) {
		this.debugOut(`Unfollowing ${address}`)
		return new Promise((resolve, reject) => {
			this.podium
				.dispatch(
					"/unfollow",
					{ address: address },
					this.identity
				)
				.then(() => {
					this.cache.remove("following", address)
					resolve()
				})
				.catch(error => reject(error))
		})
	}




}





