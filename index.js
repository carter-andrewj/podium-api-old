import { radixUniverse, RadixUniverse, //RadixLogger,
		 RadixSimpleIdentity, RadixIdentityManager,
		 RadixKeyStore, RadixTransactionBuilder } from 'radixdlt';




function getAccount(seed) {
	const hash = RadixUtil.hash(Buffer.from(seed));
	return new RadixAccount(RadixKeyPair.fromPrivate(hash));
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
		return getAccount("podium-keystore-for-" + id + pw)
	}
	forProfileWithID(id) {	//TODO - Implement
		return getAccount("podium-ownership-of-id-" + id)
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
		return getAccount("podium-topic-with-id-" + id);
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



class Podium {

	constructor(
			universe,		// ID of Radix node universe to join
			appID,			// Radix Application ID for current deployment of Podium
			server = "https://api.podium-network.com",		// URL of Podium server
			timeout = 3,	// Default timeout on pending radix requests (seconds)
			lifetime = 300,	// Default lifetime of inactive radix connections before termination (seconds)
			debug = false,	// Enables/disables debug mode (verbose output, etc...)
		) {

		//TODO - Test server connection

		// Set up global variables
		this.route = new Routes();
		this.app = appID;
		this.timeout = timeout;
		this.lifetime = lifetime;
		this.server = server;
		this.channels = {};
		this.timers = {};

		// Connect to radix network
		//TODO - Test radix connection
		switch (universe) {
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
				throw new Error("Unknown Radix Universe: " + universe);
		}

		// Set logging level
		// if (!debug) {
		// 	RadixLogger.setLevel('error')
		// }

	}



	getAccount(seed) {
		return getAccount(seed);
	}




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

		}, lifetime);

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
		Object.keys(this.timers).foreach((t) => stopTimer(t));

	}

	cleanUpChannels() {

		// Closes all open Channels
		Object.keys(this.channels).foreach((c) => closeChannel(c));

	}

	cleanUp() { 
		cleanUpTimers();
		cleanUpChannels();
	}




	init() {

	}

	alive() {

	}



	sendRecord(
			accounts,		// Destination accounts for record [Array]
			payload,		// Payload of record to be sent [Object{}]
			identity,		// Radix identity of sending user [RadixIdentity]
			encrypt = false // Encrypt record with user's identity?
		) {
		return new Promise((resolve) => {
			if (accounts.length === 0) {
				resolve(false);
			} else {
				RadixTransactionBuilder
					.createPayloadAtom(
						accounts,
						this.app,
						JSON.stringify(payload),
						encrypt
					)
					.signAndSubmit(identity)
					.subscribe({ complete: async () => resolve(true) });
			}
		});
	}





	getHistory(
			account,				// Account to retreive all records from
			timeout = this.timeout 	// Assume history is empty after X seconds inactivity
		) {

		// Pulls all current values from a radix
		// -account- and closes the channel connection.

		// Open the account connection
		account.openNodeConnection();

		// Connect to account data
		const stream = account.dataSystem
			.getApplicationData(this.appID)
			.timeoutWith(timeout * 1000, Promise.resolve(false));

		// Fetch the data
		return new Promise((resolve) => {
			const history = [];
			const channel = stream
				.subscribe({
					//TODO - Rewrite to pull until up-to-date once
					//		 radix provides the required flag.
					//		 Currently, this just collates all
					//		 input until timeout.
					next: item => {
						if (!item) {
							channel.unsubscribe();
							resolve(history);
						} else {
							history.push(JSON.parse(item.data.payload));
						}
					},
					error: error => {
						channel.unsubscribe();
						throw new error(error)
					}
				});
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
		return new Promise((resolve) => {
			this.getHistory(account, timeout)
				.then(history => {
					if (history.constructor === Array && history.length > 0) {
						resolve(history[history.length - 1]);
					} else if (Object.keys(history).length > 0) {
						resolve(history);
					} else {
						resolve({});
					}
				});
		});

	}


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
				const result = JSON.parse(item.data.payload);
				callback(result);

			},
			error: error => {

				// Run callback
				if (typeof(onError) === "function") {
					onError(error);
				} else {
					closeChannel(address);
					throw error;
				}

			}
		});

		// Log open channel
		this.channels.address = {
			timer: timer,
			channel: channel
		}

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



	uploadMedia() {}



	registerUser(
			id,		// Podium @ ID of new user account
			pw,		// Password for new user account
			name,	// Display name of new user account
			bio,	// Bio of new user account
			picture	// Picture address (in media archive) of user's profile picture
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

		// Create output promise
		return new Promise((resolve) => {

			// Create user identity
			const identityManager = new RadixIdentityManager();
			const identity = identityManager.generateSimpleIdentity();
			const address = identity.account.getAddress();

			//TODO - Store picture, if present

			// Generate user public record
			const profileAccount = this.route.forProfileOf(address);
			const profilePayload = {
				record: "user",
				type: "profile",
				id: id,
				name: name,
				bio: bio,
				picture: pictureAddress,
				created: (new Date()).getTime(),
				address: address
			}

			// Generate user POD account
			const podAccount = this.route.forPODof(address);
			const podPayload = {
				owner: address,
				pod: 500,
				on: (new Date()).getTime(),
				from: ""
			}

			// Generate user integrity record
			const integrityAccount = this.route.forIntegrityOf(address);
			const integrityPayload = {
				owner: address,
				i: 0.5,
				on: (new Date()).getTime(),
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
				.then(async (encryptedKey) => {

					// Store registration records
					this.sendRecord([keyStore], encryptedKey, identity)
						.then(await this.sendRecord([profileAccount], profilePayload, identity))
						.then(await this.sendRecord([podAccount], podPayload, identity))
						.then(await this.sendRecord([integrityAccount], integrityPayload, identity))
						.then(await this.sendRecord([rosterAccount], rosterPayload, identity))
						.then(await this.sendRecord([ownershipAccount], ownershipPayload, identity))
						//TODO - Add this user to the index database
						//TODO - Auto-follow Podium master account
						.then(() => { resolve(true); });

				})
				.catch((error) => {

					// Throw errors, if any
					throw error;

					// Resolve false to ensure continued functionality in case
					// thrown error is caught and ignored by a higher-level try
					// statement
					resolve(false);

				});

		});

	}


	signIn(
			id,		// User Identifier
			pw 		// User password
		) {

		return new Promise((resolve) => {

			const keyStore = this.route.forKeystoreOf(id, pw);
			this.getLatest(keyStore, 20)
				.then(async (encryptedKey) => {

					// Check key successfully returned
					if (!encryptedKey) { resolve(false) }

					// Decrypt keys
					RadixKeyStore.decryptKey(encryptedKey, pw)
				    	.then(async (keyPair) => {
							const identity = new RadixSimpleIdentity(keyPair);
							resolve(identity);
						})
						.error(resolve(false));

				})

		})

	}



	updateUserDisplayName() {}

	updateUserBio() {}

	updateUserPicture() {}



	updateUserIdentifier() {}

	swapUserIdentifiers() {}




	getProfile(address) {
		return new Promise((resolve) => {
			getLatest(this.route.forProfileOf(address))
				.then(profile => {
					profile.received = (new Date()).getTime();
					resolve(Map(fromJS(profile)))
				})
				.error(resolve(false))
		})
	}


	getPost(address) {
		return new Promise((resolve) => {
			getLatest(this.route.forPost(address))
				.then(post => {
					post.received = (new Date()).getTime();
					resolve(Map(fromJS(profile)))
				})
				.error(resolve(false))
		})
	}




	listenPosts(address, callback) {
		openChannel(
			this.route.forPostsBy(address),
			callback
		);
	}


	listenAlerts(address, callback) {
		openChannel(
			this.route.forAlertsTo(address),
			callback
		);
	}


	listenFollow(address, callback) {
		openChannel(
			this.route.forUsersFollowedBy(address),
			callback
		);
	}




	followUser(
			userAddress,	// Address of active user
			followAddress	// Address of user now being followed by active user
		) {

		return new Promise((resolve) => {

			// Build follow account payload
			const followAccount = this.route.forFollowing(userAddress);
			const followRecord = {
				type: "follower index",
				address: userAddress,
				timestamp: time
			};

			// Build relation account and payload
			const relationAccount = this.route.forRelationOf(userAddress, followAddress);
			const relationRecord = {
				type: "follower record",
				users: [userAddress, followAddress],
				follow: true,
				timestamp: time
			};

			// Build following payload
			const followingAccount = this.route.forFollowsBy(userAddress);
			const followingRecord = {
				type: "following index",
				address: followAddress,
				timestamp: time
			};

			// Store following record
			this.sendRecord([followAccount], followRecord)
				.then(await this.sendRecord([relationAccount], relationRecord))
				.then(await this.sendRecord([followingAccount], followingRecord))
				//TODO - Alerts system
				.then(resolve());

		})

	}



	unfollowUser() {}



	sendPost(
			userAddress,		// Podium address of posting user
			content,			// Content of new post
			references = [],	// References contained in new post
			parent = null		// Record of post being replied to (if any)
		) {

		// Return promise (true == success | false == fail)
		return new Promise((resolve) => {

			// Build post accounts
			//TODO - Fix deterministic posting addresses
			//const postAccount = Channel.forNextPostBy(this.state.data.get("user"));
			const postAccount = Channel.forNewPost(content);
			const postAddress = postAccount.getAddress();

			// Get timestamp
			//TODO - Is this needed? Does Radix not timestamp
			//		 the payload itself?
			const time = (new Date()).getTime();

			// Build post record
			const postRecord = {
				record: "post",		// origin, amendment, retraction
				type: "post",
				content: content,
				address: postAddress,
				author: userAddress,
				parent: (parent) ? parent.get("address") : null,			
				origin: (parent) ? parent.get("origin") : postAddress,
				depth: (parent) ? parent.get("depth") + 1 : 0,
				created: time
			}

			// Build reference payload and destination accounts
			const refAccounts = [
				this.route.forPostsBy(userAddress)
				//TODO - Add to other indexes for topics, mentions, links
			];
			const refRecord = {
				record: "post",
				type: "reference",
				address: postAddress,
				created: time
			}

			// Build alert payload
			//TODO - build alerts system
			const alertAccounts = []
			const alertRecord = {
				record: "alert",
				type: "mention",
				address: postAddress,
				by: userAddress
				created: time
			}

			// Store records in ledger
			this.sendRecord([postAccount], postRecord)
				.then(await this.sendRecord(refAccounts, refRecord))
				.then(await this.sendRecord(alertAccounts, alertRecord))
				.then(resolve());

		});

	}

	promotePost(
			address, 	// Radix address of post to be promoted
			promoter,	// Radix address of user promoting said post
			pod,		// Podium spent promoting the post
			aud = 0		// Audium spent promoting the post
		) {
		console.log("PROMOTED POST ", address);
	}

	reportPost(address) {
		console.log("REPORTED POST ", address);
	}

	amendPost(address, content) {
		console.log("AMEND POST ", address, content);
	}

	retractPost(address, content) {
		console.log("RETRACT POST, ", address, content);
	}


	// Generate topic channel
	createTopic(
			id,				// Unique identifier for topic
			name,			// Display name of topic
			description		// Description of topic
		) {

		// Return promise
		return new Promise((resolve) => {

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
				owner: this.user.address,
				address: topicAddress
			}

			// Store topic
			this.sendRecord([topicAccount], topicRecord)
				//TODO - Add topic to index database
				.then(resolve(true));

		})

	}


}

