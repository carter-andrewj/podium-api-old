import chai, { expect } from 'chai';

import { List } from 'immutable';



export function shouldSearchUsers() {

	it("can find multiple users", function(done) {
		this.podium.search("test")
			.then(results => {

				// Check results
				expect(results).to.be.instanceOf(List)

				// Check addresses in results
				const addresses = results.map(r => r.get("address"))
				expect(addresses).to.include(this.user.address)
				expect(addresses).to.include(this.otherUser.address)

				// Check ids in results
				const ids = results.map(r => r.get("id"))
				expect(ids).to.include(this.userData.id)
				expect(ids).to.include(this.otherUserData.id)

				// Done
				done()

			})
			.catch(error => done(error))
	})

	it("can find individual users", function(done) {
		this.podium.search(this.userData.id)
			.then(results => {
				expect(results).to
					.be.instanceOf(List)
					.and.have.size(1)
				expect(results.first()).to
					.have.property("address", this.user.address)
				expect(results.first()).to
					.have.property("id", this.userData.id)
				done()
			})
			.catch(error => done(error))
	})

	it("is not case sensitive", function(done) {
		this.podium.search(this.userData.id.toUpperCase())
			.then(results => {
				expect(results).to
					.be.instanceOf(List)
					.and.have.size(1)
				expect(results.first()).to
					.have.property("address", this.user.address)
				expect(results.first()).to
					.have.property("id", this.userData.id)
				done()
			})
			.catch(error => done(error))
	})

	it("can safely find no users", function(done) {
		this.podium.search("nothing")
			.then(results => {
				expect(results).to
					.be.instanceOf(List)
					.and.have.size(0)
				done()
			})
			.catch(error => done(error))
	})

}



