import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiImmutable from 'chai-immutable';

import { Map, Set } from 'immutable';

import { RadixSimpleIdentity } from 'radixdlt';

import { Podium } from '../src/podium';
import { PodiumError } from '../src/podiumError';
import { PodiumUser, PodiumActiveUser } from '../src/podiumUser';
import { PodiumPost } from '../src/podiumPost';



chai.use(chaiImmutable);
chai.use(chaiAsPromised);


// Swallow event emitter warning
require('events').EventEmitter.prototype._maxListeners = 100;

// Helper for catching unfilled promises
// process.on('unhandledRejection', err => {
// 	console.log(err)
// 	process.exit(1)
// });


const testConfig = {

	"DebugMode": false,

	"Universe": "alphanet",
	"ApplicationID": "podium-TEST",
	"Timeout": 30,
	"Lifetime": 0,

	"Port": 3000,
	"API": "localhost:3000",

	"MediaStore": "media.podium-network.com",
	"FileLimit": "5mb",
	"ReloadConfig": 600,
	
	"DatabaseName": "db/podium.db",
	"BackupFrequency": 600
	
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



const testPostA = {
	content: "This is a test post!"
}




describe('Podium', function() {

	let podium;
	let userA;
	let userB;
	let passiveUserA;


	// Instantiate podium with a random App ID
	// to guarantee a clean test environment
	before(function() {
		testConfig.ApplicationID = "podium-TEST-" + Math.random()
		podium = (new Podium()).connect(testConfig)
	})


	// Ensure the podium object instantiated correctly
	it("instantiates", function() {
		return expect(podium).to.be.instanceOf(Podium)
	})

	it("connects")





// RECORDS

	describe("Records", function() {


// RECORDS > CREATION

		// Ensure podium can create records
		it("can be written to a Radix address")
		it("can be written to multiple Radix addresses")



// RECORDS > RETRIEVAL

		// Ensure podium can read records
		it("can retrieve records from a Radix address")
		it("identifies the latest record from a Radix address")

	})





// MEDIA

	describe("Media", function() {

		it("can save media to S3")
		it("does not write the same media to S3 twice")

	})




// USERS

	// Test users
	describe("Users", function() {

		this.timeout(100000)

		before(function(done) {
			var registerA = podium.createUser(
				testUserA.id,
				testUserA.password,
				testUserA.name,
				testUserA.bio
			)
			var registerB = podium.createUser(
				testUserB.id,
				testUserB.password,
				testUserB.name,
				testUserB.bio
			)

			Promise.all([registerA, registerB])
				.then(([a, b]) => {
					userA = a
					userB = b
					passiveUserA = podium.user(a.address)
					return passiveUserA.load()
				})
				.then(() => done())
				.catch(error => done(error))
		})



// USERS > CREATION

		it("can be created", function() {
			expect(userA).to
				.be.an.instanceOf(PodiumActiveUser)
			expect(userA).to
				.have.property("identity")
				.and.is.an.instanceOf(RadixSimpleIdentity)
			expect(userA).to
				.have.property("address")
				.and.be.a("string")
				.and.have.a.lengthOf(51)
				.and.match(/^9/)
		})


		it("can be created as read-only", function() {
			expect(passiveUserA).to
				.be.an.instanceOf(PodiumUser)
			expect(passiveUserA).to
				.not.have.property("identity")
			expect(passiveUserA).to
				.have.property("address")
				.and.be.a("string")
				.and.have.a.lengthOf(51)
				.and.match(/^9/)
		})


		it("can have their address retrieved from their ID", function() {
			var addressFromID = podium.isUser(testUserA.id)
			return expect(addressFromID).to.eventually
				.equal(userA.address)
		})


		it("cannot be created with the same ID as another user", function() {
			var dupeUser = podium.createUser(
				testUserA.id,
				testUserA.password,
				testUserA.name,
				testUserA.bio
			)
			return expect(dupeUser).to
				.be.rejectedWith(PodiumError)
				.and.eventually.satisfies(error => error.code === 3)
		})




// USERS > PROFILES

		describe("Profiles", function() {

			this.timeout(15000)

			let profileA;
			let profileFromPassive;

			before(function(done) {

				// Retreive profiles via 3 different routes
				var activeProfile = userA.profile()
				var passiveProfile = passiveUserA.profile()

				Promise.all([activeProfile, passiveProfile])
					.then(([a, b]) => {
						profileA = a
						profileFromPassive = b
						done()
					})
					.catch(error => done(error))

			})

			it("can be retrieved for the active user", function() {
				expect(profileA).to.be.an.instanceOf(Map)
			})

			it("can be retrieved for other users", function() {
				expect(profileFromPassive).to
					.be.an.instanceOf(Map)
					.and.have.property("created", profileA.get("created"))
			})

			it("have correct profile information", function() {
				expect(profileA).to.have.property("id", testUserA.id)
				expect(profileA).to.have.property("name", testUserA.name)
				expect(profileA).to.have.property("bio", testUserA.bio)
			})

			it("can have their profile ID changed")
			it("cannot change their profile ID to the same ID as another user")
			it("can have their password changed")
			it("can have their display name changed")
			it("can have their bio changed")
			it("can have their profile picture changed")

		})



// USERS > FOLLOWING

		describe("Following", function() {

			let result;
			before(function(done) {
				userA.follow(userB.address)
					.then(() => done())
					.catch(error => done(error))
			})



			it("can follow other users", function() {
				var testFollowing = userA.isFollowing(userB.address)
				return expect(testFollowing).to.eventually.be.true
			})


			it("can be followed by other users", function() {
				var testFollower = userB.isFollowedBy(userA.address)
				return expect(testFollower).to.eventually.be.true
			})


			it("can see which users they follow", function() {
				var followers = userB.followers()
				return expect(followers).to.eventually
					.be.an.instanceOf(Set)
					.and.have.size(1)
					.and.include(userA.address)
			})

			it("can see which users follow them", function() {
				var following = userA.followed()
				return expect(following).to.eventually
					.be.an.instanceOf(Set)
					.and.have.size(1)
					.and.include(userB.address)
			})

		})



// USERS > UNFOLLOWING

		describe("Unfollowing", function() {

			before(function(done) {
				userA.unfollow(userB.address)
					.then(() => setTimeout(() => done(), 10000))
					.catch(error => done(error))
			})



			it("can unfollow users", function() {
				var testUnfollowing = userA.isFollowing(userB.address)
				return expect(testUnfollowing).to.eventually.be.false
			})


			it("can be unfollowed by users", function() {
				var testUnfollowed = userB.isFollowedBy(userA.address)
				return expect(testUnfollowed).to.eventually.be.false
			})


			it("can correctly see which users they now follow", function() {
				var unfollowers = userB.followers(true)
				return expect(unfollowers).to.eventually
					.be.an.instanceOf(Set)
					.and.have.size(0)
			})


			it("can correctly see which users now follow them", function() {
				var unfollowing = userA.followed(true)
				return expect(unfollowing).to.eventually
					.be.an.instanceOf(Set)
					.and.have.size(0)
			})

		})



// USERS > POSTING

		describe("Posts", function() {

			this.timeout(15000)

			let postA;

			before(function(done) {
				userA.createPost(testPostA.content)
					.then(post => {
						postA = post
						done()
					})
					.catch(error => done(error))
			})



// USERS > POSTING > CREATION

			// Ensure users can write posts
			it("can create posts", function() {
				expect(postA).to
					.be.an.instanceOf(PodiumPost)
				expect(postA).to
					.have.property("address")
				expect(postA).to
					.have.property("author", userA.address)
			})

			it("have correct content", function() {
				var postContent = postA.content(true)
				return expect(postContent).to.eventually
					.have.property("content", testPostA.content)
			})

			it("can be retrieved by the posting user", function() {
				var postList = userA.posts(true)
				return expect(postList).to.eventually
					.be.an.instanceOf(Set)
					.and.have.size(1)
					.and.include(postA.address)
			})

			it("can be retrieved by other users", function() {
				var passivePostList = passiveUserA.posts(true)
				return expect(passivePostList).to.eventually
					.be.an.instanceOf(Set)
					.and.have.size(1)
					.and.include(postA.address)
			})



// USER > POSTING > MENTIONS

			describe("...with Mentions", function() {

				it("can create posts with mentions")

			})



// USER > POSTING > TOPICS

			describe("...with Topics", function() {

				it("can create posts with topics")

			})



// USER > POSTING > MEDIA

			describe("...with Media", function() {

				it("can create posts with media")

			})



// USER > POSTING > LINKS

			describe("...with Links", function() {

				it("can create posts with topics")

			})



// USER > POSTING > PROMOTING

			describe("Promoting", function() {

				// Ensure users can promote posts
				it("can promote posts of other users")
				it("receive promoted posts by users they follow")

			})


// USER > POSTING > REPORTING

// USER > POSTING > AMENDING

// USER > POSTING > RETRACTING


		})

	})


})






