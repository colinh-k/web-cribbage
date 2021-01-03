let Score = {
    scoreHeels(dealer) {
        if (GameManager.starterCard.rank === 'J') {
            GameManager.appendMessage('2 points to ' + dealer.name + ' (heels).', 'green');
            dealer.score += 2;
            GameManager.updateScore();
        }
    },

    scoreLastToPlay(lastToPlay) {
        if (GameManager.neitherCanPlay() && GameManager.tableValue !== 15 && GameManager.tableValue !== 31) {
            GameManager.appendMessage('1 point to ' + lastToPlay.name + ' (last to play).', 'green');
            lastToPlay.score += 1;
            GameManager.updateScore();
        }
    },

    scorePlay: function(scoringPlayer) {
        const sumTo15 = this.sumToValue(scoringPlayer, 15);
        this.updateIfScored(scoringPlayer, sumTo15);
        const sumTo31 = this.sumToValue(scoringPlayer, 31);
        this.updateIfScored(scoringPlayer, sumTo31);
        this.updateIfScored(scoringPlayer, this.scoreOfAKind(scoringPlayer));
        this.updateIfScored(scoringPlayer, this.scoreStraightsInPlay(scoringPlayer));
    },

    updateIfScored: function(scoringPlayer, resultArray) {
        if (resultArray[0]) {
            GameManager.appendMessage(resultArray[1], 'green');
            scoringPlayer.score += resultArray[0];
            GameManager.updateScore();
        }
    },

    // returns [points, message]
    sumToValue: function(scoringPlayer, value) {
        let message = '', points = 0;
        if (GameManager.tableValue === value) {
            message = '2 points to ' + scoringPlayer.name + ' (' + value + ').';
            points = 2;
        }
        return [points, message];
    },

    scoreOfAKind: function(scoringPlayer) {
        let message = '', points = 0, matches = 0;
        if (GameManager.inPlay.length >= 2) {
            for (let i = GameManager.inPlay.length - 1; i >= 1; i--) {
                if (GameManager.htmlToCard(GameManager.inPlay[i]).rank === GameManager.htmlToCard(GameManager.inPlay[i - 1]).rank) {
                    matches++;
                } else {
                    break;
                }
            }
        }
        if (matches === 1) {
            message = '2 points to ' + scoringPlayer.name + ' (pair).';
            points = 2;
        } else if (matches === 2) {
            message = '6 points to ' + scoringPlayer.name + ' (triplet).';
            points = 6;
        } else if (matches === 3) {
            message = '12 points to ' + scoringPlayer.name + ' (quadruplet).';
            points = 12;
        }
        return [points, message];
    }, 

    scoreStraightsInPlay: function(scoringPlayer) {
        let message = '', points = 0, ranks = [];
        GameManager.inPlay.forEach(card => {
            ranks.push(GameManager.htmlToCard(card).getRankInt());
        });
        while (ranks.length !== 0) {
            if (this.isStraight(ranks)) {
                points = ranks.length;
                message = points + ' points to ' + scoringPlayer.name + " (" + points + '-length straight).';
                break;
            } 
            ranks.shift();
        }
        return [points, message];
    }, 

    isStraight: function(ranks) {
        if (ranks.length <= 2) {
            return false;
        }
        let ranksSet = new Set(ranks);
        let max = this.max(ranksSet), min = this.min(ranksSet);
        return max - min + 1 === ranks.length && max - min + 1 === ranksSet.size;
    },

    max: function(set) {
        let max = 0;
        set.forEach(val => {
            if (val > max) {
                max = val;
            }
        });
        return max;
    }, 

    min: function(set) {
        let min = this.max(set);
        set.forEach(val => {
            if (val < min) {
                min = val;
            }
        });
        return min;
    },

    scoreEORHand: function(scoringPlayer, cards, starterCard) {
        const ranksList = this.getRanksList(cards, starterCard);
        const valuesList = this.getValuesList(cards, starterCard);
        // check pair, trip, and quad (in that order)
        for (let i = 2; i <= 4; i++) {
            this.updateIfScored(scoringPlayer, this.scoreOfAKindEOR(scoringPlayer, ranksList, i));
        }
        /* this.updateIfScored(scoringPlayer, this.scoreOfAKindEOR(scoringPlayer, ranksList)); */
        this.updateIfScored(scoringPlayer, this.scoreCombosToTarget(scoringPlayer, valuesList, 15));
        this.updateIfScored(scoringPlayer, this.scoreStraights(scoringPlayer, ranksList));
        this.updateIfScored(scoringPlayer, this.scoreFlush(scoringPlayer, cards, starterCard));
        this.updateIfScored(scoringPlayer, this.scoreNobs(scoringPlayer, cards, starterCard));
    },

    // ISSUE DATE JAN 3: when scoring a hand with a triplet AND a pair (of different ranks), the program only counts the pair 
    //          it seems the points and message are overwritten in the last logic check in the method below 

    scoreOfAKindEOR: function(scoringPlayer, ranks, type) {
        let message = '', points = 0;
        const target = this.countPairTripQuad(ranks, type);

        if (target) {
            if (type === 4) {
                message = (target * 12) + ' points to ' + scoringPlayer.name + ' (' + target + ' unique quadruplet' + ((target == 1) ? ').' : 's).');;
                points = target * 12;
            } else if (type === 3) {
                message = (target * 6) + ' points to ' + scoringPlayer.name + ' (' + target + ' unique triplet' + ((target == 1) ? ').' : 's).');;
                points = target * 6;
            } else if (type === 2) {
                message = (target * 2) + ' points to ' + scoringPlayer.name + ' (' + target + ' unique pair' + ((target == 1) ? ').' : 's).');;
                points = target * 2;
            }
        }
        return [points, message];
    },

    /* scoreOfAKindEOR: function(scoringPlayer, ranks) {
        let message = '', points = 0;
        const pairs = this.countPairTripQuad(ranks, 2);
        const triplets = this.countPairTripQuad(ranks, 3);
        const quadruplets = this.countPairTripQuad(ranks, 4);

        if (quadruplets) {
            message = (quadruplets * 12) + ' points to ' + scoringPlayer.name + ' (' + quadruplets + ' unique quadruplet' + ((quadruplets == 1) ? ').' : 's).');
            points = quadruplets * 12;
        }
        if (triplets) {
            message = (triplets * 6) + ' points to ' + scoringPlayer.name + ' (' + triplets + ' unique triplet' + ((triplets == 1) ? ').' : 's).');
            points = triplets * 6;
        }
        if (pairs) {
            message = (pairs * 2) + ' points to ' + scoringPlayer.name + ' (' + pairs + ' unique pair' + ((pairs == 1) ? ').' : 's).');
            points = pairs * 2;
        }
        return [points, message];
    }, */

    countPairTripQuad: function(ranks, target) {
        let targetList = [];
        ranks.forEach(rank => {
            if (this.countOccurances(ranks, rank) === target) {
                targetList.push(rank);
            }
        })
        return (new Set(targetList)).size;
    },

    countOccurances: function(list, value) {
        let count = 0;
        list.forEach(val => {
            if (val === value) {
                count++;
            }
        })
        return count;
    },

    scoreCombosToTarget: function(scoringPlayer, values, target) {
        let message = '', points = 0;
        let count = 0;
        for (let i = 0; i < 6; i++) {
            this.getCombinationsList(values, i).forEach(sequenceList => {
                if (this.sumList(sequenceList) === target) {
                    count++;
                }
            })
        }
        if (count) {
            message = (count * 2) + ' points to ' + scoringPlayer.name + ' (' + count + ' unique ' + target + '-combination' + ((count === 1) ? ').' : 's).');
            points = count * 2;
        }
        return [points, message];
    },

    getCombinationsList: function(values, r) {
        let returnList = [];
        this.combinations(values, [], returnList, r, 0, values.length - 1, 0, 0);
        return returnList;
    },

    combinations: function(values, data, combos, r, start, end, dataIndex, valuesIndex) {
        if (dataIndex >= r) {
            let combo = [...data];
            combos.push(combo);
        } else if (start <= end) {
            data.push(values[valuesIndex]);
            this.combinations(values, data, combos, r, start + 1, end, dataIndex + 1, valuesIndex + 1);
            data.splice(dataIndex, 1);
            this.combinations(values, data, combos, r, start + 1, end, dataIndex, valuesIndex + 1);
        }
    },

    sumList: function(list) {
        let sum = 0;
        list.forEach(val => {
            sum += val;
        })
        return sum;
    },

    scoreStraights: function(scoringPlayer, ranks) {
        let message = '', points = 0;
        let scoreData = this.calcStraightsPoints(ranks);
        let score = scoreData[0], numStraights = scoreData[1];
        if (score) {
            message = score + ' points to ' + scoringPlayer.name + ' (' + numStraights + ' straight' + ((numStraights === 1) ? ').' : 's).');
            points = score;
        }
        return [points, message];
    },

    calcStraightsPoints: function(ranks) {
        let num3s = 0, num4s = 0, num5s = 0;
        for (let i = 0; i < 6; i++) {
            this.getCombinationsList(ranks, i).forEach(sequenceList => {
                let sequenceSet = new Set(sequenceList);
                let isRun = ((this.max(sequenceSet) - this.min(sequenceSet) + 1) === i && sequenceSet.size === i);
                if (isRun && sequenceSet.size === 5) {
                    num5s++;
                }
                if (isRun && sequenceSet.size === 4) {
                    num4s++;
                }
                if (isRun && sequenceSet.size === 3) {
                    num3s++;
                }
            });
            if (num5s) {
                return [5, 1];
            }
        }
        if (num4s) {
            return [(num4s * 4), num4s];
        }
        return [(num3s * 3), num3s];
    },

    scoreFlush: function(scoringPlayer, cards, starterCard) {
        let message = '', points = 0, score = 0;
        let testSuit = cards[0].suit;
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].suit !== testSuit) {
                break;
            } else {
                score++;
            }
        }
        if (score == 4 && starterCard.suit === testSuit) {
            score++;
        }
        if (score >= 4) {
            message = score + ' points to ' + scoringPlayer.name + ' (' + score + ' card flush).';
            points = score;
        }
        return [points, message];
    },

    scoreNobs: function(scoringPlayer, cards, starterCard) {
        let message = '', points = 0, testSuits = new Set();
        cards.forEach(card => {
            if (card.getRankInt() === 11) {
                testSuits.add(card.suit);
            }
        })
        if (testSuits.has(starterCard.suit)) {
            message = '1 point to ' + scoringPlayer.name + ' (nobs).';
            points = 1;
        }
        return [points, message];
    },

    getRanksList: function(cards, starterCard) {
        let ranks = [];
        cards.forEach(card => {
            ranks.push(card.getRankInt());
        })
        ranks.push(starterCard.getRankInt());
        return ranks;
    },

    getValuesList: function(cards, starterCard) {
        let values = [];
        cards.forEach(card => {
            values.push(card.value());
        })
        values.push(starterCard.value());
        return values;
    }
};