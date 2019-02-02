import { Map, List, fromJS } from 'immutable';

import Express from 'express';
// import session from 'express-session';
import BusBoy from 'busboy-body-parser';
import s3 from 'aws-sdk/clients/s3';
import loki from 'lokijs';
import { LokiStore } from 'connect-loki';
import { v4 as uuid } from 'uuid';
import keypair from 'keypair';
import crypto from 'crypto';

import FormData from 'form-data';
import fetch from 'node-fetch';

import { radixUniverse, RadixUniverse, RadixLogger,
		 RadixAccount, RadixUtil, RadixKeyPair,
		 RadixSimpleIdentity, RadixIdentityManager,
		 RadixKeyStore, RadixTransactionBuilder } from 'radixdlt';

import { PodiumError } from './podiumError';
import { PodiumPaths } from './podiumPaths';

import { PodiumUser, PodiumServerUser, PodiumClientUser } from './podiumUser';
import { PodiumPost, PodiumClientPost } from './podiumPost';

import { getAccount } from './utils';






export class Podium {



// INITIALIZATION

	constructor() {

		// Ensure required environment variables are set
		if (!process.env.AWS_ACCESS_KEY) {
			throw (new PodiumError).withCode(900)
		}
		if (!process.env.AWS_SECRET_ACCESS_KEY) {
			throw (new PodiumError).withCode(901)
		}

		// Set up global variables
		this.path = new PodiumPaths();
		this.channels = Map({});
		this.timers = Map({});
		this.debug = false;

	}


	connect(config={}) {
		//NOTE: This is a promise because the overriding
		//		methods in PodiumServer and PodiumClient
		//		need to return promises and this keeps
		//		handling consistent between the interfaces.
		return new Promise((resolve, reject) => {

			// Set logging level
			this.setDebug(config.DebugMode || false);

			// Extract settings from config
			this.config = fromJS(config);
			this.appID = config.ApplicationID || "podium";
			this.version = config.ApplicationVersion || 0;
			this.app = `${this.appID}|${this.version}`;
			this.launched = (new Date).getTime()
			this.timeout = config.Timeout || 10000;
			this.lifetime = config.Lifetime || 60000;

			// Set root user, if provided
			this.rootAddress = config.RootAddress;
			
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
			resolve(this)

		})
	}


	becomeClient(config) {
		return (new PodiumClient()).connect(config || this.config.toJS())
	}

