import { RadixUtil, RadixAccount, RadixKeyPair } from 'radixdlt';

function getAccount(seed) {
	const hash = RadixUtil.hash(Buffer.from(seed));
	return new RadixAccount(RadixKeyPair.fromPrivate(hash));
}


