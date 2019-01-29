


export class PodiumError extends Error {

	constructor(...args) {
		super(...args)
		Error.captureStackTrace(this, PodiumError)
	}

	withCode(code) {
		this.code = code;
		this.message = this.report(code);
		return this;
	}

	report() {
		switch (this.code) {

			case (0): 
				return "Server Offline."
			case (1):
				return "No data received."
			case (2):
				return "Timed out."
			case (3):
				return "A user with that ID already exists."

			case (100):
				return "Forbidden: Remote cannot write to ledger."

			default:
				return "Unknown error."

		}
	}

}


