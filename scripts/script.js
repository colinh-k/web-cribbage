import {Deck, Card} from './deck.js';

/* dealing with the first page */

/* dealing with game variables */


let dealer = player;
let nonDealer = computer;

let crib = [];
let starterCard;

let activePlayers = [nonDealer, dealer];

/* // sets welcome button event listener 
const welcomeButton = document.querySelector('.welcome-continue-button');
welcomeButton.addEventListener('click', function() {
    const body = document.querySelector('body');
    body.removeChild(body.firstChild);
    renderGame();
    renderHands();
});

function deletePage() {
    const body = document.querySelector('body');
    body.removeChild(body.firstChild);
    renderGame();
    renderHands();
} */

// adds all game containers and confirmation button
function renderGame() {
    const body = document.querySelector('body');
    const gameContainer = document.createElement('div');
    gameContainer.classList.add('game-container');

    addGameComponents('div', 'message-container', body);

    addGameComponents('div', 'com-cards-container', gameContainer);
    addGameComponents('div', 'starter-card-container', gameContainer);
    addGameComponents('div', 'in-play-container', gameContainer);
    addGameComponents('div', 'score-container', gameContainer);
    addGameComponents('button', 'confirmation-button', gameContainer, 'Confirm Selection');
    addGameComponents('div', 'player-cards-container', gameContainer);

    body.appendChild(gameContainer);
}

// returns a new element of the type eleemntType and with the className class
function addGameComponents(elementType, className, parent, content=false) {
    const newElement = document.createElement(elementType);
    if (content) {
        newElement.innerText = content;
    }
    newElement.classList.add(className);
    parent.appendChild(newElement);
}

// puts two new p elements in the score container
/* function updateScore() {
    const scoreContainer = document.querySelector('.score-container');
    const playerScoreElement = document.createElement('p');
    playerScoreElement.innerText = 'Player1: ' + playerScore + ' points';
    const computerScoreElement = document.createElement('p');
    computerScoreElement.innerText = 'Computer: ' + computerScore + ' points';
    scoreContainer.appendChild(playerScoreElement);
    scoreContainer.appendChild(computerScoreElement);
} */

function renderHands() {
    const playerContainer = document.querySelector('.player-cards-container');
    player.hand.forEach(card => {
        playerContainer.appendChild(card.getHTML());
    });
    const computerContainer = document.querySelector('.com-cards-container');
    computer.hand.forEach(card => {
        computerContainer.appendChild(card.getHTML(true));
    });
}

/* deck functions */
function shuffleDeckAndDealHands() {
    deck.reStackAndShuffle();
    player.hand = deck.deal(6);
    computer.hand = deck.deal(6);
}