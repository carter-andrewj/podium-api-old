import { Record, Map, List, fromJS } from 'immutable';

import { RadixSimpleIdentity, RadixKeyStore, RadixLogger } from 'radixdlt';

import PodiumError from './podiumError';

import { filterAsync } from './utils';



export default class PodiumUser extends Record({
		debug: false,
		podium: false,
		identity: null,
		address: null,
		cache: {}
	}) {


	constructor(podium) {
		super({
			podium: podium,
			cache: {}		// Mutable object for storing recent queries
		})
	}


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
					resolve(this
						.set("identity", ident)
						.set("address", ident.account.getAddress())
					)
				})

				// Handle errors
				.catch(error => reject(error))

		})
	}



// DEBUG

	setDebug(debug) {
		this.set("debug", debug);
		return this
	}

	debugOut() {
		if (this.debug) {
			console.log("PODIUM USER > ", ...arguments)
		}
		return this
	}





// ACCOUNT UPDATING

	updateUserIdentifier() {}

	updatePassword() {}





// USER PROFILES

	profile() {
		return new Promise((resolve, reject) => {
			this.debugOut("Fetching Profile...")
			this.podium.fetchProfile(this.address)
				.then(profile => resolve(profile))
				.catch(error => reject(error))
		})
	}

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
				.sendRecord([profileAccount], profilePayload, this.identity)
				.then(() => resolve())
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
				.sendRecord([profileAccount], profilePayload, this.identity)
				.then(() => resolve())
				.catch(error => reject(error))

		})
	}

	updateProfilePicture(pictureAddress) {
		this.debugOut(`Updating profile picture: ${pictureAddress}`)
		return new Promise(async (resolve, reject) => {
			
			// Generate user public record
			const profileAccount = this.podium.route.forProfileOf(this.address);
			const profilePayload = {
				record: "profile",
				type: "image",
				picture: pictureAddress
			}

			// Write record
			this.podium
				.sendRecord([profileAccount], profilePayload, this.identity)
				.then(() => resolve())
				.catch(error => reject(error))

		})
	}






// MEDIA

	registerMedia(
			image,
			ext
		) {
		return new Promise((resolve, reject) => {

			//TODO - Validate media with 3rd party service
			//		 to detect image manipulation, etc...

			// Register media on ledger
			const imageAccount = this.podium.route.forMedia(image)
			const imageAddress = imageAccount.getAddress()
			const imageURL = `${imageAddress}.${ext}`

			// Generate file record
			//TODO - Ensure media address is independent of
			//		 the uploading user so the same image
			//		 uploaded by different users is still
			//		 only stored once on S3.
			const imagePayload = {
				record: "media",
				type: "image",
				address: imageAddress,
				ext: ext,
				uploader: this.address
			}

			// Register media on ledger
			//TODO - Check if media already exists and skip
			//		 this step, if required
			this.debugOut(`Registering Media: ${imageAddress}`)
			this.podium
				.sendRecord([imageAccount], imagePayload, this.identity)
				.then(() => resolve(imageURL))
				.catch(error => reject(error))

		})
	}


	createMedia(
			image,
			ext,
		) {
		this.debugOut(`Creating Media`)
		return new Promise((resolve, reject) => {

			// Register media on ledger and upload
			//TODO - Check if media already exists and skip
			//		 this step, if required
			this.registerMedia(image, ext)
				.then(address => this.podium.uploadMedia(address))
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
				.sendRecord([topicAccount], topicRecord, this.identity)
				//TODO - Add topic to index database
				.then(result => resolve(topicRecord))
				.catch(error => reject(error))

		})
	}





