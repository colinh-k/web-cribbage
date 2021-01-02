const SUITS = ["♠︎", "♣︎", "♥︎", "♦︎"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

/* export {
    Deck, Card
}; */

let deck = new Deck();

// post: Returns an array of Card objects representing 52 standard playing cards.
function freshDeck() {
    return SUITS.flatMap(suit => {
        return VALUES.map(value => {
            return new Card(suit, value);
        })
    });
}

function Deck() {
    this.cards = freshDeck();
    this.inPlay = [];

    // post: Restacks and randomly reorganizes the order of cards in this Deck.
    this.reStackAndShuffle = function() {
        this.cards = this.cards.concat(this.inPlay);
        this.inPlay = [];

        let currentIndex = this.cards.length, temporaryVal, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temporaryVal = this.cards[currentIndex];
            this.cards[currentIndex] = this.cards[randomIndex];
            this.cards[randomIndex] = temporaryVal;
        }
        /* for (let i = this.numberOfCards - 1; i > 0; i--) {
            const newIndex = Math.floor(Math.random() * (i + 1));
            const oldValue = this.cards[newIndex];
            this.cards[newIndex] = this.cards[i];
            this.cards[i] = oldValue;
        } */
    }

     // post: Returns an array of cards of length qty.
    //       The returned cards are removed from the deck and placed in inPlay.
    this.deal = function(qty) {
        let cardsList = [];
        for (let i = 0; i < qty; i++) {
            /* let card = this.cards.splice(i, 1);
            this.inPlay = this.inPlay.concat(card); */
            cardsList = cardsList.concat(this.moveToInPlay(i));
        }
        return cardsList;
    }

    this.getRandomCard = function() {
        let randomIndex = Math.floor(Math.random() * (this.numberOfCards()));
        return this.moveToInPlay(randomIndex);
    }

    // post: Removes and returns the card at the index in the deck. The removed card is added to inPlay.
    this.moveToInPlay = function(index) {
        let removed = this.cards.splice(index, 1)[0];
        this.inPlay.push(removed); /* = this.inPlay.concat(removed); */
        return removed;
    }

    // post: stores the number of cards in this Deck.
    this.numberOfCards = function() {
        return this.cards.length;
    }
}

function Card(suit, rank) {
    this.suit = suit;
    this.rank = rank;

    this.getRankInt = function() {
        if (this.rank === 'A') {
            return 1;
        } else if (this.rank === 'J') {
            return 11;
        } else if (this.rank === 'Q') {
            return 12;
        } else if (this.rank === 'K') {
            return 13;
        } else {
            return parseInt(this.rank, 10);
        }
    }

    // pre : showBack is a boolean that determines wheater to show the back of the card.
    // post: Returns an element that can be added to the DOM representing this Card
    //       as it would appear on the page.
    this.getHTML = function(faceDown = false) {
        const cardDiv = document.createElement('div');
        if (!faceDown) {
            cardDiv.innerText = this.suit;
            cardDiv.classList.add("card", this.color);
            cardDiv.dataset.value = `${this.rank} ${this.suit}`;
        } else {
            cardDiv.classList.add('face-down');
        }
        return cardDiv;
    }

    // post: Returns the apprpriate CSS class name for the Card ("black" if 
    //       this.suit is a spade or club, "red" otherwise)
    this.color = this.suit === "♠︎" || this.suit === "♣︎" ? 'black' : 'red';

    // access by player.value
    // post: Returns an integer value of the Card's cribbage scoring value.
    this.value = function() {
        if (this.rank === 'A') {
            return 1;
        } else if (this.rank === "J") {
            return 10;
        } else if (this.rank === 'Q') {
            return 10;
        } else if (this.rank === 'K') {
            return 10;
        } else {
            return parseInt(this.rank, 10);
        }
    };

    this.equals = function(other) {
        return (this.rank == other.rank && this.suit === other.suit);
    }
}