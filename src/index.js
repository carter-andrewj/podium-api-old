import { fromJS, Map, List } from 'immutable';

import { radixUniverse, RadixUniverse, RadixLogger,
		 RadixAccount, RadixUtil, RadixKeyPair,
		 RadixSimpleIdentity, RadixIdentityManager,
		 RadixKeyStore, RadixTransactionBuilder } from 'radixdlt';




function getAccount(seed) {
	const hash = RadixUtil.hash(Buffer.from(seed));
	return new RadixAccount(RadixKeyPair.fromPrivate(hash));
}




class PodiumError extends Error {

	constructor(...args) {
		super(...args)
		this.podiumError = true;
		Error.captureStackTrace(this, PodiumError)
	}

	withCode(code) {
		this.code = code;
		this.message = this.report(code);
		return this;
	}

	report() {
		switch (this.code) {
			case (0): 
				return "Server Offline."
			case (1):
				return "No data received."
			case (2):
				return "Timed out."
			default:
				return "Unknown error."
		}
	}

}




class Routes {

	faucet() {
		return RadixAccount.fromAddress(
			'9he94tVfQGAVr4xoUpG3uJfB2exURExzFV6E7dq4bxUWRbM5Edd', true);
	}

	// Users
	forProfileOf(address) {
		return RadixAccount.fromAddress(address)
	}
	forKeystoreOf(id, pw) {
		return getAccount("podium-keystore-for-" + id.toLowerCase() + pw)
	}
	forProfileWithID(id) {
		return getAccount("podium-ownership-of-id-" + id.toLowerCase())
	}
	forIntegrityOf(address) {
		return getAccount("podium-integrity-score-of-" + address);
	}

	// Tokens
	forPODof(address) {
		return getAccount("podium-token-transactions-of-" + address);
	}
	forAUDof(address) {
		return getAccount("audium-token-transactions-of-" + address);
	}

	// Topics
	forTopic(address) {
		return RadixAccount.fromAddress(address)
	}
	forTopicWithID(id) {
		return getAccount("podium-topic-with-id-" + id.toLowerCase());
	}
	forPostsAboutTopic(address) {
		return getAccount("podium-posts-about-topic-" + address)
	}
	

	// Posts
	forPostsBy(address) {
		return getAccount("podium-posts-by-user-" + address)
	}
	forPost(address) {
		return RadixAccount.fromAddress(address)
	}
	forNextPostBy(user) {
		// TODO - Fix this so posts are stored deterministicly again
		return getAccount("podium-post-by-" + user.get("address") +
			              "-" + (user.get("posts") + user.get("pending")));
	}
	forNewPost(post) {
		return getAccount("podium-post-with-content-" + post);
	}
	

	// Media
	forMedia(file) {
		return getAccount(JSON.stringify(file))
	}
	forMediaFrom(address) {
		return getAccount("podium-media-uploaded-by-" + address)
	}


	// Follows
	forUsersFollowing(address) {
		return getAccount("podium-user-followers-" + address)
	}
	forUsersFollowedBy(address) {
		return getAccount("podium-user-following-" + address)
	}
	forRelationOf(address1, address2) {
		return getAccount("podium-user-" + address1 +
						  "-follows-user-" + address2)
	}

	// Alerts
	forAlertsTo(address) {
		return getAccount("podium-user-alerts-" + address)
	}

}



export default class Podix {



// INITIALIZATION

	constructor(config = false, debug = false) {

		// Set up global variables
		this.user = null;
		this.route = new Routes();
		this.channels = Map({});
		this.timers = Map({});

		// Set logging level
		this.setDebug(debug);

		// Load remote config if none supplied
		if (!config) {
			this.server = "https://api.podium-network.com";
			fetch(this.server)
				.then(response => {
					if (!response.ok) {
						throw new PodiumError("Server Offline")
							.withCode(0)
					} else {
						fetch(this.server + "/config")
							.then(response => response.json())
							.then(config => this.connect(config))
					}
				});
		} else {
			this.connect(config)
		}

	}

