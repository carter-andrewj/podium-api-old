import chai, { expect } from 'chai';

import { Map, Set, List, fromJS } from 'immutable';

import { PodiumPost } from '../src/podiumPost';




export function preparePosts(env, done) {

	env.timeout(30 * 1000)

	// Create post
	env.user
		.createPost(env.postData.text)

		// Reply to post
		.then(post => {
			env.post = post
			return env.post.content(true)
		})
		.then(postContent => {
			env.postContent = postContent
			return env.otherUser.createPost(
				env.replyData.text,
				Map(),
				env.post.address
			)
		})

		// Reply to reply with a mention
		.then(reply => {
			env.reply = reply
			return env.reply.content(true)
		})
		.then(replyContent => {
			env.replyContent = replyContent
			return env.user.createPost(
				env.threadData.text,
				fromJS({ mentions: [env.otherUser.address] }),
				env.reply.address
			)
		})

		.then(thread => {
			env.thread = thread
			return env.thread.content(true)
		})
		.then(threadContent => {
			env.threadContent = threadContent
			done()
		})

		.catch(error => done(error))

}


export function shouldCreatePosts() {


	it("can be created", function() {
		expect(this.post).to
			.be.an.instanceOf(PodiumPost)
		expect(this.post).to
			.have.property("address")
	})


	it("cannot be created with no text")
	// And other content validation checks


	it("have correct content", function() {
		expect(this.postContent).to
			.have.property("text", this.postData.text)
		expect(this.postContent).to
			.have.property("parent", null)
		expect(this.postContent).to
			.have.property("grandparent", null)
		expect(this.postContent).to
			.have.property("origin", this.post.address)
		expect(this.postContent).to
			.have.property("depth", 0)
	})


	it("can be indexed by the posting user", function() {
		var postList = this.user.postIndex(true)
		return expect(postList).to.eventually
			.be.an.instanceOf(Set)
			.and.have.size(2)
			.and.include(this.post.address)
			.and.include(this.thread.address)
	})


	it("can be indexed by other users", function() {
		var passivePostList = this.passiveUser.postIndex(true)
		return expect(passivePostList).to.eventually
			.be.an.instanceOf(Set)
			.and.have.size(2)
			.and.include(this.post.address, this.thread.address)
	})

	
	it("can receive replies", function() {
		expect(this.reply).to
			.be.an.instanceOf(PodiumPost)
		expect(this.reply).to
			.have.property("address")
	})


	it("cannot be sent as a reply to a non-existent post")


	it("can receive replies with correct content", function() {
		expect(this.replyContent).to
			.have.property("text", this.replyData.text)
		expect(this.replyContent).to
			.have.property("parent", this.post.address)
		expect(this.replyContent).to
			.have.property("grandparent", null)
		expect(this.replyContent).to
			.have.property("origin", this.post.address)
		expect(this.replyContent).to
			.have.property("depth", 1)
	})


	it("can receive replies to replies", function() {
		expect(this.thread).to
			.be.an.instanceOf(PodiumPost)
		expect(this.thread).to
			.have.property("address")
	})

	it("can receive replies to replies with correct content", function() {
		expect(this.threadContent).to
			.have.property("text", this.threadData.text)
		expect(this.threadContent).to
			.have.property("parent", this.reply.address)
		expect(this.threadContent).to
			.have.property("grandparent", this.post.address)
		expect(this.threadContent).to
			.have.property("origin", this.post.address)
		expect(this.threadContent).to
			.have.property("depth", 2)
	})


	it("can index replies", function(done) {
		var replyPromise = this.post.replyIndex(true)
		var threadPromise = this.reply.replyIndex(true)
		Promise.all([replyPromise, threadPromise])
			.then(([replyIndex, threadIndex]) => {
				expect(replyIndex).to
					.be.an.instanceOf(Set)
					.and.have.size(1)
					.and.include(this.reply.address)
				expect(threadIndex).to
					.be.an.instanceOf(Set)
					.and.have.size(1)
					.and.include(this.thread.address)
				done()
			})
			.catch(error => done(error))
	})


	it("can mention other users", function() {
		expect(this.postContent).to
			.have.property("mentions")
			.and.be.an.instanceOf(List)
			.and.have.size(0)
		expect(this.replyContent).to
			.have.property("mentions")
			.and.be.an.instanceOf(List)
			.and.have.size(0)
		expect(this.threadContent).to
			.have.property("mentions")
			.and.be.an.instanceOf(List)
			.and.have.size(1)
			.and.include(this.otherUser.address)
	})


	it("can include topics")


	it("can include media")


	it("can include links")




// USER > POSTING > PROMOTING

	describe("Promoting", function() {

		// Ensure users can promote posts
		it("can promote posts of other users")
		it("receive promoted posts by users they follow")

	})

// USER > POSTING > REPORTING

// USER > POSTING > AMENDING

// USER > POSTING > RETRACTING

}


