import chai, { expect } from 'chai';

import { Set } from 'immutable';


export function prepareUnfollow(env, done) {
	env.timeout(30 * 1000)
	env.user
		.unfollow(env.otherUser.address)
		.then(() => setTimeout(() => done(), 10000))
		.catch(error => done(error))
}


export function shouldUnfollow() {

	it("can unfollow users", function() {
		var testUnfollowing = this.user
			.isFollowing(this.otherUser.address)
		return expect(testUnfollowing).to.eventually.be.false
	})


	it("can be unfollowed by users", function() {
		var testUnfollowed = this.otherUser
			.isFollowedBy(this.user.address)
		return expect(testUnfollowed).to.eventually.be.false
	})

}


export function shouldUnfollowWithoutRoot() {

	it("can correctly see which users now follow them", function() {
		var unfollowers = this.otherUser.followerIndex(true)
		return expect(unfollowers).to.eventually
			.be.an.instanceOf(Set)
			.and.have.size(0)
	})


	it("can correctly see which users they now follow", function() {
		var unfollowing = this.user.followingIndex(true)
		return expect(unfollowing).to.eventually
			.be.an.instanceOf(Set)
			.and.have.size(0)
	})

}



export function shouldUnfollowWithRoot() {

	it("can correctly see which users now follow them", function() {
		var unfollowers = this.otherUser.followerIndex(true)
		return expect(unfollowers).to.eventually
			.be.an.instanceOf(Set)
			.and.have.size(0)
	})


	it("can correctly see which users they now follow", function() {
		var unfollowing = this.user.followingIndex(true)
		return expect(unfollowing).to.eventually
			.be.an.instanceOf(Set)
			.and.have.size(1)
			.and.include(this.podium.rootAddress)
	})

}



export function shouldCacheUnfollowData() {

	it("removes departing followers from the cache", function(done) {
		this.timeout(10)
		this.otherUser
			.followerIndex(false)
			.then(followers => {
				expect(followers).to
					.be.an.instanceOf(Set)
					.and.have.size(0)
				expect(followers).to
					.equal(this.otherUser.cache.get("followers"))
				done()
			})
			.catch(error => done(error))
	})

	it("removes unfollowed users from the cache", function(done) {
		this.timeout(10)
		this.user
			.followingIndex(false)
			.then(followed => {
				expect(followed).to
					.be.an.instanceOf(Set)
					.and.have.size(1)
					.and.include(this.podium.rootAddress)
				expect(followed).to
					.equal(this.user.cache.get("followed"))
				done()
			})
			.catch(error => done(error))
	})

}