	connect(config) {
		
		// Extract settings from config
		this.app = config.ApplicationID;
		this.timeout = config.Timeout;
		this.lifetime = config.Lifetime;
		this.server = "http://" + config.API;	// "https://" + config.API
		this.media = config.MediaStore;

		// Connect to radix network
		//TODO - Test radix connection
		switch (config.Universe) {
			case ("sunstone"):
				radixUniverse.bootstrap(RadixUniverse.SUNSTONE);
				break;
			case ("highgarden"):
				radixUniverse.bootstrap(RadixUniverse.HIGHGARDEN);
				break;
			case ("alphanet"):
				radixUniverse.bootstrap(RadixUniverse.ALPHANET);
				break;
			default:
				throw new Error("Unknown Radix Universe.");
		}

	}




// UTILITIES

	getAccount(seed) {
		return getAccount(seed);
	}

	cleanUp() { 
		this.cleanUpTimers();
		this.cleanUpChannels();
	}

	setDebug(debug) {
		this.debug = debug;
		if (!debug) {
			RadixLogger.setLevel('error')
		} else {
			console.log("Debug Mode On")
		}
	}

	debugOut() {
		if (this.debug) {
			console.log(...arguments)
		}
	}




// TIMERS

	newTimer(
			id,			// Identifier of timer
			duration,	// Duration of timer
			callback	// Function to be called upon timer completion
		) {

		// Start timer
		const timer = setTimeout(() => {

			// Run callback
			callback();

			// Delete record of this timer
			this.timers.delete(id);

		}, duration);

		// Store timer
		this.timers.id = {
			timer: timer,
			callback: callback,
			duration: duration
		}

	}


	resetTimer(
			id 		// Identifier of timer to be restarted
		) {

		// Stop timer
		clearTimeout(this.timers.id.timer);

		// Recreate timer
		this.newTimer(id, this.timers.callback, this.timers.duration);

	}

	stopTimer(
			id 		// Identifier of timer to be stopped
		) {

		// Stop timer
		clearTimeout(this.timers.id.timer);

		// Delete record of this timer
		this.timers.delete("id");

	}

	cleanUpTimers() {

		// Stops all timers
		this.timers.map((t) => this.stopTimer(t));

	}






// WRITE DATA TO RADIX

	sendRecord(
			accounts,			// Destination accounts for record [Array]
			payload,			// Payload of record to be sent [Object{}]
			identity = this.user,
			encrypt = false		// Encrypt record with user's identity?
		) {
		if (!identity) { throw new Error("Missing Identity") }
		return new Promise((resolve, reject) => {
			if (accounts.length === 0) {
				reject(new Error("Received empty accounts array"));
			} else {
				this.debugOut("Writing to Ledger (x",
					accounts.length, "):", payload)
				RadixTransactionBuilder
					.createPayloadAtom(
						accounts,
						this.app,
						JSON.stringify(payload),
						encrypt
					)
					.signAndSubmit(identity)
					.subscribe({
						complete: () => resolve(true),
						next: status => this.debugOut(" > ", status),
						error: error => reject(error)
					});
			}
		});
	}


	sendRecords() {
		return new Promise((resolve, reject) => {

			// Unpack arg list
			var args = Array.prototype.slice.call(arguments)

			// Check if identity was provided
			let identity;
			if ((args.length % 2) === 1) {
				identity = args[0]
				args = args.slice(1, args.length)
			} else if (this.user) {
				identity = this.user
			} else {
				throw new Error("Missing Identity")
			}

			// Dispatch records
			this.sendRecord(args[0], args[1], identity)
				.then(result => {
					if (args.length > 2) {
						this.sendRecords(identity, ...args.slice(2, args.length))
							.then(result => resolve(result))
					} else {
						resolve(true)
					}
				})
				.catch(error => reject(error))

		})
	}




// FETCH DATA FROM RADIX

