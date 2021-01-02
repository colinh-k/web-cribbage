let player, computer;

function Player(name) {
    this.name = name;
    this.score = 0;
    this.hand = [];
    this.handCopy = [];
    this.isComputer = this.name.toUpperCase() === 'THE COMPUTER';

    this.copyHand = function() {
        this.handCopy = [...this.hand];
    }

    this.canPlay = true;
}