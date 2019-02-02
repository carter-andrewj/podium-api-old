import chai, { expect } from 'chai';

import { Map } from 'immutable';



export function prepareProfiles(env, done) {

	// Retreive profiles via 3 different routes
	var activeProfile = env.user.profile()
	var passiveProfile = env.passiveUser.profile()

	// Wait for profile retrieval to complete
	Promise.all([activeProfile, passiveProfile])
		.then(([a, b]) => {
			env.profile = a
			env.passiveProfile = b
			done()
		})
		.catch(error => done(error))

}



export function shouldCreateProfiles() {
	
	it("can be retrieved for the active user", function() {
		expect(this.profile).to.be.an.instanceOf(Map)
	})

	it("can be retrieved for other users", function() {
		expect(this.passiveProfile).to
			.be.an.instanceOf(Map)
			.and.have.property("created", this.profile.get("created"))
	})

	it("have correct profile information", function() {
		expect(this.profile).to.have.property("id", this.userData.id)
		expect(this.profile).to.have.property("name", this.userData.name)
		expect(this.profile).to.have.property("bio", this.userData.bio)
	})

	it("have correct profile picture", function(done) {
		this.podium.S3
			.getObject({
				Bucket: this.podium.media,
				Key: this.profile.get("picture")
			})
			.promise()
			.then(data => {
				const checkImage = data.Body.toString("base64")
				expect(checkImage).to.equal(this.userPicture)
				done()
			})
			.catch(error => done(error))
	})

	it("can have their profile ID changed")
	it("cannot change their profile ID to that of another user")
	it("can have their password changed")
	it("can have their display name changed")
	it("can have their bio changed")
	it("can have their profile picture changed")

}



export function shouldCacheProfiles() {

	it("caches profiles", function(done) {
		this.timeout(10)
		this.user.profile(false)
			.then(profile => {
				expect(this.profile).to
					.be.an.instanceOf(Map)
				expect(this.profile).to
					.have.property("id", this.userData.id)
				expect(this.profile).to
					.have.property("name", this.userData.name)
				expect(this.profile).to
					.have.property("bio", this.userData.bio)
				expect(profile).to
					.equal(this.user.cache.get("profile"))
				done()
			})
			.catch(error => done(error))
	})

}




