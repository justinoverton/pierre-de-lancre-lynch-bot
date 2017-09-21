
module.exports = {

    getLynchVoteKey(channelId) {
        return `LynchVote_Channel_${channelId}`;
    },

    getTally(votingRecord) {

        let votes = {};
        let maxCount = 0;

        for(let key of Object.keys(votingRecord)) {

            let val = votingRecord[key];
            let count = votes[val] || 0;
            count += 1;
            maxCount = Math.max(maxCount, count);
            votes[val] = count;
        }
        
        let ret = ['The tally is:'];

        for(let key of Object.keys(votes)) {
            let count = votes[key];
            let fmt1 = '';
            let fmt2 = '';
            if(count == maxCount) {
                fmt1 = '__**';
                fmt2 = '**__';
            }

            ret.push(`${key}\t\t${fmt1}${count}${fmt2}`);
        }

        return ret;
    }
};