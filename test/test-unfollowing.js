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


	it("can correctly see which users they now follow", function() {
		var unfollowers = this.otherUser.followers(true)
		return expect(unfollowers).to.eventually
			.be.an.instanceOf(Set)
			.and.have.size(0)
	})


	it("can correctly see which users now follow them", function() {
		var unfollowing = this.user.followed(true)
		return expect(unfollowing).to.eventually
			.be.an.instanceOf(Set)
			.and.have.size(0)
	})

}


