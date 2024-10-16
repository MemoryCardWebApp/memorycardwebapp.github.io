let cards = [];
let currentCardIndex = 0;

const card = document.getElementById('card');
const frontText = document.getElementById('front-text');
const backText = document.getElementById('back-text');
const flipBtn = document.getElementById('flip-btn');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');

function flipCard() {
	card.classList.toggle('flipped');
}

function nextCard() {
	currentCardIndex = (currentCardIndex + 1) % cards.length;
	updateCard();
	if (card.classList.contains('flipped')) {
		flipCard();
	}
}

function prevCard() {
	currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
	updateCard();
	if (card.classList.contains('flipped')) {
		flipCard();
	}
}

function updateCard() {
	if (cards.length > 0) {
		const currentCard = cards[currentCardIndex];
		frontText.textContent = currentCard.front;
		backText.textContent = currentCard.back;
	} else {
		frontText.textContent = "No cards available";
		backText.textContent = "Please add cards in the Card Options page";
	}
}

function loadCards() {
	const storedCards = localStorage.getItem('cards');
	if (storedCards) {
		cards = JSON.parse(storedCards);
		console.log('Cards loaded successfully from localStorage');
		updateCard();
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
				updateCard();
			})
			.catch(error => {
				console.error('Error loading cards:', error);
				cards = [];
				updateCard();
			});
	}
}

flipBtn.addEventListener('click', flipCard);
nextBtn.addEventListener('click', nextCard);
prevBtn.addEventListener('click', prevCard);

// Load cards when the page loads
window.addEventListener('load', loadCards);
