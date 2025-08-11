// Initialize Tone.js for simple audio feedback
const synth = new Tone.Synth().toDestination();
const correctSound = new Tone.MembraneSynth().toDestination();
const incorrectSound = new Tone.PolySynth().toDestination();

// Global variable to store the current playing sequence for background audio
let currentHeroSequence = null;

// Object to map hero names to their quotes, placeholder image URLs, and audio sequences
const heroData = {
    'Aquaman': {
        quote: "I’m the sea! I’m the abyss! I’m Aquaman!",
        image: "Aqua.jpg",
        audioSequence: ["C5", "G5", "C6", "G5"] // Example sequence
    },
    'Black Panther': {
        quote: "We let the fear of our discovery stop us from doing what is right. No more.",
        image: "Panter.jpg",
        audioSequence: ["F4", "A4", "C5", "G4"]
    },
    'Dr Strange': {
        quote: "Dormammu, I've come to bargain!",
        image: "Strange.jpg",
        audioSequence: ["C3", "E3", "G3", "C4"]
    },
    'Shazam': {
        quote: "Dude! Dude! Dude! Dude, did you see that?",
        image: "Shazam.jpg",
        audioSequence: ["G2", "C2", "G2", "D2"]
    },
    'Wonder Woman': {
        quote: "Fighting for justice and equality. The world needs a hero like you!",
        image: "Wonder.jpg",
        audioSequence: ["C5", "E5", "G5", "C6"]
    },
    'Female Loki': {
        quote: "I am Loki, of Asgard, and I am burdened with glorious purpose!",
        image: "Lady.jpg",
        audioSequence: ["D4", "F#4", "A4", "C5"]
    },
    'Black Widow': {
        quote: "It's about making a choice. You have all the skills to be extraordinary.",
        image: "Black.jpg",
        audioSequence: ["E4", "G4", "B4", "E5"]
    },
    'Super Girl': {
        quote: "Up, up, and away! The sky is your limit, Supergirl!",
        image: "Girl.jpg",
        audioSequence: ["C5", "F5", "A5", "C6"]
    }
};

// Function to navigate between pages
function showPage(pageId) {
    const pages = ['riddlePage', 'genderPage', 'maleHeroesPage', 'femaleHeroesPage', 'heroDisplayPage', 'eventDetailsPage'];
    pages.forEach(id => {
        const page = document.getElementById(id);
        if (id === pageId) {
            page.classList.remove('hidden');
            // Force reflow for transition
            void page.offsetWidth;
            page.classList.remove('opacity-0');
        } else {
            page.classList.add('opacity-0');
            // Use a timeout to add 'hidden' class AFTER the opacity transition finishes
            // This prevents elements from being immediately invisible for screen readers or tab navigation
            setTimeout(() => {
                if (id !== pageId) { // Double check page is not the target page
                    page.classList.add('hidden');
                }
            }, 500); // Matches transition duration
        }
    });
}

// Riddle logic
function checkRiddleAnswer(answer) {
    const riddlePage = document.getElementById('riddlePage');
    const riddleFeedback = document.getElementById('riddleFeedback');

    if (answer === 'Map') {
        correctSound.triggerAttackRelease("C4", "8n");
        riddlePage.classList.remove('shake-animation');
        riddleFeedback.classList.add('hidden');
        // Stop any background hero audio if it somehow started
        stopCurrentHeroAudio();
        setTimeout(() => showPage('genderPage'), 500);
    } else {
        incorrectSound.triggerAttackRelease(["C2", "G2"], "8n");
        riddlePage.classList.add('shake-animation');

        riddleFeedback.textContent = "WRONG! TRY AGAIN!";
        riddleFeedback.classList.remove('hidden');

        riddlePage.addEventListener('animationend', () => {
            riddlePage.classList.remove('shake-animation');
        }, { once: true });

        setTimeout(() => {
            riddleFeedback.classList.add('hidden');
        }, 1500);
    }
}

// Gender selection logic
function selectGender(gender) {
    synth.triggerAttackRelease("E4", "8n");
    stopCurrentHeroAudio(); // Stop any hero audio if navigating back from hero display
    if (gender === 'Male') {
        setTimeout(() => showPage('maleHeroesPage'), 300);
    } else {
        setTimeout(() => showPage('femaleHeroesPage'), 300);
    }
}

