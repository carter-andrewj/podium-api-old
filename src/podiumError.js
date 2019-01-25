


export default class PodiumError extends Error {

	constructor(...args) {
		super(...args)
		this.podiumError = true;
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
			default:
				return "Unknown error."
		}
	}

}


