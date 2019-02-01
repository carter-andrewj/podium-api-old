import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiImmutable from 'chai-immutable';
import chaiHttp from 'chai-http';

import * as fs from 'fs';
import * as path from 'path';

import { Map, Set, List } from 'immutable';

import Express from 'express';

import { RadixSimpleIdentity } from 'radixdlt';

import { Podium, PodiumServer, PodiumClient } from '../src/podium';
import { PodiumError } from '../src/podiumError';
import { PodiumUser, PodiumActiveUser,
		 PodiumServerUser, PodiumServerActiveUser,
		 PodiumClientUser, PodiumClientActiveUser } from '../src/podiumUser';
import { PodiumPost } from '../src/podiumPost';

import { prepareUsers, shouldCreateUsers } from './test-users';
import { prepareProfiles, shouldCreateProfiles } from './test-profiles';
import { prepareFollow, shouldFollow,
		 shouldCreateFollowAlerts } from './test-following';
import { prepareUnfollow, shouldUnfollow } from './test-unfollowing';
import { preparePosts, shouldCreatePosts,
		 shouldCreatePostAlerts } from './test-posting';
import { shouldFlagSeenAlerts, shouldCleanUpOldAlerts } from './test-alerts';


chai.use(chaiImmutable);
chai.use(chaiAsPromised);
chai.use(chaiHttp);


// Swallow event emitter warning
require('events').EventEmitter.prototype._maxListeners = 1000;

// Helper for catching unfilled promises
// process.on('unhandledRejection', err => {
// 	console.log(err)
// 	process.exit(1)
// });


const testConfig = {

	"DebugMode": false,
	"LocalConfig": false,

	"Universe": "alphanet",
	"ApplicationID": `podium-TEST-${Math.random()}`,
	"Timeout": 10,
	"Lifetime": 0,

	"ServerURL": "http://localhost:3333",

	"MediaStore": "test-media.podium-network.com",
	"FileLimit": "5mb",
	"ReloadConfig": 600,
	
	"DatabaseName": "test/testdata/test.db",
	"BackupFrequency": 600,

	"ServerPort": 3333,
	"SessionName": "podium-test",
	"ServerSecretKey": "secret-test-key"

}


const testUserA = {
	id: "testuserA",
	password: "passwordA",
	name: "Test User A",
	bio: "This is the bio of Test User A",
}

const testUserB = {
	id: "testuserB",
	password: "passwordB",
	name: "Test User B",
	bio: "This is the bio of Test User B"
}

const testUserC = {
	id: "testuserC",
	password: "passwordC",
	name: "Test User C",
	bio: "This is the bio of Test User C"
}

const testUserD = {
	id: "testuserD",
	password: "passwordD",
	name: "Test User D",
	bio: "This is the bio of Test User D"
}

const testUserE = {
	id: "testuserE",
	password: "passwordE",
	name: "Test User E",
	bio: "This is the bio of Test User E"
}

const testUserF = {
	id: "testuserF",
	password: "passwordF",
	name: "Test User F",
	bio: "This is the bio of Test User F"
}


const testPostA = {
	text: "This is a test post!"
}
const testReplyA = {
	text: "This is a test reply."
}
const testThreadA = {
	text: "This is a test thread..."
}


const testPostB = {
	text: "This is also a test post!"
}
const testReplyB = {
	text: "This is also a test reply."
}
const testThreadB = {
	text: "This is also a test thread..."
}


const testPostC = {
	text: "This is another test post!"
}
const testReplyC = {
	text: "This is another test reply."
}
const testThreadC = {
	text: "This is another test thread..."
}


const testImage = "./test/testdata/testImage.jpg"
const testImageName = `testImage${Math.floor(Math.random() * 10000)}.jpg`


let podium;



