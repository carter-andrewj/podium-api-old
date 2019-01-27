import { fromJS } from 'immutable';

import { RadixUtil, RadixAccount, RadixKeyPair } from 'radixdlt';




export function getAccount(seed) {
	const hash = RadixUtil.hash(Buffer.from(seed));
	return new RadixAccount(RadixKeyPair.fromPrivate(hash));
}


export function filterAsync(subject, predicate) {
	return new Promise((resolve, reject) => {
		var predicatePromises = subject
			.map(v => predicate(v))
		Promise.all([...predicatePromises])
			.then(results => resolve(subject
				.zip(fromJS(results))
				.filter(([_, r]) => r)
				.map(([s, r]) => s)
				.toList()
			))
			.catch(error => reject(error))
	})
}