export function shouldCreatePostAlerts() {

	it("sends alerts on replies", function(done) {
		this.user
			.alerts(false, 100, true)
			.then(alerts => {
				expect(alerts).to
					.be.instanceOf(List)
					.and.have.size(1)
				expect(alerts.get(0)).to
					.have.property("type", "reply")
				expect(alerts.get(0)).to
					.have.property("from", this.otherUser.address)
				expect(alerts.get(0)).to
					.have.property("to", this.user.address)
				expect(alerts.get(0)).to
					.have.property("about", this.reply.address)
				done()
			})
			.catch(error => done(error))
	})

	it("sends alerts on mentions", function(done) {
		this.otherUser
			.alerts(false, 100, true)
			.then(alerts => {
				expect(alerts).to
					.be.instanceOf(List)
					.and.have.size(3) // Follow > Mention > Reply
				expect(alerts.get(1)).to
					.have.property("type", "mention")
				expect(alerts.get(1)).to
					.have.property("from", this.user.address)
				expect(alerts.get(1)).to
					.have.property("to", this.otherUser.address)
				expect(alerts.get(1)).to
					.have.property("about", this.thread.address)
				done()
			})
			.catch(error => done(error))
	})

}




export function shouldCachePostData() {

	it("caches post content", function(done) {
		this.timeout(10)
		this.thread.content(false)
			.then(content => {
				expect(content).to
					.have.property("text", this.threadData.text)
				expect(content).to
					.have.property("text", this.thread.text)
				expect(content).to
					.have.property("author", this.user.address)
				expect(content).to
					.have.property("author", this.thread.authorAddress)
				expect(content).to
					.have.property("parent", this.reply.address)
				expect(content).to
					.have.property("parent", this.thread.parentAddress)
				expect(content).to
					.have.property("grandparent", this.post.address)
				expect(content).to
					.have.property("grandparent", this.thread.grandparentAddress)
				expect(content).to
					.have.property("origin", this.post.address)
				expect(content).to
					.have.property("origin", this.thread.originAddress)
				expect(content).to
					.have.property("depth", 2)
				expect(content).to
					.have.property("depth", this.thread.depth)
				expect(content).to
					.equal(this.thread.cache.get("content"))
				done()
			})
			.catch(error => done(error))
	})

	it("caches index of posts per user", function(done) {
		this.timeout(10)
		this.user.postIndex(false)
			.then(posts => {
				expect(posts).to
					.be.an.instanceOf(Set)
					.and.have.size(2)
					.and.include(this.post.address)
					.and.include(this.thread.address)
				expect(posts).to
					.equal(this.user.cache.get("posts"))
				done()
			})
			.catch(error => done(error))
	})

	it("caches index of replies per post", function(done) {
		this.timeout(10)
		this.post.replyIndex(false)
			.then(replies => {
				expect(replies).to
					.be.an.instanceOf(Set)
					.and.have.size(1)
					.and.include(this.reply.address)
				expect(replies).to
					.equal(this.post.cache.get("replies"))
				done()
			})
			.catch(error => done(error))
	})

}