// POSTS

	onPost(callback) {
		this.podium.openChannel(
			this.podium.route.forPostsBy(this.address),
			callback
		);
	}

	createPost(
			content,			// Content of new post
			references = [],	// References contained in new post
			parent = null,		// Record of post being replied to (if any)
		) {
		this.debugOut(`Creating Post: ${content}`)
		return new Promise((resolve, reject) => {

			// Build post accounts
			//TODO - Fix deterministic posting addresses
			//const postAccount = this.route.forNextPostBy(this.state.data.get("user"));
			const postAccount = this.podium.route.forNewPost(content);
			const postAddress = postAccount.getAddress();

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

				mentions: references
					.filter(ref => ref.get("type") === "mention")
					.map(ref => ref.get("address"))
					.toList()
					.toJS(),
				topics: references
					.filter(ref => ref.get("type") === "topics")
					.map(ref => ref.get("address"))
					.toList()
					.toJS(),
				media: []

			}

			// Build destination accounts for references
			const refAccounts = references
				.map(ref => {
					const refAddress = ref.get("address")
					switch(ref.get("type")) {
						case ("topic"):
							return this.podium.route.forPostsAboutTopic(refAddress)
						//TODO - Links and other references
						//TODO - Mentions of users...?
						default:
							return List()
					}
				})
				.toList()

			// Build destination accounts for index record
			const indexAccounts = [
				this.podium.route.forPostsBy(this.address),
				...refAccounts,
			];
			const indexRecord = {
				record: "post",
				type: "index",
				address: postAddress
			}

			// Build alert payload
			const mentionAccounts = references
				//.filter(ref => ref.get("address") !== userAddress)
				.map(ref => {
					const refAddress = ref.get("address")
					switch(ref.get("type")) {
						case ("mention"):
							return this.podium.route.forAlertsTo(refAddress)
						default:
							return List()
					}
				})
				.toList()
			const mentionRecord = {
				record: "alert",
				type: "mention",
				post: postAddress,
				user: this.address
			}

			// Check if post is a reply
			if (parent) {

				// Build reply index
				const replyAccount = this.podium.route
					.forRepliesToPost(parent.get("address"))

				// Build reply alert
				const replyAlertAccount = this.podium.route
					.forAlertsTo(parent.get("author"))
				const replyAlertRecord = {
					record: "alert",
					type: "reply",
					post: postAddress,
					user: this.address
				}

				// Store records in ledger
				this.podium.sendRecords(
						this.identity,
						[postAccount], postRecord,
						[replyAccount, ...indexAccounts], indexRecord,
						mentionAccounts, mentionRecord,
						[replyAlertAccount], replyAlertRecord
					)
					.then(result => resolve(fromJS(postRecord)))
					.catch(error => reject(error))

			// ...otherwise, send the basic records
			} else {

				// Store records in ledger
				this.podium.sendRecords(
						this.identity,
						[postAccount], postRecord,
						indexAccounts, indexRecord,
						mentionAccounts, mentionRecord
					)
					.then(result => resolve(fromJS(postRecord)))
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
			this.podium.sendRecords(
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





// ALERTS

	onAlert(callback) {
		this.podium.openChannel(
			this.podium.route.forAlertsTo(this.address),
			callback
		);
	}




// FOLLOWING

	onFollow(callback) {
		this.podium.openChannel(
			this.podium.route.forUsersFollowedBy(this.address),
			callback
		);
	}


	follow(address) {
		this.debugOut(`Following ${address}`)
		return new Promise((resolve, reject) => {

			// Check user is not currently following the user to be followed
			this.isFollowing(address)
				.then(following => {
					if (!following) {

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
						this.podium.sendRecords(
								this.identity,
								[followAccount], followRecord,
								[relationAccount], relationRecord,
								[followingAccount], followingRecord,
								[alertAccount], alertRecord
							)
							.then(result => resolve(result))
							.catch(error => reject(error))

					} else {
						resolve()
					}
				})
				.catch(error => reject(error))

		})

	}


	isFollowing(address) {
		this.debugOut(`Testing if following ${address}`)
		return new Promise((resolve, reject) => {
			const relationAccount = this.podium.route
				.forRelationOf(this.address, address)
			this.podium.getLatest(relationAccount)
				.then(relation => resolve(relation.get(this.address)))
				.catch(error => resolve(false))
		})
	}


	isFollowedBy(address) {
		this.debugOut(`Testing if followed by ${address}`)
		return new Promise((resolve, reject) => {
			const relationAccount = this.podium.route
				.forRelationOf(this.address, address)
			this.podium.getLatest(relationAccount)
				.then(relation => resolve(relation.get(address)))
				.catch(error => resolve(false))
		})
	}


	usersFollowed(force) {
		this.debugOut(`Fetching users I follow${force ? " forced" : ""}`)
		return new Promise((resolve, reject) => {

			// Serve followed users from cache, if loaded
			if (!force && this.cache.usersFollowed) {
				resolve(this.cache.usersFollowed)
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
							.toList()
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
			if (!force && this.cache.followers) {
				resolve(this.cache.followers)
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
							.toList()
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


	unfollow(address) {
		this.debugOut(`Unfollowing ${address}`)
		return new Promise((resolve, reject) => {

			// Check user is currently following the user to be unfollowed
			this.isFollowing(address)
				.then(following => {
					if (following) {

						// Build relation account and payload
						const relationAccount = this.podium.route
							.forRelationOf(this.address, address);
						const relationRecord = {
							record: "follower",
							type: "relation"
						}
						relationRecord[this.address] = false;

						// Store following record
						this.podium.sendRecord([relationAccount], relationRecord, this.identity)
							.then(result => resolve(result))
							.catch(error => reject(error))

					} else {
						resolve()
					}
				})
				.catch(error => reject(error))

		})
	}


}