	becomeServer(config) {
		return (new PodiumServer()).connect(config || this.config.toJS())
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
			console.log(this.constructor.name, " > ", ...arguments)
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
			identity,	// Identity object of the storing user [RadixIdentity]
			accounts,	// Destination accounts for record [Array]
			payload		// Payload of record to be sent [Object{}]
		) {
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
						false
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

			// Get identity
			const identity = args[0]

			// Break out accounts and records
			var inputs = List(args.slice(1, args.length))

			// Build promises
			var storing = inputs
				.groupBy((_, i) => Math.floor(i / 2.0))
				.map(([accounts, payload]) =>
					this.storeRecord(identity, accounts, payload)
				)

			// Wait for promises to complete
			Promise.all(storing)
				.then(() => resolve())
				.catch(error => reject(error))

		})
	}


	storeMedia(image, imageURL) {
		return new Promise((resolve, reject) => {
			this.S3
				.putObject({
					Bucket: this.media,
					Key: imageURL,
					Body: Buffer.from(image, "base64"),
					ContentType: `image/${imageURL.split(".")[1]}`
				})
				.promise()
				.then(() => resolve())
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
		this.debugOut(`Fetching Account History (timeout: ${timeout}s)`)
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
					this.debugOut("Received: ", item.data.payload)

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
						this.debugOut("No record received for 1s. Resolving early.")
						channel.unsubscribe()
						clearTimeout(expire)
						resolve(history.sort((a, b) =>
							(a.get("created") > b.get("created")) ? 1 : -1
						))
					}, 1000);

				},
				error: error => {
					this.debugOut("Encountered Error", error.message)
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
						this.debugOut("Timed out. Resolving with current history.")
						resolve(history.sort((a, b) =>
							(a.get("created") > b.get("created")) ? 1 : -1
						))
					} else {
						this.debugOut("Timed out. No history received.")
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



	createNetwork() {
		return new Promise((resolve, reject) => {

			// Increment network version to ensure
			// empty Radix atom space
			this.version = this.version + 1
			this.app = `${this.appID}|${this.version}`

			this.config = this.config
				.set("ApplicationVersion", this.version)

			// Log out network settings
			if (!this.config.get("SupressCreateNetworkOutput")) {
				console.log(`Created New Network: ${this.app}`)
			}

			// Reset database
			const rootUserData = this.config.get("RootUser")
			const rootPassword = uuid()
			this.createUser(
					rootUserData.get("ID"),
					rootPassword,
					rootUserData.get("Name"),
					rootUserData.get("Bio")
				)
				.then(rootUser => {

					// Log out credentials
					if (!this.config.get("SupressCreateNetworkOutput")) {
						console.log(`Created Root User`)
						console.log(` > ID: ${rootUserData.get("ID")}`)
						console.log(` > Password: ${rootPassword}`)
						console.log(` > Address: ${rootUser.address}`)
					}

					// Store address and resolve
					this.rootAddress = rootUser.address
					this.rootUser = rootUser
					this.config = this.config
						.set("RootAddress", this.rootAddress)
					resolve(this)

				})
				.catch(error => reject(error))

		})
	}




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
						const profileAccount = this.path.forProfileOf(address);
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
						const podAccount = this.path.forPODof(address);
						const podPayload = {
							owner: address,
							pod: 500,
							from: ""
						}

						// Generate user AUD account
						const audAccount = this.path.forAUDof(address);
						const audPayload = {
							owner: address,
							pod: 10,
							from: ""
						}

						// Generate user integrity record
						const integrityAccount = this.path.forIntegrityOf(address);
						const integrityPayload = {
							owner: address,
							i: 0.5,
							from: ""
						}

						// Generate record of this user's address owning this ID
						const ownershipAccount = this.path.forProfileWithID(id);
						const ownershipPayload = {
							record: "ownership",
							type: "username",
							id: id,
							owner: address
						};

						// Encrypt keypair
						const keyStore = this.path.forKeystoreOf(id, pw);
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

								// Auto-follow root account
								let followPromise;
								if (this.rootAddress) {
									followPromise = activeUser
										.follow(this.rootAddress)
								}

								// Set user's profile picture
								let picturePromise;
								if (picture) {
									picturePromise = activeUser
										.updateProfilePicture(picture, ext)
								}

								// Wait for tasks to complete
								Promise.all([followPromise, picturePromise])
									.then(() => resolve(activeUser))
									.catch(error => reject(error))

							})
							.catch(error => reject(error))

					}
				})
				.catch(error => reject(error))

		});

	}


	user(address) {
		const newUser = new PodiumUser(this, address)
		return newUser
	}


	isUser(id) {
		return new Promise((resolve, reject) => {
			this.getLatest(this.path.forProfileWithID(id))
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
		return newPost
	}



}




export class PodiumServer extends Podium {



	connect(config={}) {
		return new Promise((resolve, reject) => {

			// Call parent method
			Podium.prototype.connect.call(this, config)
			this.port = config.ServerPort || 3000

			// Generate keypair
			const serverKeys = keypair();
			this.config = this.config
				.set("publicKey", serverKeys.public)
			this.publicKey = serverKeys.public
			this.privateKey = serverKeys.private

			// Initialize database
			this.initDB()
				.then(db => {
					this.db = db
					resolve(this)
				})
				.catch(error => reject(error))

		})
	}


	createNetwork() {
		return new Promise((resolve, reject) => {

			// Increment network version to ensure
			// empty Radix atom space
			this.version = this.version + 1
			this.app = `${this.appID}|${this.version}`

			this.config = this.config
				.set("ApplicationVersion", this.version)

			const rootUserData = this.config.get("RootUser")
			const rootPassword = uuid()

			// Log out network settings
			if (!this.config.get("SupressCreateNetworkOutput")) {
				console.log(`Created New Network: ${this.app}`)
			}

			// Reset database
			this.resetDB()
				.then(() => this.createUser(
					rootUserData.get("ID"),
					rootPassword,
					rootUserData.get("Name"),
					rootUserData.get("Bio")
				))
				.then(rootUser => {

					// Log out credentials
					if (!this.config.get("SupressCreateNetworkOutput")) {
						console.log(`Created Root User`)
						console.log(` > ID: ${rootUserData.get("ID")}`)
						console.log(` > Password: ${rootPassword}`)
						console.log(` > Address: ${rootUser.address}`)
					}

					// Store address and resolve
					this.rootAddress = rootUser.address
					this.rootUser = rootUser
					this.config = this.config
						.set("RootAddress", this.rootAddress)
					resolve(this)

				})
				.catch(error => reject(error))

		})
	}



// DATABASE

	initDB() {
		return new Promise((resolve, reject) => {
			let db = new loki(`${this.app}.db`, {
				autosave: true, 
				autosaveInterval: this.config.get("BackupFrequency"),
				autoload: true,
				autoloadCallback: () => {

					// Confirm or create store for user records
					const users =
						db.getCollection("users") ||
						db.addCollection("users", {
							unique: ["id", "address"]
						});

					// Confirm or create store for alerts
					let alerts = db.getCollection("alerts")
					if (!alerts) {
						alerts = db.addCollection("alerts", {
							ttl: 7 * 24 * 60 * 60 * 1000,		// Alerts are kept for 1 week
							ttlInterval: 24 * 60 * 60 * 1000	// And cleared out daily
						})
					}

					//TODO - Initialize topics, etc...

					//TODO - Add dynamic views for quick searching, curating, etc...

					// Make sure the db save object is created
					db.saveDatabase(() => resolve(db))

				}
			})
		})
	}


	resetDB() {
		return new Promise((resolve, reject) => {
			this.db.deleteDatabase()
			this.initDB()
				.then(db => {
					this.db = db
					resolve()
				})
				.catch(error => reject(error))
		})
	}




// ENDPOINT

	serve() {

		// Create server
		this.server = Express()

		// Set up post body and file parsing
		this.server.use(BusBoy({
			limit: this.config.get("FileLimit")
		}));

		// Set up CORS
		//TODO - Make this more secure than just allowing everything through
		this.server.use((request, response, next) => {
			response.header(
				"Access-Control-Allow-Origin",
				request.headers.origin
			);
			response.header(
				"Access-Control-Allow-Methods",
				"GET,PUT,POST,DELETE"
			);
			response.header(
				"Access-Control-Allow-Headers",
				"Origin, X-Requested-With, Content-Type, Accept"
			);
			next();
		})

		// Set up routes
		this.routes()

		//TODO - Safely handle server shutdown

		// Start server
		this.server.listen(
			this.port,
			() => this.debugOut(`Podium served on port ${this.port}`)
		)

		return this.server

	}


	routes() {

		// Ping route
		this.server.get("/", (request, response) => {
			response.status(200).json({}).end()
		})

		// Config route
		this.server.get("/config", (request, response) => {
			response
				.status(200)
				.json(this.config.toJS())
				.end()
		})

		// User management
		this.createUserRoute()
		this.isUserRoute()

		// Alerts
		this.alertsRoute()
		this.clearAlertsRoute()

		// Search
		this.searchRoute()

		// Following/Unfollowing
		this.followRoute()
		this.unfollowRoute()

		// Posting
		this.createPostRoute()

	}





// USER CREATION

	createUser(
			id,			// Podium @ ID of new user account
			pw,			// Password for new user account
			name,		// Display name of new user account
			bio,		// Bio of new user account
			picture,
			ext
		) {
		return new Promise((resolve, reject) => {
			Podium.prototype.createUser.call(this,
					id,
					pw,
					name,
					bio,
					picture,
					ext
				)
				.then(activeUser => {
					this.db
						.getCollection("users")
						.insert({
							address: activeUser.address,
							id: id
						})
					resolve(activeUser)
				})
				.catch(error => reject(error))
		})
	}


	createUserRoute() {
		this.server
			.post("/user", (request, response) => {

				// Unpack input data
				const data = request.body

				// Create user records
				this.createUser(
						data.id,
						data.pw,
						data.name,
						data.bio,
						data.picture,
						data.ext
					)
					.then(activeUser => response
						.status(200)
						.json({ address: activeUser.address })
						.end()
					)
					.catch(error => response
						.status(500)
						.json({
							podiumError: error.podiumError,
							error: error.message,
							code: error.podiumError ? error.code : 500
						})
						.end()
					)

			})
	}


	user(address) {
		return new PodiumServerUser(this, address)
	}


	isUser(id) {
		return new Promise((resolve, reject) => {
			const check = this.db
				.getCollection("users")
				.findOne({ id: id })
			const result = check ? check.address : false
			resolve(result)
		})
	}


	isUserRoute() {
		this.server
			.post("/isuser", (request, response) => {
				this.isUser(request.body.id)
					.then(result => response
						.status(200)
						.json({ result: result })
						.end()
					)
					.catch(error => response
						.status(500)
						.json({
							podiumError: error.podiumError,
							error: error.message,
							code: error.podiumError ? error.code : 500
						})
						.end()
					)
			})
	}




// SEARCH

	search(target) {
		return new Promise((resolve, reject) => {
			const records = this.db
				.getCollection("users")
				.find({ "id": { "$regex": target }})
			const results = fromJS(records)
				.map(rec => rec.get("address"))
				.toSet()
			resolve(results)
		})
	}


	searchRoute() {
		this.server
			.post("/search", (request, response) => {

				// Search database
				this.search(request.body.target)
					.then(results => response
						.status(200)
						.json(results.toJS())
						.end()
					)
					.catch(error => response
						.status(500)
						.json({
							podiumError: error.podiumError,
							error: error.message,
							code: error.podiumError ? error.code : 500
						})
						.end()
					)

			})
	}




// USER ROUTES

	withIdentity(encryptedKeyPair) {
		return new Promise((resolve, reject) => {
			// const wrappedKeyPair = JSON.parse(crypto.privateDecrypt(
			// 	{
			// 		key: this.privateKey,
			// 		padding: constants.RSA_NO_PADDING
			// 	},
			// 	encryptedKeyPair,
			// ))
			RadixKeyStore
				.decryptKey(
					JSON.parse(encryptedKeyPair),
					this.publicKey
				)
				.then(keyPair => {
					const identity = new RadixSimpleIdentity(keyPair)
					resolve(this.user().activeUser(identity))
				})
				.catch(error => reject(error))
		})
	}


	alertsRoute() {
		this.server
			.post("/alerts", (request, response) => {

				// Unpack request
				const data = request.body

				// Get alerts
				this.withIdentity(data.keyPair)
					.then(user => user.alerts(data.limit))
					.then(alerts => {
						response
						.status(200)
						.json({ alerts: alerts.toJS() })
						.end()
					})
					.catch(error => response
						.status(500)
						.json({
							podiumError: error.podiumError,
							error: error.message,
							code: error.podiumError ? error.code : 500
						})
						.end()
					)

			})
	}


	clearAlertsRoute() {
		this.server
			.post("/clearalerts", (request, response) => {

				// Unpack request
				const data = request.body

				// Get alerts
				this.withIdentity(data.keyPair)
					.then(user => user.clearAlerts(
						fromJS(JSON.parse(data.ids))
					))
					.then(alerts => response
						.status(200)
						.json({})
						.end()
					)
					.catch(error => response
						.status(500)
						.json({
							podiumError: error.podiumError,
							error: error.message,
							code: error.podiumError ? error.code : 500
						})
						.end()
					)

			})
	}


	followRoute() {
		this.server
			.post("/follow", (request, response) => {

				// Unpack request
				const data = request.body

				// Unfollow subject
				this.withIdentity(data.keyPair)
					.then(user => user.follow(data.address))
					.then(() => response
						.status(200)
						.json({})
						.end()
					)
					.catch(error => response
						.status(500)
						.json({
							podiumError: error.podiumError,
							error: error.message,
							code: error.podiumError ? error.code : 500
						})
						.end()
					)

			})
	}


	unfollowRoute() {
		this.server
			.post("/unfollow", (request, response) => {

				// Unpack request
				const data = request.body

				// Unfollow subject
				this.withIdentity(data.keyPair)
					.then(user => user.unfollow(data.address))
					.then(() => response
						.status(200)
						.json({})
						.end()
					)
					.catch(error => response
						.status(500)
						.json({
							podiumError: error.podiumError,
							error: error.message,
							code: error.podiumError ? error.code : 500
						})
						.end()
					)

			})
	}


	createPostRoute() {
		this.server
			.post("/post", (request, response) => {

				// Unpack request
				const data = request.body
				const refs = fromJS(JSON.parse(data.references))

				// Unfollow subject
				this.withIdentity(data.keyPair)
					.then(user => user.createPost(
						data.text,
						fromJS(JSON.parse(data.references)),
						//TODO - Currently expects 'parent' to
						//		 be a post object. Fix.
						data.parentAddress
					))
					.then(post => response
						.status(200)
						.json({ address: post.address })
						.end()
					)
					.catch(error => response
						.status(500)
						.json({
							podiumError: error.podiumError,
							error: error.message,
							code: error.podiumError ? error.code : 500
						})
						.end()
					)

			})
	}


}









export class PodiumClient extends Podium {



	connect(config={}) {
		return new Promise((resolve, reject) => {

			// Store server address
			this.serverURL = config.ServerURL || "https://api.podium-network.com"

			// Check server connection
			fetch(this.serverURL)
				.then(response => {

					// Throw an error if server not found
					if (!response.ok) {
						reject((new PodiumError()).withCode(0))
					} else {

						// Initialize class locally, if required
						if (config.LocalConfig) {
							Podium.prototype.connect.call(this, config)
							resolve(this)

						// Otherwise, load config from the server
						} else {
							fetch(`${this.serverURL}/config`)
								.then(response => response.json())
								.then(serverConfig => {
									Podium.prototype.connect
										.call(this, serverConfig)
									this.publicKey = serverConfig.publicKey
									resolve(this)
								})
								.catch(error => reject(error))
						}

					}

				})
				.catch(error => reject(error));

		})
	}



// SEND RECORDS

	// Prevent remote clients from writing directly
	// to the ledger, except via smart contract

	storeRecord() {
		throw (new PodiumError).withCode(101)
	}

	storeRecords() {
		throw (new PodiumError).withCode(101)
	}

	storeMedia() {
		throw (new PodiumError).withCode(101)
	}

	createNetwork() {
		throw (new PodiumError).withCode(102)
	}


// SERVER INTERFACE

	dispatch(route, data, identity) {
		this.debugOut(`Posting to ${this.serverURL}${route}:`, data)
		return new Promise(async (resolve, reject) => {

			// Build request body
			var body = new FormData();
			Object.keys(data).forEach(k => {
				if (data[k]) { body.append(k, data[k]) }
			})

			// Add credentials to body, if required
			if (identity) {
				const encryptedKeyPair = await RadixKeyStore
					.encryptKey(identity.keyPair, this.publicKey)
					.catch(error => reject(error))
				// const encryptedKeyPair = crypto.publicEncrypt(
				// 	{
				// 		key: this.publicKey,
				// 		padding: constants.RSA_NO_PADDING
				// 	},
				// 	new Buffer.from(JSON.stringify(wrappedKeyPair))
				// )
				body.append("keyPair", JSON.stringify(encryptedKeyPair))
			}

			// Post data
			fetch(`${this.serverURL}${route}`, {
					method: "POST",
					body: body
				})

				// Check response for errors
				.then(async response => {
					if (response.ok) {
						return response.json()
					} else {
						await response.json()
							.then(error => {
								let err;
								if (error.podiumError) {
									err = (new PodiumError())
										.withCode(error.code)
								} else {
									err = new Error("Request failed: " +
													error.error)
								}
								reject(err)
							})
							.catch(error => reject(error))
					}
				})

				// Return response data
				.then(result => {
					this.debugOut(" > Response: ", result)
					resolve(fromJS(result))
				})

				// Handle errors
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
			this.dispatch("/user", {
					id: id,
					pw: pw,
					name: name,
					bio: bio,
					picture: picture,
					ext: ext
				})
				.then(response => {
					return this.user(response.get("address"))
						.signIn(id, pw)
				})
				.then(activeUser => resolve(activeUser))
				.catch(error => reject(error))
		})
	}


	user(address) {
		const newUser = new PodiumClientUser(this, address)
		newUser.load()
		return newUser
	}


	isUser(id) {
		return new Promise((resolve, reject) => {
			this.dispatch("/isuser", { id: id })
				.then(response => resolve(response.get("result")))
				.then(activeUser => resolve(activeUser))
				.catch(error => reject(error))
		})
	}


	post(address, author) {
		const newPost = new PodiumClientPost(this, address, author)
		newPost.load()
		return newPost
	}




// SEARCH

	search(target) {
		return new Promise((resolve, reject) => {
			this.dispatch("/search", { target: target })
				.then(results => resolve(results.toSet()))
				.catch(error => reject(error))
		})
	}



}





