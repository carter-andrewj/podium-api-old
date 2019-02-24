import chai, { expect } from 'chai';

import { List } from 'immutable';



export function shouldFlagSeenAlerts() {

	it("flags alerts, once seen", function(done) {
		this.otherUser.alerts(true, 100, true)
			.then(alerts => {
				const alertIDs = alerts
					.map(a => a.get("key"))
					.toList()
				expect(alerts).to
					.be.instanceOf(List)
					.and.have.size(5)
				expect(alerts.get(0)).to
					.have.property("seen", false)
				expect(alerts.get(1)).to
					.have.property("seen", false)
				expect(alerts.get(2)).to
					.have.property("seen", false)
				expect(alerts.get(3)).to
					.have.property("seen", false)
				expect(alerts.get(4)).to
					.have.property("seen", false)
				return this.otherUser.clearAlerts(alertIDs)
			})
			.then(() => this.otherUser.alerts(true, 100, true))
			.then(alerts => {
				expect(alerts).to
					.be.instanceOf(List)
					.and.have.size(5)
				expect(alerts.get(0)).to
					.have.property("seen", true)
				expect(alerts.get(1)).to
					.have.property("seen", true)
				expect(alerts.get(2)).to
					.have.property("seen", true)
				expect(alerts.get(3)).to
					.have.property("seen", true)
				expect(alerts.get(4)).to
					.have.property("seen", true)
				done()
			})
			.catch(error => done(error))
	})

	it("returns only unseen alerts by default", function(done) {
		this.otherUser.alerts(false, 100, true)
			.then(alerts => {
				expect(alerts).to
					.be.instanceOf(List)
					.and.have.size(0)
				done()
			})
			.catch(error => done(error))
	})

}




export function shouldCleanUpOldAlerts() {

	it("cleans up stale alerts", function(done) {

		// Get current alerts
		var alerts = this.podium.db.getCollection("alerts")
		
		// Check current number of alerts is as expected
		// 2 follows of root, 1 follow, 2 replies, 1 mention
		// all x2 (once for Server tests, once for Client)
		var countBefore = alerts.count()
		expect(countBefore).to.equal(17)

		// Set alert cleanup to be near-instantaneous
		alerts.setTTL(1000, 100)

		// Wait for 2s to ensure cleanup cycle has occurred
		setTimeout(
			() => {
				const countAfter = alerts.count()
				expect(countAfter).to.equal(0)
				done()
			},
			2000
		)

	})

}

