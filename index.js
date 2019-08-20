const dsteem         = require('dsteem')
const client         = new dsteem.Client('https://api.steemit.com')
const cryptoUtils    = dsteem.cryptoUtils
const utils          = require('./utils.js')
const steemtrxfinder = require('steemtrxfinder')

const test_post_url  = 'https://steemit.com/spt/@zaku/highlights-of-the-day-dq-and-mystery-rewards-neoxian-guild-tournament-result-neoxag-statics-and-spt-battle-gg-stake-curations'


function reversePubkeyChallenge () {
 return new Promise(async (resolve, reject) => {
 	var author   = test_post_url.substring(test_post_url.lastIndexOf('@') + 1, test_post_url.lastIndexOf('/'))
	var permlink = test_post_url.substr(test_post_url.lastIndexOf('/') + 1)

	var content = await client.database.call('get_content', [author, permlink])
	var active_votes = content.active_votes

	for (let i = 0; i < active_votes.length; i++) { 
		let vote = active_votes[i]
		console.log(vote)
		let pseudo_trx
		try {
			pseudo_trx = await utils.findVotePseudoTrx(client, vote, test_post_url)
		} catch(e) {
			console.log(e)
			return
		}
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