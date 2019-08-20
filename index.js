const dsteem         = require('dsteem')
const client         = new dsteem.client('https://api.steemit.com')
const utils          = dsteem.cryptoUtils
const utils          = require('./utils.js')
const steemtrxfinder = require('steemtrxfinder')

const test_post_url  = 'https://steemit.com/spt/@zaku/highlights-of-the-day-dq-and-mystery-rewards-neoxian-guild-tournament-result-neoxag-statics-and-spt-battle-gg-stake-curations'


function reversePubkeyChallenge () {
	var author   = test_post_url.substring(test_post_url.lastIndexOf('@') + 1, test_post_url.lastIndexOf('/'))
	var permlink = test_post_url.substr(test_post_url.lastIndexOf('/') + 1)

	var content = await client.database.call('get_content', [author, permlink])
	var active_votes = content[0].active_votes

	active_votes.forEach((vote) => {
		let pseudo_trx
		try {
			pseudo_trx = await findVotePseudoTrx(client, vote)
		} catch(e) {
			console.log(e)
			return reject(e)
		}
		try {
			trx = await steemtrxfinder.findVoteTrx(client, pseudo_trx)
		} catch(e) {
			console.log(chalk.red('error at steemtrxfinder'))
			console.log(e)
			return reject(vote)
		}
		let digest = utils.transactionDigest(trx)

		let signature
		let pub = ''
		for (let i = 0; i < trx.signatures.length; i++) { 
			let _signature = trx.signatures[i]
			try { 
				signature = dsteem.Signature.fromString(_signature)
				pub = signature.recover(digest).toString()
			} catch(e) {
				console.log(e)
			}
		}

	})
}
 