	getHistory(
			account,				// Account to retreive all records from
			timeout = this.timeout 	// Assume history is empty after X seconds inactivity
		) {

		// Pulls all current values from a radix
		// -account- and closes the channel connection.

		return new Promise((resolve, reject) => {

			// Open the account connection
			account.openNodeConnection();

			// Connect to account data
			const stream = account.dataSystem
				.getApplicationData(this.app);

			// Fetch all data from target channel
			let skipper;
			var history = List([]);
			const channel = stream.subscribe({
				//TODO - Rewrite to pull until up-to-date once
				//		 radix provides the required flag.
				//		 Currently, this just collates all
				//		 input until timeout.
				next: item => {
					if (skipper) { clearTimeout(skipper) }
					var record = Map(fromJS(JSON.parse(item.data.payload)))
						.set("received", (new Date()).getTime())
						.set("created", item.data.timestamp);
					history = history.push(record);
					// Assume all records collated 1 second after first
					// (This won't work long-term, but serves as an
					// efficient fix for the timeout issue until the
					// radix lib can flag a channel as up to date).
					skipper = setTimeout(() => {
						channel.unsubscribe()
						resolve(history)
					}, 1000);
				},
				error: error => {
					channel.unsubscribe();
					reject(error)
				}
			});

			// Set timeout
			setTimeout(
				() => {
					channel.unsubscribe();
					if (history.size > 0) {
						resolve(history)
					} else {
						reject(new PodiumError().withCode(2))
					}
				},
				timeout * 1000
			)

		});

		// TODO - Close node connection

	}


	getLatest(
			account,				// Account to query latest record from
			timeout = this.timeout 	// Assume account is empty after X seconds inactivity
		) {

		// Returns the most recent payload among all
		// data for the provided -account-.

		// Get account history
		return new Promise((resolve, reject) => {
			this.getHistory(account, timeout)
				.then(history => resolve(history
					.sort((a, b) => (a.get("created") > b.get("created")) ? 1 : -1)
					.last()
				))
				.catch(error => reject(error));
		});

	}




// SUBSCRIBE TO RADIX DATA

	openChannel(
			account,					// Radix account to be queried
			callback,					// Function to be called for each new record on channel
			onError = null,				// Function to be called in case of error
			lifetime = this.lifetime	// Close channel after X seconds of inactivity
		) {

		// Creates and manages a subscription to new data
		// updates for a given -account-, running
		// -callback- whenever a new item is received.
		// Will run -onError- callback in case of error.
		// Will timeout after -lifetime- ms of inactivity,
		// or will remain open indefinitely if -lifetime-
		// is not provided or set to 0.

		//TODO - Close channels after a period of inactivity
		//		 and reopen automatically on resume.

		// Check channel to this account is not already open
		const address = account.getAddress();
		if (address in this.channels) {
			return this.channels.get(address);
		}

		// Connect to the account
		account.openNodeConnection();

		// Initialize data request
		const stream = account.dataSystem.applicationDataSubject;

		// Set up timeout, if required
		let timer;
		if (lifetime > 0) {
			timer = this.newTimer(address, lifetime, (a) => {
				this.closeChannel(a);
			});
		}

		// Subscribe to data stream
		const channel = stream.subscribe({
			next: async item => {

				// Reset timeout
				if (lifetime > 0) { this.resetTimer(address); }

				// Run callback
				const result = Map(fromJS(JSON.parse(item.data.payload)));
				callback(result);

			},
			error: error => {

				// Run callback
				if (typeof(onError) === "function") {
					onError(error);
				} else {
					this.closeChannel(address);
					throw error;
				}

			}
		});

		// Log open channel
		this.channels.set("address", Map({
			timer: timer,
			channel: channel
		}))

		// Return the channel
		return channel;

	}

	closeChannel(
			address 	// Radix address of channel to be closed
		) {

		// Closes and cleans up a channel created by
		// openChannel

		// Stop channel timeout
		if (address in this.channels) {
			this.stopTimer(this.channels.get(address).timer);
			this.channels.get(address).channel.unsubscribe();
			this.channels.delete(address);
		}

		//TODO - Close radix node connection

	}

	cleanUpChannels() {

		// Closes all open Channels
		this.channels.map((c) => this.closeChannel(c));

	}




// MEDIA


