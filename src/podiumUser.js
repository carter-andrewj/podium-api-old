import { Map, Set, List, fromJS } from 'immutable';

import { RadixSimpleIdentity, RadixKeyStore, RadixLogger } from 'radixdlt';

import { PodiumRecord } from './podiumRecord';
import { PodiumError } from './podiumError';

import { filterAsync, checkThrow } from './utils';






export class PodiumUser extends PodiumRecord {



	constructor(podium, address) {
		super(podium, address)
		this.emptyCache = fromJS({
			last: {},
			profile: {},
			followers: Set(),
			followed: Set(),
			posts: Set(),
			promoted: Set(),
			reports: Set(),
			alerts: Set()
		})
		this.cache = this.emptyCache
	}



	load() {
		this.profile(true).catch(checkThrow)
		this.followed(true).catch(checkThrow)
		this.followers(true).catch(checkThrow)
		this.posts(true).catch(checkThrow)
		return this
	}



// SIGN IN

	signIn(id, pw) {
		this.debugOut("Signing In: ", id, pw)
		return new Promise((resolve, reject) => {
			this.podium

				// Retrieve keypair
				.getLatest(this.podium.route.forKeystoreOf(id, pw))

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
		newActiveUser.load()
		return newActiveUser
	}





// USER PROFILES

	profile(force) {
		return new Promise((resolve, reject) => {

			if (!force && this.isCached("profile")) {

				this.debugOut("Serving cache Profile...")
				resolve(this.cached("profile"))

			} else {
				
				this.debugOut("Fetching Profile...")

				// Search on address
				this.podium
					.getHistory(this.podium.route.forProfileOf(this.address))
					.then(history => history.reduce((a, b) => a.mergeDeep(b)))
					.then(profile => {
						profile = profile.set("pictureURL",
							`${this.podium.media}/${profile.get("picture")}`)
						this.swapCache("profile", profile)
						resolve(profile)
					})
					.catch(error => reject(error))

			}

		})
	}





// POSTS

	posts(force) {
		return new Promise((resolve, reject) => {

			if (!force && this.isCached("posts")) {

				this.debugOut("Serving cached posts...")
				resolve(this.cached("posts"))

			} else {

				this.debugOut("Fetching posts...")
				this.podium
					.getHistory(this.podium.route.forPostsBy(this.address))
					.then(index => {
						index = index.map(i => i.get("address")).toSet()
						this.swapCache("posts", index)
						resolve(index)
					})
					.catch(error => reject(error))

			}

		})
	}


	onPost(callback) {
		this.podium.openChannel(
			this.podium.route.forPostsBy(this.address),
			callback
		);
	}





// ALERTS

	onAlert(callback) {
		this.podium.openChannel(
			this.podium.route.forAlertsTo(this.address),
			callback
		);
	}





// FOLLOWING


	isFollowing(address) {
		this.debugOut(`Testing if following ${address}`)
		return new Promise((resolve, reject) => {
			const relationAccount = this.podium.route
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
			const relationAccount = this.podium.route
				.forRelationOf(this.address, address)
			this.podium
				.getLatest(relationAccount)
				.then(relation => resolve(relation.get(address)))
				.catch(error => resolve(false))
		})
	}


	followed(force) {
		this.debugOut(`Fetching users I follow${force ? " forced" : ""}`)
		return new Promise((resolve, reject) => {

			// Serve followed users from cache, if loaded
			if (!force && this.isCached("followed")) {
				resolve(this.cached("followed"))
			} else {

				// Get location for records of followed users
				const followingAccount = this.podium.route
					.forUsersFollowedBy(this.address)

				// Load following users
				this.podium.getHistory(followingAccount)
					.then(async followed => filterAsync(followed,
						f => this.isFollowing(f.get("address"))
					))
					.then(followed => {
						const followedList = followed
							.map(f => f.get("address"))
							.toSet()
						this.cache.usersFollowed = followedList
						resolve(followedList)
					})
					.catch(error => {
						if (error instanceof PodiumError && error.code === 2) {
							resolve(List())
						} else {
							reject(error)
						}
					})

			}

		})
	}


	followers(force) {
		this.debugOut(`Fetching users I follow${force ? " forced" : ""}`)
		return new Promise((resolve, reject) => {

			// Serve followers from cache, if loaded
			if (!force && this.isCached("followers")) {
				resolve(this.cached("followers"))
			} else {

				// Get location for records of followed users
				const followAccount = this.podium.route
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
						this.cache.followers = followerList
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

			}

		})
	}


	onFollow(callback) {
		this.podium.openChannel(
			this.podium.route.forUsersFollowedBy(this.address),
			callback
		);
	}

	onFollowed(callback) {
		this.podium.openChannel(
			this.podium.route.forUsersFollowing(this.address),
			callback
		);
	}


}










export class PodiumRemoteUser extends PodiumUser {
	
	activateUser(identity) {
		var newActiveUser = new PodiumRemoteActiveUser(this.podium, identity)
		newActiveUser.load()
		return newActiveUser
	} 

}











export class PodiumActiveUser extends PodiumUser {


	constructor(podium, identity) {
		super(podium, identity.account.getAddress())
		this.identity = identity
	}


	debugOut() {
		if (this.podium.debug) {
			console.log("PODIUM ACTIVE USER > ", ...arguments)
		}
		return this
	}



// ACCOUNT UPDATING

	updateUserIdentifier() {}

	updatePassword() {}





// USER PROFILES

	updateProfileName(name) {
		this.debugOut(`Updating profile name: ${name}`)
		return new Promise(async (resolve, reject) => {
			
			// Generate user public record
			const profileAccount = this.podium.route.forProfileOf(this.address);
			const profilePayload = {
				record: "profile",
				type: "image",
				name: name
			}

			// Write record
			this.podium
				.storeRecord([profileAccount], profilePayload, this.identity)
				.then(() => {
					this.setCache(["profile", "name"], name)
					resolve()
				})
				.catch(error => reject(error))

		})
	}

	updateProfileBio(bio) {
		this.debugOut(`Updating profile bio: ${bio}`)
		return new Promise(async (resolve, reject) => {
			
			// Generate user public record
			const profileAccount = this.podium.route.forProfileOf(this.address);
			const profilePayload = {
				record: "profile",
				type: "bio",
				bio: bio
			}

			// Write record
			this.podium
				.storeRecord([profileAccount], profilePayload, this.identity)
				.then(() => {
					this.setCache(["profile", "bio"], bio)
					resolve()
				})
				.catch(error => reject(error))

		})
	}

	updateProfilePicture(image, ext) {
		this.debugOut(`Updating profile picture: ${pictureAddress}`)
		return new Promise(async (resolve, reject) => {
			
			// Store media
			this.createMedia(image, ext)
				.then(url => {

					// Generate user public record
					const profileAccount = this.podium.route.forProfileOf(this.address)
					const profilePayload = {
						record: "profile",
						type: "image",
						picture: url
					}

					// Write record
					this.podium
						.storeRecord([profileAccount], profilePayload, this.identity)
						.then(() => {
							this.setCache(["profile", "picture"],
								`${this.podium.media}/${url}`)
							resolve()
						})
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
			const mediaAccount = this.podium.route.forMedia(media)
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
				address: imageAddress,
				url: mediaURL,
				uploader: this.address
			}

			// Register media on ledger
			//TODO - Check if media already exists and skip
			//		 this step, if required
			this.debugOut(`Registering Media: ${imageAddress}`)
			this.podium
				.storeRecord([imageAccount], imagePayload, this.identity)
				.then(() => this.podium.storeMedia(media, mediaURL))
				.then(() => resolve(imageURL))
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
			const topicAccount = this.podium.route.forTopicWithID(id);
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
				.storeRecord([topicAccount], topicRecord, this.identity)
				//TODO - Add topic to index database
				//TODO - Add to cache
				.then(result => resolve(topicRecord))
				.catch(error => reject(error))

		})
	}





// POSTS

	createPost(
			content,				// Content of new post
			references = List(),	// References contained in new post
			parent = null,			// Record of post being replied to (if any)
		) {
		this.debugOut(`Creating Post: ${content}`)
		return new Promise((resolve, reject) => {

			//TODO - Upload media

			// Build post accounts
			//TODO - Fix deterministic posting addresses
			//const postAccount = this.route.forNextPostBy(this.state.data.get("user"));
			const postAccount = this.podium.route.forNewPost(content);
			const postAddress = postAccount.getAddress();

			// Unpack references
			const mentions = references
				.filter(ref => ref.get("type") === "mention")
			//TODO - Handle topics, media, etc...

			// Build post record
			const postRecord = {

				record: "post",
				type: "post",

				content: content,
				address: postAddress,

				author: this.address,
				parent: (parent) ? parent.get("address") : null,
				grandparent: (parent) ? parent.get("parent") : null,

				origin: (parent) ? parent.get("origin") : postAddress,
				depth: (parent) ? parent.get("depth") + 1 : 0,

				mentions: mentions
					.map(ref => ref.get("address"))
					.toList()
					.toJS(),

			}

			// Build destination accounts for index record
			const indexAccount = this.podium.route.forPostsBy(this.address)
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
				const mentionAccounts = references
					//.filter(ref => ref.get("address") !== userAddress)
					.map(ref => this.podium.route.forAlertsTo(ref.get("address")))
					.toJS()
				const mentionRecord = {
					record: "alert",
					type: "mention",
					post: postAddress,
					user: this.address
				}

				mentionWrite = this.podium.storeRecord(
					mentionAccounts, mentionRecord, this.identity
				)

			}



			//TODO - Topics (and other references, etc...)



			// Handle reply records
			let replyWrite;
			if (parent) {

				// Build reply index
				const replyAccount = this.podium.route
					.forRepliesToPost(parent.get("address"))

				// Store records in ledger
				replyWrite = this.podium.storeRecord(
					[replyAccount], indexRecord, this.identity
				)

			} 



			// Wait for all writes to complete
			Promise.all([postWrite, mentionWrite, replyWrite])
				.then(() => {
					this.addCache("posts", postAddress)
					resolve(this.podium.post(postAddress, this.address))
				})
				.catch(error => reject(error))


		});

	}


	promotePost(
			postAddress,	// Address of the promoted post
			authorAddress	// Address of the post's author
		) {
		this.debugOut(`Promoting Post ${postAddress}`)
		return new Promise((resolve, reject) => {

			// Get account for the promoting user's posts
			const postAccount = this.podium.route.forPostsBy(this.address)
			const postRecord = {
				record: "post",
				type: "promotion",
				address: postAddress
			}

			// Get account for logging promotions of target post
			const promoteAccount = this.podium.route.forPromosOfPost(postAddress)
			const promoteRecord = {
				record: "post",
				type: "promotion",
				address: postAddress,
				by: this.address
			}

			// Build alert payload
			const alertAccount = this.podium.route.forAlertsTo(authorAddress)
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
				.then(result => {
					this.addCache("promoted", postAddress)
					resolve(fromJS(postRecord))
				})
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
						const followAccount = this.podium.route
							.forUsersFollowing(address)
						const followRecord = {
							record: "follower",
							type: "index",
							address: this.address
						}

						// Build relation account and payload
						const relationAccount = this.podium.route
							.forRelationOf(this.address, address)
						const relationRecord = {
							record: "follower",
							type: "relation"
						}
						relationRecord[this.address] = true

						// Build following payload
						const followingAccount = this.podium.route
							.forUsersFollowedBy(this.address)
						const followingRecord = {
							record: "following",
							type: "index",
							address: address
						}

						// Build alert payload
						const alertAccount = this.podium.route
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
							.then(result => {
								this.addCache("followed", address)
								resolve(result)
							})
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
						const relationAccount = this.podium.route
							.forRelationOf(this.address, address);
						const relationRecord = {
							record: "follower",
							type: "relation"
						}
						relationRecord[this.address] = false;

						// Store following record
						this.podium
							.storeRecord([relationAccount], relationRecord, this.identity)
							.then(result => {
								this.removeCache("followed", address)
								resolve()
							})
							.catch(error => reject(error))

					} else {
						resolve()
					}
				})
				.catch(error => reject(error))

		})
	}


}









export class PodiumRemoteActiveUser extends PodiumActiveUser {
	


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
			content,			// Content of new post
			references = [],	// References contained in new post
			parent = null,		// Record of post being replied to (if any)
		) {
		this.debugOut(`Creating Post: ${content}`)
		return new Promise((resolve, reject) => {

			// DISPATCH

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

			// DISPATCH

		})

	}


	unfollow(address) {
		this.debugOut(`Unfollowing ${address}`)
		return new Promise((resolve, reject) => {

			// DISPATCH

		})
	}



}





