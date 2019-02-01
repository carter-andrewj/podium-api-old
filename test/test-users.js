import chai, { expect } from 'chai';

import * as fs from 'fs';

import { RadixSimpleIdentity } from 'radixdlt';

import { PodiumError } from '../src/podiumError';



export function prepareUsers(env, done) {

	// Set expected time to complete
	env.timeout(30 * 1000)

	// Get profile picture
	var loadImage = new Promise((resolve, reject) => {
		fs.readFile(env.testImage, (err, data) => {
			env.userPicture = new Buffer
				.from(data, 'binary')
				.toString('base64')
			env.userPictureExt = env.testImage.substring(
				env.testImage.lastIndexOf('.') + 1,
				env.testImage.length
			)
			resolve()
		})
	})

	loadImage.then(() => {

		// Register users
		var registerA = env.podium.createUser(
			env.userData.id,
			env.userData.password,
			env.userData.name,
			env.userData.bio,
			env.userPicture,
			env.userPictureExt
		)
		var registerB = env.podium.createUser(
			env.otherUserData.id,
			env.otherUserData.password,
			env.otherUserData.name,
			env.otherUserData.bio,
			env.userPicture,
			env.userPictureExt
		)

		// Wait for registration to complete
		Promise.all([registerA, registerB])
			.then(([a, b]) => {
				env.user = a
				env.otherUser = b
				env.passiveUser = env.podium.user(a.address)
				return env.passiveUser
			})
			.then(() => done())
			.catch(error => done(error))

	}).catch(error => done(error))

}



export function shouldCreateUsers() {


	it("can be created", function() {
		expect(this.user).to
			.be.an.instanceOf(this.userType)
		expect(this.user).to
			.have.property("identity")
			.and.is.an.instanceOf(RadixSimpleIdentity)
		expect(this.user).to
			.have.property("address")
			.and.be.a("string")
			.and.have.a.lengthOf(51)
			.and.match(/^9/)
	})


	it("can be created as read-only", function() {
		expect(this.passiveUser).to
			.be.an.instanceOf(this.passiveUserType)
		expect(this.passiveUser).to
			.not.have.property("identity")
		expect(this.passiveUser).to
			.have.property("address")
			.and.be.a("string")
			.and.have.a.lengthOf(51)
			.and.match(/^9/)
	})


	it("can sign-in", function() {
		var signInA = this.passiveUser
			.signIn(this.userData.id, this.userData.password)
		return expect(signInA).to.eventually
			.be.an.instanceOf(this.userType)
			.and.have.property("address", this.user.address)
	})


	it("can have their address retrieved from their ID", function() {
		var addressFromID = this.podium.isUser(this.userData.id)
		return expect(addressFromID).to.eventually
			.equal(this.user.address)
	})


	it("cannot be created with the same ID as another user", function() {
		var dupeUser = this.podium.createUser(
			this.userData.id,
			this.userData.password,
			this.userData.name,
			this.userData.bio
		)
		return expect(dupeUser).to
			.be.rejectedWith(PodiumError)
			.and.eventually.satisfy(error => error.code === 3)
	})

}



