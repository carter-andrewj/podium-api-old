import { Map, List, fromJS } from 'immutable';

import s3 from 'aws-sdk/clients/s3';

import FormData from 'form-data';
import fetch from 'node-fetch';

import { radixUniverse, RadixUniverse, RadixLogger,
		 RadixAccount, RadixUtil, RadixKeyPair,
		 RadixSimpleIdentity, RadixIdentityManager,
		 RadixKeyStore, RadixTransactionBuilder } from 'radixdlt';

import { PodiumError } from './podiumError';
import { PodiumRoutes } from './podiumRoutes';

import { PodiumUser, PodiumRemoteUser } from './podiumUser';
import { PodiumPost } from './podiumPost';

import { getAccount } from './utils';






export class Podium {



// INITIALIZATION

	constructor() {

		// Set up global variables
		this.route = new PodiumRoutes();
		this.channels = Map({});
		this.timers = Map({});
		this.debug = false;

	}


	connect(config) {

		// Set logging level
		this.setDebug(config.DebugMode);

		// Extract settings from config
		this.config = config;
		this.app = config.ApplicationID || "podium";
		this.timeout = config.Timeout || 3000;
		this.lifetime = config.Lifetime || 60000;
		
		// Connect to S3
		this.media = config.MediaStore || "https://media.podium-network.com/";
		this.S3 = new s3({
			apiVersion: '2006-03-01',
			region: 'eu-west-1',
			accessKeyId: process.env.AWS_ACCESS_KEY,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
		});

		// Connect to radix network
		//TODO - Test radix connection
		switch (config.Universe) {
			case ("sunstone"):
				radixUniverse.bootstrap(RadixUniverse.SUNSTONE);
				break;
			case ("highgarden"):
				radixUniverse.bootstrap(RadixUniverse.HIGHGARDEN);
				break;
			default: // Default to the alpha net
				radixUniverse.bootstrap(RadixUniverse.ALPHANET);
		}

		// Return the connected API
		return this

	}