	uploadMedia(mediaFile, address) {

		// Dispatches a media file to the server, which
		// returns an ID address for that image in the
		// public store.

		return new Promise((resolve, reject) => {
			// const body = new FormData()
			// body.append("file", mediaFile)
			// body.append("address", address)
			this.dispatch("media", {
					address: address,
					file: mediaFile
				})
				.then(response => resolve(response))
				.catch(error => reject(error))
		})

	}


	createMedia(
			file,
			identity = this.user
		) {
		if (!identity) { throw new Error("Missing Identity") }
		return new Promise((resolve, reject) => {

			//TODO - Validate media with 3rd party service
			//		 to detect image manipulation, etc...

			// Register media on ledger
			const address = identity.account.getAddress();
			const fileAddress = this.route.forMedia(file).getAddress() + "." +
				file.split(",")[0].split("/")[1].split(";")[0];

			// Generate file record
			//TODO - Ensure media address is independent of
			//		 the uploading user so the same image
			//		 uploaded by different users is still
			//		 only stored once on S3.
			const mediaAccount = this.route.forMediaFrom(address);
			const mediaPayload = {
				record: "media",
				type: "image",
				address: fileAddress
			}

			// Register media on ledger
			//TODO - Check if media already exists and skip
			//		 this step, if required
			this.sendRecord([mediaAccount], mediaPayload, identity)
				.then(() => this.uploadMedia(file, fileAddress))
				.then(() => resolve(fileAddress))
				.catch(error => reject(error))

		})
	}



// SERVER

	dispatch(route, data) {
		return new Promise((resolve, reject) => {
			const body = new FormData();
			Object.keys(data)
				.forEach(k => body.append(k, data[k]))
			fetch(`${this.server}/${route}`, {
					method: "POST",
					body: body
				})
				.then(result => resolve(
					fromJS(result.json())
				))
				.catch(error => reject(error))
		})
	}





// USERS

	createUser(
		id,			// Podium @ ID of new user account
		pw,			// Password for new user account
		name,		// Display name of new user account
		bio,		// Bio of new user account
		picture,	// Picture address (in media archive) of user's profile picture
		) {
		return new Promise((resolve, reject) => {
			this.dispatch("user", {
					id: id,
					pw: pw,
					name: name,
					bio: bio,
					picture: picture
				})
				.then(response => resolve(response))
				.catch(error => reject(error))
		})
	}

	newUser(
			id,			// Podium @ ID of new user account
			pw,			// Password for new user account
			name,		// Display name of new user account
			bio,		// Bio of new user account
			picture,	// Picture address (in media archive) of user's profile picture
			setUser=false
		) {

		// Registers a new podium user.

		// Podium users are represented on the ledger by 6 records
		//	1) Profile Record - stores information about the user,
		//			including their display name and bio
		//	2) POD Record - stores transactions of Podium Tokens
		//			by the user, which can be compiled to calculate
		//			the user's current POD balance
		//	3) AUD Record - stores transactions of Audium Tokens
		//			by the user, which can be compiled to calculate
		//			the user's current AUD balance
		//	4) Integrity Record - stores gains/losses of Integrity
		//			for this user, which can be compiled to calculate
		//			the user's current Integrity
		//	5) Permissions - stores records dictating the user's
		//			current permissions on Podium
		//	6) ID Ownership Record - stores a reference for the user's
		//			address to their Podium @ ID. Used to confirm
		//			account ownership, track account history, and to
		//			permit users to freely transfer their IDs

		//TODO - Require ID and pw to obey certain rulesets

		//TODO - Replace with scrypto smart contract

		// Create output promise
		return new Promise(async (resolve, reject) => {

			// Create user identity
			const identityManager = new RadixIdentityManager();
			const identity = identityManager.generateSimpleIdentity();
			const address = identity.account.getAddress();

			//TODO - Store picture, if present
			let pictureAddress;
			if (picture) {
				pictureAddress = await this.createMedia(picture, identity)
			}

			// Generate user public record
			const profileAccount = this.route.forProfileOf(address);
			const profilePayload = {
				record: "user",
				type: "profile",
				id: id,
				name: name,
				bio: bio,
				picture: pictureAddress,
				address: address
			}

			// Generate user POD account
			const podAccount = this.route.forPODof(address);
			const podPayload = {
				owner: address,
				pod: 500,
				from: ""
			}

			// Generate user AUD account
			const audAccount = this.route.forAUDof(address);
			const audPayload = {
				owner: address,
				pod: 10,
				from: ""
			}

			// Generate user integrity record
			const integrityAccount = this.route.forIntegrityOf(address);
			const integrityPayload = {
				owner: address,
				i: 0.5,
				from: ""
			}

			// Generate record of this user's address owning this ID
			const ownershipAccount = this.route.forProfileWithID(id);
			const ownershipPayload = {
				id: id,
				owner: address
			};

			// Encrypt keypair
			const keyStore = this.route.forKeystoreOf(id, pw);
			RadixKeyStore.encryptKey(identity.keyPair, pw)
				.then(async encryptedKey => {

					// Store registration records
					return this.sendRecords(
						identity,
						[keyStore], encryptedKey,
						[profileAccount], profilePayload,
						[podAccount], podPayload,
						[audAccount], audPayload,
						[integrityAccount], integrityPayload,
						[ownershipAccount], ownershipPayload
					)

				})
				//TODO - Add this user to the index database
				//TODO - Auto-follow Podium master account
				.then(result => {
					if (setUser) { this.user = identity }
					//TODO - Resolve with keypair
					resolve(address)
				})
				.catch(error => reject(error))

		});

	}


