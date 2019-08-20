
function findVotePseudoTrx (client, vote, postURL) {
	return new Promise(async (resolve, reject) => {
		let permlink = postURL.substr(postURL.lastIndexOf('/') + 1)
		let voter     = vote.voter
		let history   = []
		let match     = null
		var interval  = 0
		while (!match) {
			try {
				history = await client.database.call('get_account_history', [voter, -1 - interval, 1500 + interval])
			} catch(e){
				console.log(e)
				console.log(client.address + ' error at get_account_history  ' + client.address)
				return reject(vote)
			}
			
			match = history.find((x) => x[1].op[0] == 'vote' && x[1].op[1].permlink == permlink)
			interval += 1500
			await wait(0.5)
			// if (interval > 5000) return reject()
		}
		if (interval > 0) console.log(vote.voter + ' findVotePseudoTrx resolved with interval = ' + interval)
		return resolve(match)
	})
}

function wait (seconds) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {resolve()}, seconds * 1000)
	})
}

module.exports = {
	findVotePseudoTrx: findVotePseudoTrx,
	wait: wait
}