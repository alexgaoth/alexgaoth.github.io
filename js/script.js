const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

// Navigation hints for mobile
let hasSeenFirstSlide = false;
let hasSeenSecondSlide = false;
let downHint = null;
let upHint = null;

document.addEventListener('keydown', (e) => {
    if ((e.key === 'ArrowUp' || e.key === 'ArrowLeft') && currentSlide > 0) {
        showSlide(currentSlide - 1);
    } else if ((e.key === 'ArrowDown' || e.key === 'ArrowRight')) {
        showSlide(currentSlide + 1);
    }
});

let touchstartY = 0;
let touchendY = 0;
let isSwiping = false;
const MIN_SWIPE = 50;

document.addEventListener('touchstart', (e) => {
    touchstartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', (e) => {
    if (isSwiping) return;
    touchendY = e.changedTouches[0].screenY;
    handleGesture();
});

function handleGesture() {
    const diff = touchstartY - touchendY;
    if (Math.abs(diff) < MIN_SWIPE) return;
    isSwiping = true;
    if (diff > 0) {
        showSlide(currentSlide + 1);
    } else {
        showSlide(currentSlide - 1);
    }
    setTimeout(() => { isSwiping = false; }, 600);
}

// Mouse wheel and trackpad scroll handling
let isScrolling = false;
let scrollTimeout;

document.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (isScrolling) return;
    isScrolling = true;
    if (e.deltaY > 0) {
        showSlide(currentSlide + 1);
    } else if (e.deltaY < 0) {
        showSlide(currentSlide - 1);
    }
    setTimeout(() => {
        isScrolling = false;
    }, 650);
}, { passive: false });

// Jump to slide by URL hash on load (e.g. #contact)
const hashSlide = [...slides].findIndex(s => s.id === window.location.hash.slice(1));
if (hashSlide > 0) currentSlide = hashSlide;
slides[currentSlide].classList.add('active');

function showSlide(slideIndex) {
    if (slideIndex >= slides.length || (slideIndex > currentSlide && slides[currentSlide].id === 'about')) {
        location.href = 'https://app.alexgaoth.com/';
    }
    else if (slideIndex >= 0){
        // Mark slides as seen before transition
        if (currentSlide === 0) {
            hasSeenFirstSlide = true;
        }
        if (currentSlide === 1) {
            hasSeenSecondSlide = true;
        }
        
        // Moving forward (down)
        if (slideIndex > currentSlide) {
            slides[currentSlide].classList.remove('active');
            slides[currentSlide].classList.add('passed');
        }
        // Moving backward (up)
        else if (slideIndex < currentSlide) {
            slides[currentSlide].classList.remove('active');
            slides[slideIndex].classList.remove('passed');
        }
        
        slides[slideIndex].classList.add('active');
        currentSlide = slideIndex;
        
        // Update hints after transition
        updateHints();
    }
}

// Function to manage hints visibility
function updateHints() {
    if (!downHint || !upHint) return;
    
    if (currentSlide === 0 && !hasSeenFirstSlide) {
        downHint.classList.add('visible');
    } else {
        downHint.classList.remove('visible');
    }
    
    if (currentSlide === 1 && !hasSeenSecondSlide) {
        upHint.classList.add('visible');
    } else {
        upHint.classList.remove('visible');
    }
}

// Create navigation hints for mobile
if (window.innerWidth <= 768) {
    // Create down arrow hint for first slide
    downHint = document.createElement('div');
    downHint.className = 'nav-hint nav-hint-down';
    downHint.innerHTML = `
        <span>scroll this way to continue</span>
        <span class="arrow-icon">↓</span>
    `;
    document.body.appendChild(downHint);
    
    // Create up arrow hint for second slide
    upHint = document.createElement('div');
    upHint.className = 'nav-hint nav-hint-up';
    upHint.innerHTML = `
        <span class="arrow-icon">↑</span>
        <span>go back this way</span>
    `;
    document.body.appendChild(upHint);
    
    // Show down hint on first slide after a delay
    setTimeout(() => {
        if (currentSlide === 0) {
            downHint.classList.add('visible');
        }
    }, 500);
}

function updateAgeCounter() {
    const birthDate = new Date('2007-03-02T12:21:11Z');
    const now = new Date();
    let diff = Math.floor((now - birthDate) / 1000);

    const years = Math.floor(diff / (365.25 * 24 * 60 * 60));
    diff -= years * 365.25 * 24 * 60 * 60;

    const days = Math.floor(diff / (24 * 60 * 60));
    diff -= days * 24 * 60 * 60;

    const hours = Math.floor(diff / (60 * 60));
    diff -= hours * 60 * 60;

    const minutes = Math.floor(diff / 60);
    const seconds = diff - minutes * 60;

    const ageSpan = document.getElementById('age');
    if (ageSpan) {
        ageSpan.textContent = `${years} years, ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
    }
}

let currentImageIndex = 0;
const totalImages = 5;

function rotateGallery(direction) {
    const items = document.querySelectorAll('.gallery-item');
    
    currentImageIndex = (currentImageIndex + direction + totalImages) % totalImages;
    
    items.forEach(item => {
        item.className = 'gallery-item';
    });
    
    for (let i = 0; i < totalImages; i++) {
        const item = items[i];
        const relativePosition = (i - currentImageIndex + totalImages) % totalImages;
        
        if (relativePosition === 0) {
            item.classList.add('center');
        } else if (relativePosition === 1) {
            item.classList.add('bottom');
        } else if (relativePosition === totalImages - 1) {
            item.classList.add('top');
        } else if (relativePosition === totalImages - 2) {
            item.classList.add('hidden');
        } else {
            item.classList.add('hidden-bottom');
        }
    }
}

setInterval(() => {
    rotateGallery(-1);
}, 4000);


setInterval(updateAgeCounter, 1000);
updateAgeCounter();


// Click on name-highlight to go to next slide
document.querySelectorAll('.name-highlight').forEach(el => {
    el.addEventListener('click', () => {
        showSlide(currentSlide + 1);
    });
});