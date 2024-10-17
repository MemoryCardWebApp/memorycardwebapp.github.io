let cards = [];
let currentStudySet = [];
let currentCardIndex = 0;

const card = document.getElementById('card');
const frontText = document.getElementById('front-text');
const backText = document.getElementById('back-text');
const flipBtn = document.getElementById('flip-btn');
const nextBtn = document.getElementById('next-btn');
const ratingButtons = document.querySelectorAll('.rating-btn');
const studyContent = document.getElementById('study-content');
const sessionSummary = document.getElementById('session-summary');
const newSessionBtn = document.getElementById('new-session-btn');
const ratingSpan = document.querySelector('#rating span');

/*
Card selection probability based on knowledge level:
Level 1 (Least known): 40%
Level 2: 30%
Level 3: 15%
Level 4: 10%
Level 5 (Most known): 5%

This weighted distribution ensures more 
frequent review of less familiar cards.
*/

function flipCard() {
	card.classList.toggle('flipped');
}

function nextCard() {
	if (currentCardIndex < currentStudySet.length - 1) {
		currentCardIndex++;
		updateCard();
		if (card.classList.contains('flipped')) {
			flipCard();
		}
	} else {
		endSession();
	}
}

function updateCard() {
	if (currentStudySet.length > 0) {
		const currentCard = currentStudySet[currentCardIndex];
		frontText.textContent = currentCard.front;
		backText.textContent = currentCard.back;
		updateRatingButtons(currentCard.rating);
		updateRating(currentCard.rating);
	} else {
		frontText.textContent = "No cards available";
		backText.textContent = "Please add cards in the Card Options page";
		updateRating(null);
	}
}

function endSession() {
	studyContent.style.display = 'none';
	sessionSummary.style.display = 'block';
}

function startNewSession() {
	generateStudySet();
	currentCardIndex = 0;
	updateCard();
	if (card.classList.contains('flipped')) {
		flipCard();
	}
	studyContent.style.display = 'block';
	sessionSummary.style.display = 'none';
}

function loadCards() {
	const storedCards = localStorage.getItem('cards');
	if (storedCards) {
		cards = JSON.parse(storedCards);
		console.log('Cards loaded successfully from localStorage');
		startNewSession();
	} else {
		fetch('cards.json')
			.then(response => response.json())
			.then(data => {
				if (Array.isArray(data) && data.length > 0) {
					cards = data;
					console.log('Cards loaded successfully from JSON file');
					localStorage.setItem('cards', JSON.stringify(cards));
				} else {
					console.log('JSON file is empty or invalid. Using default empty array.');
					cards = [];
				}
				startNewSession();
			})
			.catch(error => {
				console.error('Error loading cards:', error);
				cards = [];
				updateCard();
			});
	}
}

function generateStudySet() {
	currentStudySet = [];
	const weightedCards = cards.flatMap(card => {
		let weight;
		switch (card.rating) {
			case 1: weight = 8; break;
			case 2: weight = 6; break;
			case 3: weight = 3; break;
			case 4: weight = 2; break;
			case 5: weight = 1; break;
			default: weight = 8; break;
		}
		return Array(weight).fill(card);
	});

	for (let i = 0; i < 10 && weightedCards.length > 0; i++) {
		const randomIndex = Math.floor(Math.random() * weightedCards.length);
		const selectedCard = weightedCards[randomIndex];
		currentStudySet.push(selectedCard);
		weightedCards.splice(0, weightedCards.length, ...weightedCards.filter(c => c !== selectedCard));
	}
}

function updateRatingButtons(rating) {
	ratingButtons.forEach(button => {
		const buttonRating = parseInt(button.dataset.rating);
		if (rating && buttonRating <= rating) {
			button.classList.add('selected');
		} else {
			button.classList.remove('selected');
		}
	});
}

function updateRating(rating) {
	if (ratingSpan) {
		if (rating) {
			ratingSpan.textContent = rating;
		} else {
			ratingSpan.textContent = 'Not rated yet';
		}
	}
}

function rateCard(rating) {
	if (currentStudySet.length > 0) {
		const currentCard = currentStudySet[currentCardIndex];
		currentCard.rating = rating;
		const mainCardIndex = cards.findIndex(c => c.front === currentCard.front && c.back === currentCard.back);
		if (mainCardIndex !== -1) {
			cards[mainCardIndex].rating = rating;
		}
		localStorage.setItem('cards', JSON.stringify(cards));
		updateRatingButtons(rating);
		updateRating(rating);
	}
}

flipBtn.addEventListener('click', flipCard);
nextBtn.addEventListener('click', nextCard);
newSessionBtn.addEventListener('click', startNewSession);

ratingButtons.forEach(button => {
	button.addEventListener('click', () => {
		const rating = parseInt(button.dataset.rating);
		rateCard(rating);
	});
});

// Load cards when the page loads
window.addEventListener('load', loadCards);
