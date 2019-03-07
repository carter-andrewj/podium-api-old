import chai, { expect } from 'chai';

import { Map, OrderedSet, List, fromJS } from 'immutable';

import { PodiumPost } from '../src/podiumPost';
import { PodiumError } from '../src/podiumError';
import { postCost } from '../src/utils';




export function preparePosts(env, done) {

	env.timeout(30 * 1000)

	// Listen for posting users
	env.postCount = 0
	env.user.onPost(() => env.postCount += 1)

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
			var replyPromise = env.otherUser.createPost(
				env.replyData.text,
				Map(),
				env.post.address
			)
			var chainPromise = env.user.createPost(
				env.longData.text,
				Map(),
				env.post.address
			)
			return Promise.all([replyPromise, chainPromise])
		})

		// Reply to reply with a mention
		.then(([reply, chain]) => {
			env.reply = reply
			env.chain = chain
			const replyContent = env.reply.content(true)
			const chainContent = env.chain.content(true)
			return Promise.all([replyContent, chainContent])
		})
		.then(([replyContent, chainContent]) => {
			env.replyContent = replyContent
			env.chainContent = chainContent
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


	// it("cannot be created with no text", function() {
	// 	var emptyPost = this.user.createPost("", Map())
	// 	return expect(emptyPost).to
	// 		.be.rejectedWith(PodiumError)
	// 		.and.eventually.satisfy(error => error.code === 4)
	// })


	// it("cannot reply to non-existent posts", function() {
	// 	var badReply = this.user.createPost(this.postData.text, Map(), "badaddress")
	// 	return expect(badReply).to
	// 		.be.rejectedWith(PodiumError)
	// 		.and.eventually.satisfy(error => error.code === 5)
	// })


	it("have correct content", function() {
		expect(this.postContent).to
			.have.property("text", this.postData.text)
		expect(this.postContent).to
			.have.property("entries", 1)
		expect(this.postContent).to
			.have.property("parent", null)
		expect(this.postContent).to
			.have.property("grandparent", null)
		expect(this.postContent).to
			.have.property("origin", this.post.address)
		expect(this.postContent).to
			.have.property("depth", 0)
		expect(this.postContent).to
			.have.property("chain", 0)
	})


	it("cost the right number of tokens", function(done) {
		this.retries(2)
		Promise.all([
				this.user.transactionIndex(true),
				this.user.getBalance(true),
				this.otherUser.transactionIndex(true),
				this.otherUser.getBalance(true)
			])
			.then(([transactions, balance,
					otherTransactions, otherBalance]) => {

				// Calculate expected post costs
				const cost = postCost(this.postData.text)
				const replyCost = postCost(this.replyData.text)
				const threadCost = postCost(this.threadData.text)
				const chainCost = postCost(this.longData.text)

				// Check costs match with balances
				expect(transactions).to
					.be.instanceOf(List)
					.and.have.size(5)
				expect(balance).to
					.equal(900 - cost - threadCost - chainCost)

				expect(otherTransactions).to
					.be.instanceOf(List)
					.and.have.size(3)
				expect(otherBalance).to
					.equal(1100 - replyCost)

				done()
			
			})
			.catch(done)
	})


	it("cannot be created with insufficient funds", function() {
		var insufficientFundsPost = this.user.getBalance(true)
			.then(balance => this.user
				.createTransaction(this.otherUser.address, balance)
			)
			.then(() => new Promise(resolve => setTimeout(resolve, 5000)))
			.then(() => this.user.getBalance())
			.then(balance => {
				expect(balance).to.equal(0)
				return this.user.createPost(this.postData.text, Map())
			})
		return expect(insufficientFundsPost).to
			.be.rejectedWith(PodiumError)
			.and.eventually.satisfy(error => error.code === 6)
	})


	it("can be indexed by the posting user", function() {
		var postList = this.user.postIndex(true)
		return expect(postList).to.eventually
			.be.an.instanceOf(OrderedSet)
			.and.have.size(3)
			.and.include(this.post.address)
			.and.include(this.thread.address)
	})


	it("can be indexed by other users", function() {
		var passivePostList = this.passiveUser.postIndex(true)
		return expect(passivePostList).to.eventually
			.be.an.instanceOf(OrderedSet)
			.and.have.size(3)
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
			.have.property("entries", 1)
		expect(this.replyContent).to
			.have.property("parent", this.post.address)
		expect(this.replyContent).to
			.have.property("grandparent", null)
		expect(this.replyContent).to
			.have.property("origin", this.post.address)
		expect(this.replyContent).to
			.have.property("depth", 1)
		expect(this.replyContent).to
			.have.property("chain", 0)
	})


	it("can be created with too much text for 1 payload", function() {
		expect(this.chain).to
			.be.an.instanceOf(PodiumPost)
		expect(this.chain).to
			.have.property("address")
	})

	it("have correct content when requiring multiple payloads", function() {
		expect(this.chainContent).to
			.have.property("text", this.longData.text)
		expect(this.chainContent).to
			.have.property("entries", 3)
		expect(this.chainContent).to
			.have.property("parent", this.post.address)
		expect(this.chainContent).to
			.have.property("grandparent", null)
		expect(this.chainContent).to
			.have.property("origin", this.post.address)
		expect(this.chainContent).to
			.have.property("depth", 1)
		expect(this.chainContent).to
			.have.property("chain", 1)
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
			.have.property("entries", 1)
		expect(this.threadContent).to
			.have.property("parent", this.reply.address)
		expect(this.threadContent).to
			.have.property("grandparent", this.post.address)
		expect(this.threadContent).to
			.have.property("origin", this.post.address)
		expect(this.threadContent).to
			.have.property("depth", 2)
		expect(this.threadContent).to
			.have.property("chain", 0)
	})


	it("can index replies", function(done) {
		var replyPromise = this.post.replyIndex(true)
		var threadPromise = this.reply.replyIndex(true)
		Promise.all([replyPromise, threadPromise])
			.then(([replyIndex, threadIndex]) => {
				expect(replyIndex).to
					.be.an.instanceOf(OrderedSet)
					.and.have.size(2)
					.and.include(this.reply.address)
				expect(threadIndex).to
					.be.an.instanceOf(OrderedSet)
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


	it("can listen to user's posts", function() {
		expect(this.postCount).to.equal(3)
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

}


export function shouldCreatePostAlerts() {

	it("sends alerts on replies", function(done) {
		this.user
			.alerts(false, 100, true)
			.then(alerts => {

				expect(alerts).to
					.be.instanceOf(List)

				const replyAlerts = alerts
					.filter(a => a.get("type") === "reply")
					.toList()
				expect(replyAlerts).to
					.have.size(1)

				expect(replyAlerts.first()).to
					.have.property("type", "reply")
				expect(replyAlerts.first()).to
					.have.property("from", this.otherUser.address)
				expect(replyAlerts.first()).to
					.have.property("to", this.user.address)
				expect(replyAlerts.first()).to
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
				
				const mentionAlerts = alerts
					.filter(a => a.get("type") === "mention")
					.toList()
				expect(mentionAlerts).to
					.have.size(1)

				expect(mentionAlerts.first()).to
					.have.property("type", "mention")
				expect(mentionAlerts.first()).to
					.have.property("from", this.user.address)
				expect(mentionAlerts.first()).to
					.have.property("to", this.otherUser.address)
				expect(mentionAlerts.first()).to
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
					.be.an.instanceOf(OrderedSet)
					.and.have.size(3)
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
					.be.an.instanceOf(OrderedSet)
					.and.have.size(2)
					.and.include(this.reply.address)
				expect(replies).to
					.equal(this.post.cache.get("replies"))
				done()
			})
			.catch(error => done(error))
	})

}