describe('Podium', function() {

	this.timeout(5000)

	// Instantiate podium with a random App ID
	// to guarantee a clean test environment
	before(function(done) {
		(new Podium())
			.connect(testConfig)
			.then(api => {
				podium = api
				this.podium = api
				done()
			})
			.catch(error => done(error))
	})


	// Ensure the podium object instantiated correctly
	it("instantiates", function() {
		return expect(this.podium).to.be.instanceOf(Podium)
	})





// MEDIA

	describe("Media", function() {

		before(function(done) {

			// Check what items are in the test bucket
			this.podium.S3
				.listObjects({
					Bucket: this.podium.media
				})
				.promise()

				// Delete any items that remain
				.then(data => {
					if (data.Contents.length > 0) {
						const targets = data.Contents.map(item => {
							return { Key: item.Key }
						})
						return this.podium.S3
							.deleteObjects({
								Bucket: this.podium.media,
								Delete: {
									Objects: targets
								}
							})
							.promise()
					} else {
						return
					}
				})

				// Upload the test image
				.then(() => {
					fs.readFile(testImage, (err, data) => {
						this.image = new Buffer
							.from(data, 'binary')
							.toString('base64')
						this.podium
							.storeMedia(this.image, testImageName)
							.then(() => done())
							.catch(error => done(error))
					})
				})

				// Handle errors
				.catch(error => done(error))

		})


		it("can save media to S3", function(done) {
			this.podium.S3
				.getObject({
					Bucket: this.podium.media,
					Key: testImageName
				})
				.promise()
				.then(data => {
					const checkImage = data.Body.toString("base64")
					expect(checkImage).to.equal(this.image)
					done()
				})
				.catch(error => done(error))
		})

		it("cannot save media to S3 if larger than the file size limit")

	})




// USERS

	// Test users
	describe("Users", function() {

		// Set up user testing environment
		before(function(done) {
			this.userData = testUserA
			this.otherUserData = testUserB
			this.userType = PodiumActiveUser
			this.passiveUserType = PodiumUser
			this.testImage = testImage
			prepareUsers(this, done)
		})


		// Test User Creation
		shouldCreateUsers()


		// Test Media
		describe("Media", function() {
			it("can register and save media")
			it("second upload of same image does not create duplicate")
		})


		// Test Profiles
		describe("Profiles", function() {
			before(function(done) {
				prepareProfiles(this, done)
			})
			shouldCreateProfiles()
		})


		// Test Following
		describe("Following...", function() {
			before(function(done) {
				prepareFollow(this, done)
			})
			shouldFollow()
			describe("...and Unfollowing", function() {
				before(function(done) {
					prepareUnfollow(this, done)
				})
				shouldUnfollow()
			})
		})


		// Test Posting
		describe("Posting", function() {
			before(function(done) {
				this.postData = testPostA
				this.replyData = testReplyA
				this.threadData = testThreadA
				preparePosts(this, done)
			})
			shouldCreatePosts()
		})



	})




	// Test server API
	describe("Server", function() {

		this.timeout(60000)

		// Set up server testing environment
		before(function(done) {
			podium
				.becomeServer()
				.then(server => {
					this.podium = server
					return Promise.all([
						this.podium.resetDB(),
						this.podium.serve()
					])
				})
				.then(() => done())
				.catch(error => done(error))
		})

		it("instiantiates", function() {
			expect(this.podium).to
				.be.an.instanceOf(PodiumServer)
		})

		it("accepts requests", function(done) {
			chai.request(testConfig.ServerURL)
  				.get('/')
  				.end((err, res) => {
  					expect(err).to.be.null
  					expect(res).to.have.status(200)
  					done()
  				})
		})

		it("has an empty database on startup", function() {
			var dbUsers = this.podium
				.db.getCollection("users").count()
			expect(dbUsers).to.equal(0)
		})




		describe("Server Users", function() {

			before(function(done) {
				this.userData = testUserC
				this.otherUserData = testUserD
				this.userType = PodiumServerActiveUser
				this.passiveUserType = PodiumServerUser
				this.testImage = testImage
				prepareUsers(this, done)
			})


			// Test User Creation
			shouldCreateUsers()

			it("are added to the user roster", function() {
				var dbUsers = this.podium
					.db.getCollection("users")
				var userCount = dbUsers.count()
				var userRecord = dbUsers.findOne({ "id": this.userData.id })
				expect(userCount).to
					.equal(2)
				expect(userRecord).to
					.have.property("id", this.userData.id)
				expect(userRecord).to
					.have.property("address", this.user.address)
			})

			it("can receive alerts", function() {
				var alerts = this.user.alerts(1, true)
				return expect(alerts).to.eventually
					.be.instanceOf(List)
					.and.have.size(0)
			})


			// Test Profiles
			describe("Server Profiles", function() {
				before(function(done) {
					prepareProfiles(this, done)
				})
				shouldCreateProfiles()
			})


			// Test Following
			describe("Server Following...", function() {

				before(function(done) {
					prepareFollow(this, done)
				})

				shouldFollow()
				shouldCreateFollowAlerts()

				describe("...and Unfollowing", function() {
					before(function(done) {
						prepareUnfollow(this, done)
					})
					shouldUnfollow()
				})

			})


			// Test Posting
			describe("Server Posting", function() {
				before(function(done) {
					this.postData = testPostB
					this.replyData = testReplyB
					this.threadData = testThreadB
					preparePosts(this, done)
				})
				shouldCreatePosts()
				shouldCreatePostAlerts()
			})


			// Test alerts cleanup
			describe("Alerts", function() {
				shouldFlagSeenAlerts()
			})


		})



		describe("Client", function() {

			before(function(done) {
				this.podiumServer = this.podium
				podium
					.becomeClient()
					.then(client => {
						this.podium = client
						done()
					})
					.catch(error => done(error))
			})

			it("instiantiates the client", function() {
				expect(this.podium).to
					.be.an.instanceOf(PodiumClient)
			})

			describe("Client Users", function() {

				before(function(done) {
					this.userData = testUserE
					this.otherUserData = testUserF
					this.userType = PodiumClientActiveUser
					this.passiveUserType = PodiumClientUser
					this.testImage = testImage
					prepareUsers(this, done)
				})


				// Test user creation
				shouldCreateUsers()

				it("are added to the user roster", function() {
					var dbUsers = this.podiumServer.db.getCollection("users")
					var userCount = dbUsers.count()
					var userRecord = dbUsers.findOne({ "id": this.userData.id })
					expect(userCount).to.equal(4)
					expect(userRecord).to.have.property("id", this.userData.id)
					expect(userRecord).to.have.property("address", this.user.address)
				})


				// Test Profiles
				describe("Client Profiles", function() {
					before(function(done) {
						prepareProfiles(this, done)
					})
					shouldCreateProfiles()
					it("caches profiles")
				})


				// Test Following
				describe("Client Following...", function() {
					before(function(done) {
						prepareFollow(this, done)
					})
					shouldFollow()
					shouldCreateFollowAlerts()
					it("caches index of followers")
					it("caches index of followed users")
					describe("...and Unfollowing", function() {
						before(function(done) {
							prepareUnfollow(this, done)
						})
						shouldUnfollow()
						it("removes unfollowed users from cached index")
					})
				})


				// Test Posting
				describe("Client Posting", function() {
					before(function(done) {
						this.postData = testPostC
						this.replyData = testReplyC
						this.threadData = testThreadC
						preparePosts(this, done)
					})
					shouldCreatePosts()
					shouldCreatePostAlerts()
					it("caches post content")
					it("caches index of posts per user")
					it("caches index of replies per post")
				})


				// Test alerts cleanup
				describe("Alerts", function() {
					shouldFlagSeenAlerts()
				})

			})


			// Test global alerts cleanup
			describe("Alerts Cleanup", function() {
				shouldCleanUpOldAlerts()
			})



		})

	})
	


})






