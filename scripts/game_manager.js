let GameManager = {

    goalPoints: 121,

    renderGamePage: function() {
        document.querySelector('body').innerHTML = '';
        this.renderGameElements();
        this.initializeRound();
    }, 

    activateEndButton: function(color='black') {
        const btn = document.querySelector('.confirmation-button');
        btn.innerText = 'Continue';
        let winner = (player.score > computer.score) ? 
                        player : computer;
        winner = (winner.isComputer) ? 'The Computer' : 'Player1';
        btn.onclick = function() {
            const body = document.querySelector('body');
            body.style.justifyContent = 'center';
            body.style.alignItems = 'center';
            const oldScoreDisplay = document.querySelector('.score-container');
            oldScoreDisplay.classList.remove('score-container');
            oldScoreDisplay.classList.add('final-score-container');
            const endContainer = document.createElement('div');
            endContainer.classList.add('end-container');
            endContainer.innerHTML = '<div class="winner-container">' + winner + ' is the winner!</div>' +
                                     '<div class="final-score-message-container">The final score is shown below</div>';
            endContainer.appendChild(oldScoreDisplay);
            body.innerHTML = '';
            body.appendChild(endContainer);
        }
        this.appendMessage(winner + ' has won.', color);
        this.appendMessage('Please click \'Continue\' to move to the end page.', color);
    },

    end: function(winner) {
        document.querySelector('body').innerHTML = '<div class="end-container">' +
                                                       '<div class="winner-container">' + winner + ' is the winner!</div>' +
                                                       '<div class="final-score-message-container">The final score is shown below.</div>' +
                                                       '<div class="final-score-container"></div>' +
                                                   '</div>';
    },

    renderGameElements: function() {
        const body = document.querySelector('body');
        body.innerHTML = '<div class="message-container">' +
                             '<div class="message-header">Messages</div>' +
                             '<ul class="message-content-container"></ul>' + 
                         '</div>' +
                         '<div class="game-container">' + 
                             '<div class="com-cards-container"></div>' +
                             '<div class="com-crib-icon-container">' +
                                '<div class="crib-icon">Crib</div>' +
                             '</div>' +
                             '<div class="starter-card-container"></div>' +
                             '<div class="in-play-container"></div>' +
                             '<div class="score-container">' +
                                '<div class="com-score"></div>' +
                                '<div class="player-score"></div>' +
                             '</div>' +
                             '<div class="button-container">' +
                                '<button class="confirmation-button">Confirm Selection</button>' +
                             '</div>' +
                             '<div class="player-cards-container"></div>' +
                             '<div class="player-crib-icon-container">' +
                                '<div class="crib-icon">Crib</div>' +
                             '</div>' +

                         '</div>'
        player = new Player('Player1');
        computer = new Player("the Computer");
        this.dealer = computer;
        this.nonDealer = player;
        document.querySelector('.player-crib-icon-container').classList.toggle('hidden');
        this.tableValue = 0;
        this.starterCard;
        this.updateScore();
    },
    
    initializeRound: function() {
        this.reset();
        this.dealHands();
        this.renderHands();
        this.addPlayerCardEvents();
        this.appendMessage('The deck has been shuffled.');
        this.appendMessage('You have been delt the cards shown.');
        this.appendMessage('Please select two cards to lay away for the crib.', '#4c2982');
    },

    reset: function() {
        this.crib = [];
        this.inPlay = [];
        this.tableValue = 0;
        this.alternateDealer();
        player.canPlay = true;
        computer.canPlay = true;
        this.lastToPlay = this.nonDealer;
        this.updateButtonFunction('confirmSelection(2)');
    },

    // also updates the crib icon location 
    alternateDealer: function() {
        const temp = this.dealer;
        this.dealer = this.nonDealer;
        this.nonDealer = temp;
        document.querySelector('.com-crib-icon-container').classList.toggle('hidden');
        document.querySelector('.player-crib-icon-container').classList.toggle('hidden');
    },

    dealHands: function() {
        deck.reStackAndShuffle();
        player.hand = deck.deal(6);
        computer.hand = deck.deal(6);
    },

    // puts the message in the message contianer, using a color (black if default)
    appendMessage: function(message, color=false) {
        const msgContainer = document.querySelector('.message-content-container');
        const msgElement = document.createElement('li');
        if (color) {
            msgElement.style.color = color;
        }
        msgElement.innerText = message;
        msgContainer.appendChild(msgElement);
        msgContainer.scrollTop = msgContainer.scrollHeight;
    },

    renderHands: function() {
        const playerContainer = document.querySelector('.player-cards-container');
        playerContainer.innerHTML = '';
        for (let i = 0; i < player.hand.length; i++) {
            playerContainer.appendChild(player.hand[i].getHTML());
        }
        const computerContainer = document.querySelector('.com-cards-container');
        computerContainer.innerHTML = '';
        for (let i = 0; i < computer.hand.length; i++) {
            const card = computer.hand[i].getHTML();
            card.classList.remove('card');
            card.classList.add('face-down');
            computerContainer.appendChild(card);
        }
    }, 

    // renders both players hands copies (computer cards face up)
    renderHandsCopy: function() {
        const playerContainer = document.querySelector('.player-cards-container');
        playerContainer.innerHTML = '';
        for (let i = 0; i < player.handCopy.length; i++) {
            playerContainer.appendChild(player.handCopy[i].getHTML());
        }
        const computerContainer = document.querySelector('.com-cards-container');
        computerContainer.innerHTML = '';
        for (let i = 0; i < computer.handCopy.length; i++) {
            computerContainer.appendChild(computer.handCopy[i].getHTML());
        }
    },

    addPlayerCardEvents: function() {
        const cards = document.querySelector('.player-cards-container').childNodes;
        cards.forEach(card => {
            card.classList.add('player-card');
            card.onclick = function() {
                card.classList.toggle('player-card-active');
            }
        });
    },

    confirmSelection: function(qty) {
        const cards = document.querySelectorAll('.player-card-active');
        if (cards.length != qty) {
            this.appendMessage('Please select exactly ' + qty + ' card' + ((qty == 1) ? '.' : 's.'), 'red');
        } else {
            if (qty === 2) {
                this.removeFromHandAndTable(cards);
                this.putInCrib(this.removePlayerClassesAndClickEvents(cards));
                player.copyHand();
                this.getComputerCribCards();
                this.updateButtonFunction('confirmSelection(1)');
                this.appendMessage('The crib has been formed.');
                this.selectAndShowStarterCard();
                this.appendMessage('The ' + this.starterCard.rank + ' of ' + this.starterCard.suit + ' has been selected as the starter card.');

                if (this.dealer.isComputer) {
                    this.appendMessage('The Computer is the dealer.');
                    Score.scoreHeels(this.dealer);
                    this.appendMessage('Please select 1 card to play.', '#4c2982');
                } else {
                    Score.scoreHeels(this.dealer);
                    this.appendMessage('Player1 is the dealer.');
                }

                if (this.gameIsOver()) {
                    return this.activateEndButton('green');
                }

                if (this.nonDealer.isComputer) {
                    this.playComputerCard(this.tableValue);
                    this.updateInPlay();
                }
            } else {
                if (this.hasSelectedValidCard(cards[0])) {
                    this.lastToPlay = player;
                    this.putInPlay(this.removePlayerClassesAndClickEvents(cards));
                    this.updateInPlay();
                    Score.scorePlay(player);

                    if (this.gameIsOver()) {
                        return this.activateEndButton('blue');
                    }

                    if (player.hand.length === 0) {
                        player.canPlay = false;
                    }

                    if (!this.roundIsOver() && this.tableShouldBeReset()) { 
                        if (!player.canPlay) {
                            this.chooseGo(false);
                        } else {
                            this.scoreAndInformLastToPlay('green');
                            this.resetTable(); /* pass in true */
                        }
                    } else {
                        if (computer.canPlay) {
                            this.playComputerCard();
                        }

                        if (!this.roundIsOver()) {
                            if (this.tableShouldBeReset()) {
                                this.scoreAndInformLastToPlay();
                                this.resetTable(); /* pass in true */
                            } else {
                                if (!this.containsValidCard(document.querySelector('.player-cards-container').childNodes) && player.canPlay) {
                                    this.updateButtonFunction('chooseGo()');
                                    document.querySelector('.confirmation-button').innerText = 'Go';
                                    this.appendMessage('You must click \'Go\'.');
                                }
                            }
                        } else {
                            this.scoreAndInformLastToPlay('black', true);
                            const btn = document.querySelector('.confirmation-button');
                            btn.innerText = 'Continue';
                            this.updateButtonFunction('clearForScoring()');
                            this.appendMessage('Both players are out of cards.', 'red');
                            this.appendMessage('Click \'Continue\' when ready.');
                        }
                    }
                } else {
                    this.appendMessage('Please select a valid card to play.', 'red');
                }
            }
        }
    }, 

    scoreAndInformLastToPlay: function(color='black', roundOver=false) {
        Score.scoreLastToPlay(this.lastToPlay);

        if (this.gameIsOver()) {
            return this.activateEndButton('red');
        }

        if (!roundOver) {
            if (this.tableValue === 31) {
                this.appendMessage('The table will be reset since the total is 31.', color);
            } else if (this.neitherCanPlay()) {
                this.appendMessage('The table will be reset because both players cannot play.', color);
            } 
        }
    },

    resetTable: function() {
        this.tableValue = 0;
        this.inPlay = [];

        const btn = document.querySelector('.confirmation-button');
        btn.innerText = 'Continue';
        /* if (duringPlay) {
            this.updateButtonFunction('continueAfterReset(true)');
        } else {
            this.updateButtonFunction('continueAfterReset(false)');
        } */
        this.updateButtonFunction('continueAfterReset()');

        this.appendMessage('Click \'Continue\' when ready.');
    },

    continueAfterReset: function() {
        GameManager.updateInPlay();

        if (player.hand.length !== 0) {
            player.canPlay = true;
            if (GameManager.lastToPlay.isComputer) {
                GameManager.appendMessage('Please select 1 card to play.', 'purple');
            }
        }
        if (computer.hand.length !== 0) {
            computer.canPlay = true;
        }

        if (!GameManager.lastToPlay.isComputer) {
            if (computer.canPlay) {
                GameManager.playComputerCard();
            }

            if (!player.canPlay) { 
                return this.chooseGo(false, false);
            } else if (!GameManager.roundIsOver()) {
                if (GameManager.tableShouldBeReset()) {
                    this.scoreAndInformLastToPlay();
                    GameManager.resetTable(); /* pass in true */
                } else { 
                    if (!GameManager.containsValidCard(document.querySelector('.player-cards-container').childNodes) && player.canPlay) {
                        GameManager.updateButtonFunction('chooseGo()');
                        document.querySelector('.confirmation-button').innerText = 'Go';
                        GameManager.appendMessage('You must click \'Go\'.');
                    }
                }
            } else {
                this.scoreAndInformLastToPlay('black', true);
                const btn = document.querySelector('.confirmation-button');
                btn.innerText = 'Continue';
                this.updateButtonFunction('clearForScoring()');
                this.appendMessage('Both players are out of cards.', 'green');
                this.appendMessage('Click \'Continue\' when ready.');
            }
        }

        const btn = document.querySelector('.confirmation-button');
        btn.innerText = 'Confirm Selection';
        GameManager.updateButtonFunction('confirmSelection(1)');
    },

    // remove player from activeplayers; remove go btn and diable confirmation button
    // pass in false to not display a message sying the player chose go
    chooseGo: function(withMessage=true, withEnd=true) {
        if (withMessage) {
            this.appendMessage('Player1 chooses go.');
        }
        player.canPlay = false;

        const confirmationButton = document.querySelector('.confirmation-button');
        confirmationButton.innerText = 'Confirm Selection';
        this.updateButtonFunction('confirmSelection(1)');
        confirmationButton.classList.add('disabled-button');

        const activeCards = document.querySelectorAll('.player-card-active');
        activeCards.forEach(card => {
            card.classList.remove('player-card-active');
        });


        while (!this.tableShouldBeReset()) {
            this.playComputerCard();
            this.updateInPlay();
        }


        this.scoreAndInformLastToPlay()


        if (withEnd) {
            this.resetTable(); /* no params */
        } else {
            confirmationButton.innerText = 'Continue';
            this.updateButtonFunction('clearForScoring()');
            this.appendMessage('Both players are out of cards.', 'orange');
            this.appendMessage('Click \'Continue\' when ready.');
        }
    },

    endRoundAndScore: function() {
        this.renderHandsCopy();
        this.appendMessage('The round is now over.');
        this.appendMessage('Hands will now be scored automatically, starting with the non-dealer (' + this.nonDealer.name + ').');
        const btn = document.querySelector('.confirmation-button');
        this.updateButtonFunction('scoreNonDealer()');
        btn.innerText = 'Score Non-Dealer';
        btn.classList.add('score-button');
        document.querySelector('.in-play-container').innerHTML = '';
    },

    scoreNonDealer: function() {
        this.appendMessage('Now scoring the non-dealer...');
        Score.scoreEORHand(this.nonDealer, this.nonDealer.handCopy, this.starterCard);

        this.appendMessage('Done.');

        if (this.gameIsOver()) {
            return this.activateEndButton('white');
        }

        const btn = document.querySelector('.confirmation-button');
        btn.innerText = 'Score Dealer';
        btn.classList.remove('score-button');
        this.updateButtonFunction('scoreDealer()');
    },

    scoreDealer: function() {
        this.appendMessage('Now scoring the dealer...');
        Score.scoreEORHand(this.dealer, this.dealer.handCopy, this.starterCard);
        
        this.appendMessage('Done.');

        if (this.gameIsOver()) {
            return this.activateEndButton('purple');
        }

        const btn = document.querySelector('.confirmation-button');
        btn.innerText = 'Score Crib';
        this.updateButtonFunction('scoreCrib()');
    },

    scoreCrib: function() {
        let cribCards = [];
        this.crib.forEach(card => {
            cribCards.push(this.htmlToCard(card));
        });

        let dealerContainer;
        if (this.dealer.isComputer) {
            dealerContainer = document.querySelector('.com-cards-container');
            document.querySelector('.player-cards-container').innerHTML = '';
        } else {
            dealerContainer = document.querySelector('.player-cards-container');
            document.querySelector('.com-cards-container').innerHTML = '';
        }
        dealerContainer.innerHTML = '';
        for (let i = 0; i < this.crib.length; i++) {
            dealerContainer.appendChild(this.crib[i]);
        }

        this.appendMessage('Now scoring the crib for the dealer...');
        Score.scoreEORHand(this.dealer, cribCards, this.starterCard);

        this.appendMessage('Done.');

        if (this.gameIsOver()) {
            return this.activateEndButton('orange');
        }

        const btn = document.querySelector('.confirmation-button');
        btn.innerText = 'Continue';
        this.updateButtonFunction('continue()');
    },

    continue: function() {
        document.querySelector('.starter-card-container').innerHTML = '';
        document.querySelector('.confirmation-button').innerText = 'Confirm Selection';
        this.initializeRound();
    },

    neitherCanPlay: function() {
        return !computer.canPlay && !player.canPlay;
    },

    // returns if the table should be reset and appends messages on occasions
    // also scores lastToPlay
    tableShouldBeReset: function() {
        return this.tableValue === 31 || this.neitherCanPlay();
    },

    clearForScoring: function() {
        GameManager.endRoundAndScore();
    },

    // returns if the both players have empty hands (which means the round is over)
    roundIsOver: function() {
        return computer.hand.length === 0 && player.hand.length === 0;
    },

    // returns if one player has 121 points
    gameIsOver: function() {
        return computer.score >= this.goalPoints || player.score >= this.goalPoints;
    },

    // returns a new card object with the suit and rank of the card represented in the html 
    htmlToCard(card) {
        const strArray = card.dataset.value.split(' ');
        return new Card(strArray[1], strArray[0]);
    }, 

    // returns true if the card passed as input is a valid card
    hasSelectedValidCard: function(card) {
        return (this.htmlToCard(card).value() + this.tableValue) <= 31;
    },

    // remove player card from hand and screen
    // NOTE: it would be better to remove cards from hand by index (not object equality)
    removeFromHandAndTable(cards) {
        // first, remove cards form hand and screen
        for (let i = 0; i < cards.length; i++) {
            const card = this.htmlToCard(cards[i]);
            player.hand = player.hand.filter(pCard => {
                return !pCard.equals(card);
            })
            document.querySelector('.player-cards-container').removeChild(cards[i]);            
        }       
    },

    // adds all cards to the crib array (in HTML format)
    putInCrib(cards) {
        cards.forEach(card => {
            this.crib.push(card);
        });
    },

    // also updates tablevalue
    putInPlay(cards) {
        cards.forEach(card => {
            this.inPlay.push(card);
            this.tableValue += this.htmlToCard(card).value();
        });
        this.removeFromHandAndTable(cards);
    },

    // pass in raw cards and it removes the player specific card classes
    //   and click events from the cards; returns a nodelist of modified cards
    removePlayerClassesAndClickEvents: function(cards) {
        cards.forEach(card => {
            card.classList.remove('player-card-active', 'player-card');
            card.onclick = '';
        });
        return cards;
    },

    selectAndShowStarterCard: function() {
        this.starterCard = deck.getRandomCard();
        document.querySelector('.starter-card-container').appendChild(this.starterCard.getHTML());
    },

    // include parentases and any paramters in the 
    updateButtonFunction: function(funcStr) {
        document.querySelector('.confirmation-button').setAttribute('onclick', 'GameManager.' + funcStr);
    },

    updateInPlay: function() {
        const inPlayContainer = document.querySelector('.in-play-container');
        inPlayContainer.innerHTML = '';
        this.inPlay.forEach(card => {
            inPlayContainer.appendChild(card);
        })
    }, 

    updateScore: function() {
        document.querySelector('.com-score').innerText = 'Computer Score: ' + computer.score;
        document.querySelector('.player-score').innerText = 'Player1    Score: ' + player.score;
    },

    // returns a sublist of nodes in cards that are playable, given the current tableValue; length 0 if no playable cards exist
    getPlayableCards: function(cards) {
        let playableCards = []; // nodelist to contain possible cards to play
        for (let i = 0; i < cards.length; i++) {
            if (this.htmlToCard(cards[i]).value() + this.tableValue <= 31) {
                playableCards.push(cards[i]);
            }
        }
        return playableCards;
    },

    // returns true if at least one card can be played without exceeding the total of 31 (cards is a list of node objects of cards)
    containsValidCard: function(cards) {
        for (let i = 0; i < cards.length; i++) {
            if (this.htmlToCard(cards[i]).value() + this.tableValue <= 31) {
                return true;
            }
        }
        return false;
    },

    /* COMPUTER RANDOM METHODS */
    /* removes two random cards form the com-container and the com-hand; puts the random cards in the crib (as html node objects w/o the facedown class) */
    getComputerCribCards: function() {
        for (let i = 0; i < 2; i++) {
            const cards = document.querySelector('.com-cards-container').childNodes;
            const randomIndex = Math.floor(Math.random() * (cards.length));
            /* const cardHTML = cards.item(index); */
            const childCard = cards.item(randomIndex);
            document.querySelector('.com-cards-container').removeChild(childCard);
            childCard.classList.add('card');
            childCard.classList.remove('face-down');
            this.crib.push(childCard);
            computer.hand.splice(randomIndex, 1);
        }
        computer.copyHand();
    },

    // if the computer can play a card, it removes a random card from its hand and the com-container, and puts it in the inPlay list (updates tablevalue)
    // if it cant play, it sets its inPlay to false and tells the user it chose go
    playComputerCard: function() {
        const cards = document.querySelector('.com-cards-container').childNodes;
        const playableCards = this.getPlayableCards(cards);
        if (playableCards.length <= 0) {
            this.appendMessage('The Computer chooses go.');
            computer.canPlay = false;
        } else {
            this.lastToPlay = computer;
            const randomIndex = Math.floor(Math.random() * (playableCards.length));
            const childCard = playableCards[randomIndex];
            document.querySelector('.com-cards-container').removeChild(childCard);
            childCard.classList.add('card');
            childCard.classList.remove('face-down');
            this.inPlay.push(childCard);
            this.updateInPlay();

            const card = this.htmlToCard(childCard);
            this.tableValue += card.value();

            computer.hand.splice(randomIndex, 1);
            this.appendMessage('The Computer plays the ' + card.rank + ' of ' + card.suit + '.', 'blue');
            Score.scorePlay(computer);

            if (this.gameIsOver()) {
                return this.activateEndButton('yellow');
            }

            if (computer.hand.length === 0) {
                computer.canPlay = false;
            }
        }
    }
};