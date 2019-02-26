import chai, { expect } from 'chai';

import { List } from 'immutable';

import { PodiumError } from '../src/podiumError';




export function prepareTokens(env, done) {
	env.timeout(30 * 1000)
	env.transactionCount = 0
	env.user.onTransaction(() => env.transactionCount += 1)
	env.user.createTransaction(env.otherUser.address, 100)
		.then(() => new Promise(resolve => setTimeout(resolve, 5000)))
		.then(() => done())
		.catch(done)
}



export function shouldCreateTransactions() {

	it("can be created by users", function(done) {
		Promise.all([
				this.user.transactionIndex(true),
				this.user.getBalance(true),
				this.passiveUser.getBalance(true),
				this.otherUser.transactionIndex(true),
				this.otherUser.getBalance(true)
			])
			.then(([transactions, balance, passiveBalance,
					otherTransactions, otherBalance]) => {

				expect(transactions).to
					.be.instanceOf(List)
					.and.have.size(2)
				expect(transactions.first()).to
					.have.property("value", 1000)
				expect(transactions.get(1)).to
					.have.property("value", -100)
				expect(balance).to.equal(900)
				expect(passiveBalance).to.equal(balance)

				expect(otherTransactions).to
					.be.instanceOf(List)
					.and.have.size(2)
				expect(otherTransactions.first()).to
					.have.property("value", 1000)
				expect(otherTransactions.get(1)).to
					.have.property("value", 100)
				expect(otherBalance).to.equal(1100)

				done()

			})
			.catch(done)

	})


	it("cannot be created without sufficient funds", function() {
		var badTransaction = this.otherUser
			.createTransaction(this.user.address, 10000)
		return expect(badTransaction).to
			.be.rejectedWith(PodiumError)
			.and.eventually.satisfy(error => error.code === 6)
	})

	it("cannot be created with a negative value", function() {
		var badTransaction = this.otherUser
			.createTransaction(this.user.address, -100)
		return expect(badTransaction).to
			.be.rejectedWith(PodiumError)
			.and.eventually.satisfy(error => error.code === 7)
	})

	it("trigger callbacks", function() {
		expect(this.transactionCount).to.equal(2)
	})

}


export function shouldProvideTokens() {

	it("provides tokens", function(done) {
		let startingBalance;
		this.otherUser.getBalance(true)
			.then(balance => {
				startingBalance = balance
				return this.otherUser.requestFunds(500)
			})
			.then(() => new Promise(resolve => setTimeout(resolve, 5000)))
			.then(() => Promise.all([
				this.otherUser.getBalance(true),
				this.otherUser.withTransactions(true)
			]))
			.then(([balance, otherUser]) => {
				expect(balance).to
					.equal(otherUser.balance)
				expect(otherUser.transactions).to
					.be.instanceOf(List)
					.and.have.size(5)
				expect(otherUser.balance).to
					.equal(startingBalance + 500)
				done()
			})
			.catch(done)
	})

}


