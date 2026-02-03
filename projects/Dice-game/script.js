// 'use strict';

// //  selecting elements

// const player0El = document.querySelector('.player--0');
// const player1El = document.querySelector('.player--1');

// const score0El = document.querySelector('#score--0');
// const score1El = document.getElementById('score--1');
// const current0El = document.getElementById('current--0');
// const current1El = document.getElementById('current--1');


// const diceEl = document.querySelector('.dice')
// const btnNew = document.querySelector('.btn--new');
// const btnRoll = document.querySelector('.btn--roll');
// const btnHold = document.querySelector('.btn--hold');








// // assigning initial values 'Starting conditions'

// score0El.textContent = 0;
// score1El.textContent = 0;
// diceEl.classList.add('hidden');

// const scores = [0,0];
// let currentScore = 0;

// let activePlayer = 0;
// let playing = true;



// const switchPlayer = function(){
//             document.getElementById(`current--${activePlayer}`).textContent = 0;
//             currentScore = 0;
//             activePlayer = activePlayer === 0 ? 1 : 0 ;
//             player0El.classList.toggle('player--active');
//             player1El.classList.toggle('player--active');
// }


// let finalSCore = function(){
//     if(scores[activePlayer] >= 20)
//         {
//         document.querySelector(`.player--${activePlayer}`).classList.add('player--winner');
//         document.querySelector(`.player--${activePlayer}`).classList.remove('player--active');
//         playing =  false;
//     }};


// //  functions 



// if(playing){

//     // Rolling functionality 
    
//     // generating random number from 1 to 6 
//     const rollingDice = function(){
//         const dice = Math.trunc(Math.random()* 6 ) + 1;
//         console.log(dice);
        
//         // Display dice 
        
//         diceEl.classList.remove('hidden');
//         diceEl.src = `dice-${dice}.png`;
        
//         if (dice !== 1){
//             currentScore += dice;
//             document.getElementById(`current--${activePlayer}`).textContent = currentScore;
            
            
//         } else {
//             switchPlayer();
//             finalSCore();
            
//         }
//     }
    
    
    
//     // hold functinality 
//     const holdingScore = function(){
//         console.log('hold active');
        
        
//         scores[activePlayer] += currentScore ;
        
//         console.log(scores[activePlayer]);
        
//         // score[1] = scores[1] + currentScore ; 
//         document.getElementById(`current--${activePlayer}`).textContent = scores[activePlayer];
        
//         document.getElementById(`score--${activePlayer}`).textContent = scores[activePlayer];
        
        
//         finalSCore();
//         switchPlayer();
//     };
    
    
    
    
//     btnRoll.addEventListener('click', rollingDice);
    
//     btnHold.addEventListener('click', holdingScore); 
//     btnNew.addEventListener('click', function{
//         score0El.textContent = 0;
//         score1El.textContent = 0;
//         current1El.textContent = 0;
//         current0El.textContent = 0;
//     }); 
// };




'use strict';

const player0El = document.querySelector('.player--0');
const player1El = document.querySelector('.player--1');

const score0El = document.getElementById('score--0');
const score1El = document.getElementById('score--1');
const current0El = document.getElementById('current--0');
const current1El = document.getElementById('current--1');

const diceEl = document.querySelector('.dice');
const btnNew = document.querySelector('.btn--new');
const btnRoll = document.querySelector('.btn--roll');
const btnHold = document.querySelector('.btn--hold');

let scores, currentScore, activePlayer, playing;

function initGame() {
  // Reset all values
  scores = [0, 0];
  currentScore = 0;
  activePlayer = 0;
  playing = true;

  score0El.textContent = 0;
  score1El.textContent = 0;
  current0El.textContent = 0;
  current1El.textContent = 0;

  diceEl.classList.add('hidden');

  player0El.classList.remove('player--winner');
  player1El.classList.remove('player--winner');
  player0El.classList.add('player--active');
  player1El.classList.remove('player--active');
}

function switchPlayer() {
  document.getElementById(`current--${activePlayer}`).textContent = 0;
  currentScore = 0;
  activePlayer = activePlayer === 0 ? 1 : 0;
  player0El.classList.toggle('player--active');
  player1El.classList.toggle('player--active');
}

function checkWinner() {
  if (scores[activePlayer] >= 100) {
    document.querySelector(`.player--${activePlayer}`).classList.add('player--winner');
    document.querySelector(`.player--${activePlayer}`).classList.remove('player--active');
    playing = false;
    diceEl.classList.add('hidden');
  }
}

function rollingDice() {
  if (!playing) return;

  const dice = Math.trunc(Math.random() * 6) + 1;
  diceEl.classList.remove('hidden');
  diceEl.src = `dice-${dice}.png`;

  if (dice !== 1) {
    currentScore += dice;
    document.getElementById(`current--${activePlayer}`).textContent = currentScore;
  } else {
    switchPlayer();
  }
}

function holdingScore() {
  if (!playing) return;

  scores[activePlayer] += currentScore;
  document.getElementById(`score--${activePlayer}`).textContent = scores[activePlayer];
  currentScore = 0;

  checkWinner();
  if (playing) switchPlayer();
}

// EVENT LISTENERS
btnRoll.addEventListener('click', rollingDice);
btnHold.addEventListener('click', holdingScore);
btnNew.addEventListener('click', initGame);

// CALL GAME ON LOAD
initGame();