	setUser(
			id,		// User Identifier
			pw 		// User password
		) {
		return new Promise((resolve, reject) => {
			this.getLatest(this.route.forKeystoreOf(id, pw))
				.then(encryptedKey => RadixKeyStore
					.decryptKey(encryptedKey.toJS(), pw))
				.then(keyPair => {
					this.user = new RadixSimpleIdentity(keyPair);
					resolve(true);
				})
				.catch(error => reject(error))
		})
	}


	updateUserIdentifier() {}


	swapUserIdentifiers() {}





// USER PROFILES

	updateUserDisplayName() {}

	updateUserBio() {}

	updateUserPicture() {}


	//TODO - handle multiple simultaneous requests
	//		 for the same record without multiple
	//		 calls to the network

	fetchProfile(
			target,		// The address (or ID) of the profile to be retreived
			id = false 	// Set true if passing an ID instead of an address
		) {
		return new Promise((resolve, reject) => {
			
			// Search on ID or Address
			if (id) {

				// Search on ID
				this.getLatest(this.route.forProfileWithID(target))
					.then(reference => resolve(
						this.fetchProfile(reference.get("address"))
					))
					.catch(error => reject(error))

			} else {

				// Search on address
				this.getLatest(this.route.forProfileOf(target))
					.then(result => {
						const profile = result.update(
							"picture",
							(p) => `${this.media}/${p}`
						)
						resolve(profile)
					})
					.catch(error => reject(error))

			}

		})
	}




// TOPICS

	createTopic(
			id,				// Unique identifier for topic
			name,			// Display name of topic
			description,	// Description of topic
			owner,			// Address of creating user
			identity = this.user
		) {
		if (!identity) { throw new Error("Missing Identity") }
		return new Promise((resolve, reject) => {

			// Resolve topic address
			const topicAccount = this.route.forTopicWithID(id);
			const topicAddress = topicAccount.getAddress();

			// Build topic record
			const topicRecord = {
				record: "topic",
				type: "topic",
				id: id,
				name: name,
				description: description,
				owner: owner,
				address: topicAddress
			}

			// Store topic
			this.sendRecord([topicAccount], topicRecord, identity)
				//TODO - Add topic to index database
				.then(result => resolve(fromJS(topicRecord)))
				.catch(error => reject(error))

		})
	}


	fetchTopic(
			target,		// The address (or ID) of the topic to be retreived
			id = false	// Set true if passing an ID instead of an address
		) {
		return new Promise((resolve, reject) => {
			
			// Search on ID or Address
			if (id) {

				// Search on ID
				this.getLatest(this.route.forTopicWithID(target))
					.then(reference => resolve(
						this.fetchTopic(reference.get("address"))
					))
					.catch(error => reject(error))

			} else {

				// Search on address
				this.getLatest(this.route.forTopic(target))
					.then(topic => resolve(topic))
					.catch(error => reject(error))

			}

		})
	}





// POSTS

