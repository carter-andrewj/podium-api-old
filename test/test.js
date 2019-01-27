import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiImmutable from 'chai-immutable';

import { Map, List } from 'immutable';

import { RadixSimpleIdentity } from 'radixdlt';

import Podium from '../src/podium';
import PodiumUser from '../src/podiumUser';



chai.use(chaiImmutable);
chai.use(chaiAsPromised);




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




describe('Podium', function() {

	let podium;
	let userA;
	let userB;
	let userC;


	// Instantiate podium with a random App ID
	// to guarantee a clean test environment
	before(function() {
		testConfig.ApplicationID = "podium-TEST-" + Math.random()
		podium = new Podium(testConfig)
	})


	// Ensure the podium object instantiated correctly
	it("instantiates", function() {
		return expect(podium).to.be.instanceOf(Podium)
	})





// RECORDS

	describe("Records", function() {


// RECORDS > CREATION

		// Ensure podium can create records
		it("can write a single record to a Radix address")
		it("can write multiple records to multiple Radix addresses")



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
			var registerA = podium.newUser(
				testUserA.id,
				testUserA.password,
				testUserA.name,
				testUserA.bio
			)
			var registerB = podium.newUser(
				testUserB.id,
				testUserB.password,
				testUserB.name,
				testUserB.bio
			)
			Promise.all([registerA, registerB])
				.then(([a, b]) => {
					userA = a
					userB = b
					done()
				})
				.catch(error => done(error))
		})



// USERS > CREATION

		it("can be created", function() {
			expect(userA).to
				.be.an.instanceOf(PodiumUser)
			expect(userA).to
				.have.property("identity")
				.and.is.an.instanceOf(RadixSimpleIdentity)
			expect(userA).to
				.have.property("address")
				.and.be.a("string")
				.and.have.a.lengthOf(51)
				.and.match(/^9/)
		})

		it("cannot be created with the same ID as another user")

		it("automatically follow the podium root account")



// USERS > PROFILES

		describe("Profiles", function() {

			this.timeout(15000)

			let profileA;
			let profileFromAddress;
			let profileFromID;

			before(function(done) {

				// Retreive profiles via 3 different routes
				var activeProfile = userA.profile()
				var addressProfile = podium.fetchProfile(userA.address)
				var idProfile = podium.fetchProfile(testUserA.id, true)

				Promise.all([activeProfile, addressProfile, idProfile])
					.then(([a, b, c]) => {
						profileA = a
						profileFromAddress = b
						profileFromID = c
						done()
					})

			})

			it("can be retrieved for the active user", function() {
				expect(profileA).to.be.an.instanceOf(Map)
			})

			it("can be retrieved via address lookup", function() {
				expect(profileFromAddress).to
					.be.an.instanceOf(Map)
					.and.have.property("created", profileA.get("created"))
			})

			it("can be retrieved via ID lookup", function() {
				expect(profileFromID).to
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

			// Ensure users can follow each other
			it("can follow other users", function() {
				var testFollowing = userA.isFollowing(userB.address)
				return expect(testFollowing).to.eventually.be.true
			})
			it("can be followed by other users", function() {
				var testFollower = userB.isFollowedBy(userA.address)
				return expect(testFollower).to.eventually.be.true
			})
			it("cannot follower users the active user is already following")

			// Ensure users can retrieve follower data
			it("can see which users they follow", function() {
				var followers = userB.followers()
				return expect(followers).to.eventually
					.be.an.instanceOf(List)
					.and.have.size(1)
					.and.include(userA.address)
			})
			it("can see which users follow them", function() {
				var following = userA.usersFollowed()
				return expect(following).to.eventually
					.be.an.instanceOf(List)
					.and.have.size(1)
					.and.include(userB.address)
			})



// USERS > UNFOLLOWING

			describe("Unfollowing", function() {

				before(function(done) {
					userA.unfollow(userB.address)
						.then(() => done())
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
				it("cannot unfollow users the active user is not already following")

				// Ensure users can retrieve updated follower data
				it("can correctly see which users they now follow", function() {
					var unfollowers = userB.followers(true)
					return expect(unfollowers).to.eventually
						.be.an.instanceOf(List)
						.and.have.size(0)
				})
				it("can correctly see which users now follow them", function() {
					var unfollowing = userA.usersFollowed(true)
					return expect(unfollowing).to.eventually
						.be.an.instanceOf(List)
						.and.have.size(0)
				})

			})

		})


// USERS > POSTING

		describe("Posts", function() {



// USERS > POSTING > CREATION

			// Ensure users can write posts
			it("can create posts")
			it("can create posts with mentions")
			it("can create posts with topics")
			it("can create posts with media")
			it("can create posts with links")



// USER > POSTING > PROMOTING

			describe("Promoting", function() {

				// Ensure users can promote posts
				it("can promote posts of other users")
				it("receive promoted posts by users they follow")

			})


		})

	})


})






