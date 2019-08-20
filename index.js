const dsteem         = require('dsteem')
const client         = new dsteem.Client('https://api.steemit.com')
const cryptoUtils    = dsteem.cryptoUtils
const utils          = require('./utils.js')
const steemtrxfinder = require('steemtrxfinder')

// we know for a fact that the post below has votes signed by some of the problematic services(*). In order to give the 
// partipant a starting point in the challenge, we are going to find a signature that cannot be reversed.

// (*) We know that this service https://github.com/inertia186/radiator has a third-party library for trx signing that 
// triggers the impossibility of pubkey recovery (at least, by the means shown below)

const test_post_url  = 'https://steemit.com/spt/@zaku/highlights-of-the-day-dq-and-mystery-rewards-neoxian-guild-tournament-result-neoxag-statics-and-spt-battle-gg-stake-curations'


function reversePubkeyChallenge () {
 return new Promise(async (resolve, reject) => {
 	// we split the test post url and extract author and permlink
 	var author   = test_post_url.substring(test_post_url.lastIndexOf('@') + 1, test_post_url.lastIndexOf('/'))
	var permlink = test_post_url.substr(test_post_url.lastIndexOf('/') + 1)
	// we load post content and fetch active_votes 
	var content = await client.database.call('get_content', [author, permlink])
	var active_votes = content.active_votes
	// loop over votes until we find a signature that cannot be reversed
	for (let i = 0; i < active_votes.length; i++) { 
		let vote = active_votes[i]
		console.log(vote)
		// "pseudo_trx" is the name given to the only partial trx objects returned by steem rpc 'get_account_history' database endpoint
		// find more info here https://github.com/AusPrinzip/steemtrxfinder
		let pseudo_trx
		try {
			pseudo_trx = await utils.findVotePseudoTrx(client, vote, test_post_url)
		} catch(e) {
			console.log(e)
			return
		}
		// we find and fetch the full trx object so that we can serialise it and hash it for the digest
		try {
			trx = await steemtrxfinder.findVoteTrx(client, pseudo_trx)
		} catch(e) {
			console.log(chalk.red('error at steemtrxfinder'))
			console.log(e)
			return
		}
		let digest = cryptoUtils.transactionDigest(trx)

		let signature
		let pub = ''
		// final test
		for (let i = 0; i < trx.signatures.length; i++) { 
			let _signature = trx.signatures[i]
			try { 
				signature = dsteem.Signature.fromString(_signature)
				pub = signature.recover(digest).toString()
			} catch(e) {
				console.log(e)
				return resolve(trx)
			}
		}
	}
 })
}
 
reversePubkeyChallenge().then((target_trx) => console.log(target_trx))