	createPost(
			content,			// Content of new post
			references = [],	// References contained in new post
			parent = null,		// Record of post being replied to (if any)
			identity = this.user
		) {
		if (!identity) { throw new Error("Missing Identity") }
		return new Promise((resolve, reject) => {

			// Get user data
			const userAddress = identity.account.getAddress();

			// Build post accounts
			//TODO - Fix deterministic posting addresses
			//const postAccount = this.route.forNextPostBy(this.state.data.get("user"));
			const postAccount = this.route.forNewPost(content);
			const postAddress = postAccount.getAddress();

			// Build post record
			const postRecord = {
				record: "post",		// origin, amendment, retraction
				type: "post",
				content: content,
				address: postAddress,
				author: userAddress,
				parent: (parent) ? parent.get("address") : null,			
				origin: (parent) ? parent.get("origin") : postAddress,
				depth: (parent) ? parent.get("depth") + 1 : 0
			}

			// Build reference payload and destination accounts
			const refAccounts = [
				this.route.forPostsBy(userAddress)
				//TODO - Add to other indexes for topics, mentions, links
			];
			const refRecord = {
				record: "post",
				type: "reference",
				address: postAddress
			}

			// Build alert payload
			//TODO - build alerts system
			// const alertAccounts = []
			// const alertRecord = {
			// 	record: "alert",
			// 	type: "mention",
			// 	address: postAddress,
			// 	by: userAddress
			// 	created: time
			// }

			// Store records in ledger
			this.sendRecords(
					identity,
					[postAccount], postRecord,
					refAccounts, refRecord
				)
				.then(result => resolve(fromJS(postRecord)))
				.catch(error => reject(error))

		});

	}


	fetchPost(address) {
		return new Promise((resolve, reject) => {
			this.getHistory(this.route.forPost(address))
				.then(postHistory => resolve(
					postHistory.reduce(
						(p, nxt) => {
							// TODO - Merge edits and retractions
							//		  into a single cohesive map
							return p.mergeDeep(nxt);
						},
						Map({})
					)
				))
				.catch(error => reject(error))
		})
	}


	listenPosts(address, callback) {
		this.openChannel(
			this.route.forPostsBy(address),
			callback
		);
	}


	promotePost(
			address, 	// Radix address of post to be promoted
			promoter,	// Radix address of user promoting said post
			pod,		// Podium spent promoting the post
			aud = 0		// Audium spent promoting the post
		) {
		console.log("PROMOTED POST ", address);
	}


	reportPost() {}


	amendPost() {}


	retractPost() {}





// ALERTS

	listenAlerts(address, callback) {
		this.openChannel(
			this.route.forAlertsTo(address),
			callback
		);
	}




// FOLLOWING

	listenFollow(address, callback) {
		this.openChannel(
			this.route.forUsersFollowedBy(address),
			callback
		);
	}


	followUser(
			followAddress,	// Address of user now being followed by active user
			identity=this.user
		) {
		if (identity) { throw new Error("Missing Identity") }
		return new Promise((resolve, reject) => {

			// Get user data
			const userAddress = identity.account.getAddress();

			// Build follow account payload
			const followAccount = this.route.forFollowing(userAddress);
			const followRecord = {
				type: "follower index",
				address: userAddress,
			};

			// Build relation account and payload
			const relationAccount = this.route.forRelationOf(userAddress, followAddress);
			const relationRecord = {
				type: "follower record",
				users: [userAddress, followAddress],
				follow: true,
			};

			// Build following payload
			const followingAccount = this.route.forFollowsBy(userAddress);
			const followingRecord = {
				type: "following index",
				address: followAddress,
			};

			// Store following record
			this.sendRecords(
					identity,
					[followAccount], followRecord,
					[relationAccount], relationRecord,
					[followingAccount], followingRecord
				)
				//TODO - Alerts system
				.then((result) => resolve(result))
				.catch(error => reject(error))

		})

	}


	unfollowUser() {}


}

