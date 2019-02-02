import chai, { expect } from 'chai';

import { Set } from 'immutable';



export function shouldSearchUsers() {

	it("can find multiple users", function(done) {
		this.podium.search("test")
			.then(results => {
				expect(results).to.be.instanceOf(Set)
				expect(results).to.include(this.user.address)
				expect(results).to.include(this.otherUser.address)
				done()
			})
			.catch(error => done(error))
	})

	it("can find individual users", function(done) {
		this.podium.search(this.userData.id)
			.then(results => {
				expect(results).to
					.be.instanceOf(Set)
					.and.have.size(1)
				expect(results).to.include(this.user.address)
				done()
			})
			.catch(error => done(error))
	})

	it("can safely find no users", function(done) {
		this.podium.search("nothing")
			.then(results => {
				expect(results).to
					.be.instanceOf(Set)
					.and.have.size(0)
				done()
			})
			.catch(error => done(error))
	})

}