// Hero selection logic
function selectHero(heroName) {
    synth.triggerAttackRelease("G4", "8n");

    const heroQuoteElement = document.getElementById('heroQuote');
    const heroImageElement = document.getElementById('heroImage');

    const data = heroData[heroName];
    if (data) {
        heroQuoteElement.textContent = data.quote;
        heroImageElement.src = data.image;

        playHeroAudio(heroName);
    }

    setTimeout(() => {
        showPage('heroDisplayPage');
        startConfetti();
    }, 500);
}

// Function to play unique background audio for each hero using Tone.js
function playHeroAudio(heroName) {
    // Stop and dispose of any currently playing sequence
    stopCurrentHeroAudio();

    const data = heroData[heroName];
    if (data && data.audioSequence) {
        // Create a new sequence
        currentHeroSequence = new Tone.Sequence((time, note) => {
            synth.triggerAttackRelease(note, "8n", time);
        }, data.audioSequence, "8n"); // "8n" makes each note 1/8th note long, sequence advances by 1/8th

        // Start the sequence at the beginning of the transport
        currentHeroSequence.start(0);

        // Schedule to stop the sequence after a few seconds (e.g., 3 seconds)
        // This simulates a short "background audio" effect
        Tone.Transport.scheduleOnce(() => {
            stopCurrentHeroAudio();
        }, Tone.Transport.currentTime + 3); // Schedule to stop 3 seconds from now

        // Ensure Tone.Transport is running to play the sequence
        if (Tone.Transport.state !== 'started') {
            Tone.Transport.start();
        }
    }
}

// Function to stop and dispose of the current hero audio sequence
function stopCurrentHeroAudio() {
    if (currentHeroSequence) {
        currentHeroSequence.stop();
        currentHeroSequence.dispose(); // Clean up resources
        currentHeroSequence = null; // Clear the reference
    }
    // Also ensure Tone.Transport is stopped if no other audio is playing
    // This part is tricky if other sounds are also using transport.
    // For this app, stopping transport here is fine as hero audio is the main sequenced audio.
    Tone.Transport.stop();
    Tone.Transport.cancel(); // Cancel all scheduled events
}


// Confetti effect
function startConfetti() {
    const container = document.getElementById('confettiContainer');
    container.innerHTML = ''; // Clear previous confetti
    const count = 50; // Number of confetti pieces
    for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        // Randomize position and animation properties
        const x = Math.random() * 100 + 'vw';
        const y = Math.random() * -20 + 'vh'; // Start above screen
        const dx = (Math.random() - 0.5) * 400 + 'px'; // Horizontal drift
        const dy = 500 + Math.random() * 300 + 'px'; // Vertical fall
        const delay = Math.random() * 1.5 + 's';
        const duration = 2 + Math.random() * 1.5 + 's';

        confetti.style.setProperty('--x', x);
        confetti.style.setProperty('--y', y);
        confetti.style.setProperty('--dx', dx);
        confetti.style.setProperty('--dy', dy);
        confetti.style.animation = `fall ${duration} ${delay} forwards, fade-out ${duration} ${delay} forwards`;
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = Math.random() * 100 + '%';
        container.appendChild(confetti);
    }

    // Remove confetti after it fades out (3 seconds, matching animation duration)
    setTimeout(() => {
        container.innerHTML = '';
    }, 3000);
}

// Show event details page
function showEventDetails() {
    synth.triggerAttackRelease("F4", "8n"); // Play a click sound
    stopCurrentHeroAudio(); // Stop hero audio before moving to event page
    showPage('eventDetailsPage');
}

// Reset game to the riddle page
function resetGame() {
    synth.triggerAttackRelease("C4", "8n"); // Play a click sound
    stopCurrentHeroAudio(); // Ensure all audio is stopped
    showPage('riddlePage');
}

// Initial page load
document.addEventListener('DOMContentLoaded', () => {
    showPage('riddlePage');
    // Ensure Tone.js starts when the user interacts, to avoid browser auto-play policies.
    document.body.addEventListener('click', () => {
        if (Tone.context.state !== 'running') {
            Tone.start();
        }
    }, { once: true });
});