	remote(config) {
		return (new PodiumRemote()).connect(config || this.config)
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
			RadixLogger.setLevel('silent')
		} else {
			console.log("Debug Mode On")
		}
	}

	debugOut() {
		if (this.debug) {
			console.log("PODIUM > ", ...arguments)
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

	storeRecord(
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


	storeRecords() {
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
			this.storeRecord(args[0], args[1], identity)
				.then(result => {
					if (args.length > 2) {
						this.storeRecords(identity, ...args.slice(2, args.length))
							.then(result => resolve(result))
							.catch(error => reject(error))
					} else {
						resolve(true)
					}
				})
				.catch(error => reject(error))

		})
	}


	storeMedia(image, imageURL) {
		return new Promise((resolve, reject) => {
			this.S3
				.putObject({
					Bucket: this.mediaStore,
					Key: imageURL,
					Body: Buffer.from(image, "base64"),
					ContentType: `image/${address.split(".")[1]}`
				})
				.promise()
				.then(() => resolve(address))
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
		let expire;
		this.debugOut("Fetching Account History (timeout: " + timeout + ")")
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

					// Log debug
					this.debugOut(" > Received: ", item.data.payload)

					// Cancel shortcut timer
					if (skipper) { clearTimeout(skipper) }

					// Unpack record
					var record = Map(fromJS(JSON.parse(item.data.payload)))
						.set("received", (new Date()).getTime())
						.set("created", item.data.timestamp);

					// Add record to history
					history = history.push(record);

					// Assume all records collated 1 second after first
					// (This won't work long-term, but serves as an
					// efficient fix for the timeout issue until the
					// radix lib can flag a channel as up to date).
					skipper = setTimeout(() => {
						this.debugOut(" > No record received for 1s. Resolving early.")
						channel.unsubscribe()
						clearTimeout(expire)
						resolve(history.sort((a, b) =>
							(a.get("created") > b.get("created")) ? 1 : -1
						))
					}, 1000);

				},
				error: error => {
					clearTimeout(expire)
					channel.unsubscribe();
					reject(error)
				}
			});

			// Set timeout
			const timeoutError = new PodiumError().withCode(2);
			expire = setTimeout(
				() => {
					channel.unsubscribe();
					if (history.size > 0) {
						this.debugOut(" > Timed out. Resolving with current history.")
						resolve(history.sort((a, b) =>
							(a.get("created") > b.get("created")) ? 1 : -1
						))
					} else {
						this.debugOut(" > Timed out. No history received.")
						reject(timeoutError)
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








// CREATE USERS

	createUser(
			id,			// Podium @ ID of new user account
			pw,			// Password for new user account
			name,		// Display name of new user account
			bio,		// Bio of new user account
			picture,
			ext
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

			//TODO - Ensure user does not already exist
			this.isUser(id)
				.then(address => {
					if (address) {
						reject((new PodiumError).withCode(3))
					} else {
				
						// Create user identity
						const identityManager = new RadixIdentityManager();
						const identity = identityManager.generateSimpleIdentity();
						const address = identity.account.getAddress();

						// Generate user public record
						const profileAccount = this.route.forProfileOf(address);
						const profilePayload = {
							record: "profile",
							type: "profile",
							id: id,
							name: name,
							bio: bio || "",
							picture: "",
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
							record: "ownership",
							type: "username",
							id: id,
							owner: address
						};

						// Encrypt keypair
						const keyStore = this.route.forKeystoreOf(id, pw);
						RadixKeyStore.encryptKey(identity.keyPair, pw)
							.then(async encryptedKey => {

								// Store registration records
								return this.storeRecords(
									identity,
									[keyStore], encryptedKey,
									[profileAccount], profilePayload,
									[podAccount], podPayload,
									[audAccount], audPayload,
									[integrityAccount], integrityPayload,
									[ownershipAccount], ownershipPayload
								)

							})
							//TODO - Auto-follow Podium master account
							.then(() => this.user(address).signIn(id, pw))
							.then(activeUser => {
								if (picture) {
									activeUser.updateProfilePicture(picture, ext)
										.then(() => resolve(activeUser))
										.catch(error => reject(error))
								} else {
									resolve(activeUser)
								}
							})
							.catch(error => reject(error))

					}
				})
				.catch(error => reject(error))

		});

	}


	user(address) {
		const newUser = new PodiumUser(this, address)
		newUser.load()
		return newUser
	}


	isUser(id) {
		return new Promise((resolve, reject) => {
			this.getLatest(this.route.forProfileWithID(id))
				.then(ownershipRecord =>
					resolve(ownershipRecord.get("owner"))
				)
				.catch(error => {
					if (error.code === 2) {
						resolve(false)
					} else {
						reject(error)
					}
				})
		})
	}





// POSTS

	post(address, author) {
		const newPost = new PodiumPost(this, address, author)
		newPost.load()
		return newPost
	}



// FETCH RECORDS

	//TODO - handle multiple simultaneous requests
	//		 for the same record without multiple
	//		 calls to the network

	// fetchProfile(
	// 		target,		// The address (or ID) of the profile to be retreived
	// 		id = false 	// Set true if passing an ID instead of an address
	// 	) {
	// 	return new Promise((resolve, reject) => {
			
	// 		// Search on ID or Address
	// 		if (id) {

	// 			// Search on ID
	// 			this.getLatest(this.route.forProfileWithID(target))
	// 				.then(reference => resolve(
	// 					this.fetchProfile(reference.get("owner"))
	// 				))
	// 				.catch(error => reject(error))

	// 		} else {

	// 			// Search on address
	// 			this.getHistory(this.route.forProfileOf(target))
	// 				.then(history => {
	// 					var profile = history.reduce((a, b) => a.mergeDeep(b))
	// 					resolve(profile.set("pictureURL",
	// 						`https://${this.media}/${profile.get("picture")}`))
	// 				})
	// 				.catch(error => reject(error))

	// 		}

	// 	})
	// }


	// fetchUserPostIndex(address) {
	// 	return new Promise((resolve, reject) => {
	// 		this.getHistory(this.route.forPostsBy(address))
	// 			.then(posts => resolve(
	// 				posts.map(i => i.get("address")).toSet()
	// 			))
	// 			.catch(error => reject(error))
	// 	})
	// }


	// fetchPost(address) {
	// 	return new Promise((resolve, reject) => {
	// 		this.getHistory(this.route.forPost(address))

	// 			// Collate post history into a single object
	// 			.then(postHistory => postHistory
	// 				.reduce((post, next) => {
	// 					// TODO - Merge edits and retractions
	// 					//		  into a single cohesive map

	// 					// Collate timestamps
	// 					const lastTime = post.get("created")
	// 					const nextTime = next.get("created")
	// 					let created;
	// 					let latest;
	// 					if (lastTime && nextTime) {
	// 						created = Math.min(lastTime, nextTime)
	// 						latest = Math.max(lastTime, nextTime)
	// 					} else {
	// 						created = lastTime || nextTime
	// 						latest = lastTime || nextTime
	// 					}

	// 					// Return completed post
	// 					resolve(post
	// 						.mergeDeep(next)
	// 						.set("created", created)
	// 						.set("latest", latest)
	// 					)

	// 				}, Map({}))
	// 			)

	// 			// Handle errors
	// 			.catch(error => reject(error))

	// 	})
	// }


	// fetchUserPromotionIndex(address) {
	// 	return new Promise((resolve, reject) => {
	// 		this.getHistory(this.route.forPromotionsBy(address))
	// 			.then(promos => resolve(promos
	// 				.map(p => p.get("address"))
	// 				.toSet()
	// 			))
	// 			.catch(error => reject(error))
	// 	})
	// }


	// fetchPostReplyIndex(address) {
	// 	return new Promise((resolve, reject) => {
	// 		this.getHistory(this.route.forRepliesToPost(address))
	// 			.then(replies => resolve(replies
	// 				.map(r => r.get("address"))
	// 				.toSet()
	// 			))
	// 			.catch(error => reject(error))
	// 	})
	// }


	// fetchPostPromotionIndex(address) {
	// 	return new Promise((resolve, reject) => {
	// 		this.getHistory(this.route.forPromosOfPost(address))
	// 			.then(promos => resolve(promos
	// 				.map(p => p.get("address"))
	// 				.toSet()
	// 			))
	// 			.catch(error => reject(error))
	// 	})
	// }


	// fetchTopic(
	// 		target,		// The address (or ID) of the topic to be retreived
	// 		id = false	// Set true if passing an ID instead of an address
	// 	) {
	// 	return new Promise((resolve, reject) => {
			
	// 		// Search on ID or Address
	// 		if (id) {

	// 			// Search on ID
	// 			this.getLatest(this.route.forTopicWithID(target))
	// 				.then(reference => resolve(
	// 					this.fetchTopic(reference.get("owner"))
	// 				))
	// 				.catch(error => reject(error))

	// 		} else {

	// 			// Search on address
	// 			this.getLatest(this.route.forTopic(target))
	// 				.then(topic => resolve(topic))
	// 				.catch(error => reject(error))

	// 		}

	// 	})
	// }


}










export class PodiumRemote extends Podium {



	connect(config) {
		return new Promise((resolve, reject) => {

			// Load remote config if none supplied
			if (!config) {
				this.fetchConfig()
					.then(config => {
						Podium.prototype.connect.call(this, config)
						resolve()
					})
					.catch(error => reject(error))
			} else {
				Podium.prototype.connect.call(this, config)
				resolve()
			}

		})
	}


	fetchConfig() {
		this.server = "https://api.podium-network.com";
		return new Promise((resolve, reject) => {
			fetch(this.server)
				.then(response => {
					if (!response.ok) {
						throw new PodiumError("Server Offline")
							.withCode(0)
					} else {
						fetch(this.server + "/config")
							.then(response => resolve(response.json()))
							.catch(error => reject(error))
					}
				})
				.catch(error => reject(error));
		})
	}



// SEND RECORDS

	// Prevent remote clients from writing directly
	// to the ledger, except via smart contract
	// CURRENTLY NOT ACTIVE WHILE IN DEVELOPMENT

	// storeRecord() {
	// 	throw (new PodiumError).withCode(100)
	// }

	// storeRecords() {
	// 	throw (new PodiumError).withCode(100)
	// }

	// storeMedia() {
	// 	throw (new PodiumError).withCode(100)
	// }



// SERVER INTERFACE

	dispatch(route, data) {
		this.debugOut(`Posting to ${this.server}/${route}:`, data)
		return new Promise((resolve, reject) => {
			var body = new FormData();
			Object.keys(data)
				.forEach(k => body.append(k, data[k]))
			fetch(`${this.server}/${route}`, {
					method: "POST",
					body: body
				})
				.then(result => {
					if (result.ok) {
						return result
					} else {
						throw new Error("Request failed with status:" + result.status)
					}
				})
				.then(result => {
					const output = result.json();
					this.debugOut(" > Response: ", output)
					resolve(fromJS(output))
				})
				.catch(error => reject(error))
		})
	}




// USERS

	createUser(
		id,			// Podium @ ID of new user account
		pw,			// Password for new user account
		name,		// Display name of new user account
		bio,		// Bio of new user account
		picture,	// Picture, as base64 string
		ext
		) {
		return new Promise((resolve, reject) => {
			this.dispatch("user", {
					id: id,
					pw: pw,
					name: name,
					bio: bio,
					picture: picture,
					ext: ext
				})
				.then(response => resolve(this.user(id, pw)))
				.catch(error => reject(error))
		})
	}


	user(address) {
		const newUser = new PodiumRemoteUser(this, address)
		newUser.load()
		return newUser
	}


	isUser(id) {

		// Dispatch

	}


}



