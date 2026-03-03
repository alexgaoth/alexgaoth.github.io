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
if (hashSlide > 0) {
    slides[0].classList.remove('active'); // clear the hardcoded active on #home
    currentSlide = hashSlide;
}
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


// Interest topic carousel
(function () {
    var carousel = document.getElementById('interests-topic-carousel');
    if (!carousel) return;

    // Read every topic from HTML, then trim DOM down to 3 visible slots
    var allItems = Array.from(carousel.querySelectorAll('.topic-item'));
    var topics   = allItems.map(function (el) { return el.textContent.trim(); });
    allItems.slice(3).forEach(function (el) { el.remove(); });

    if (topics.length === 0) return;

    var ANIM  = 480;   // transition ms
    var PAUSE = 1500;  // interval between rotations ms
    var nextIdx = 3 % topics.length; // first topic to cycle in after the initial 3
    var step = 0;      // fixed row pitch (height + gap), set once in setup

    function setup() {
        var items = Array.from(carousel.querySelectorAll('.topic-item'));
        if (!items.length) return;

        // Measure while items are still in normal flow
        var maxH = 0;
        items.forEach(function (el) { maxH = Math.max(maxH, el.offsetHeight); });
        var gap = parseFloat(getComputedStyle(items[0]).fontSize) * 0.12; // 0.12em
        step = maxH + gap;

        if (step < 5) { setTimeout(setup, 100); return; } // layout not ready yet

        // Fix container height so it doesn't collapse
        carousel.style.height = (step * 3 - gap) + 'px';

        // Pin items to absolute positions (CSS sets position:absolute, left/right)
        items.forEach(function (el, i) {
            el.style.top = (i * step) + 'px';
        });
    }

    function rotate() {
        if (step === 0) return;
        var items = Array.from(carousel.querySelectorAll('.topic-item'));
        if (items.length < 2) return;

        // Exit: top item slides right and fades
        items[0].style.transition =
            'transform ' + ANIM + 'ms ease-out, opacity ' + Math.round(ANIM * 0.6) + 'ms ease-out';
        items[0].style.transform = 'translateX(100px)';
        items[0].style.opacity   = '0';

        // Shift: remaining items rise by one step
        items.slice(1).forEach(function (item) {
            item.style.transition = 'transform ' + ANIM + 'ms ease-out';
            item.style.transform  = 'translateY(-' + step + 'px)';
        });

        // Enter: new item arrives from one step below the last
        var incoming = document.createElement('p');
        incoming.className      = 'topic-item';
        incoming.textContent    = topics[nextIdx];
        incoming.style.top      = (items.length * step) + 'px'; // absolute: below stack
        incoming.style.opacity  = '0';
        incoming.style.transition = 'none';
        carousel.appendChild(incoming);

        incoming.getBoundingClientRect(); // force paint so transition kicks in

        incoming.style.transition = 'transform ' + ANIM + 'ms ease-out, opacity ' + ANIM + 'ms ease-in';
        incoming.style.transform  = 'translateY(-' + step + 'px)';
        incoming.style.opacity    = '1';

        nextIdx = (nextIdx + 1) % topics.length;

        // Cleanup after animation — safe with absolute positioning:
        // removing items[0] has zero layout effect on siblings
        setTimeout(function () {
            items[0].remove();
            var survivors = items.slice(1).concat([incoming]);
            survivors.forEach(function (el, i) {
                el.style.transition = 'none';
                el.style.transform  = '';
                el.style.top        = (i * step) + 'px'; // snap to correct slot
            });
            // Re-arm transitions after the snap settles
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    survivors.forEach(function (el) { el.style.transition = ''; });
                });
            });
        }, ANIM + 30);
    }

    // Wait for layout before measuring
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            setup();
            setInterval(rotate, PAUSE);
        });
    });
}());

// Click on name-highlight to go to next slide
document.querySelectorAll('.name-highlight').forEach(el => {
    el.addEventListener('click', () => {
        showSlide(currentSlide + 1);
    });
});

// Driver's license pick-up / flip interaction
(function () {
    const scene = document.getElementById('dl-scene');
    const card  = document.getElementById('dl-card');
    if (!scene || !card) return;

    let holdTimer   = null;
    let isHeld      = false;
    let pressActive = false;
    let touchStartY = 0;
    let lastMouseX  = 0;
    let lastMouseY  = 0;
    const HOLD_MS  = 220;
    const TAP_DIST = 18;

    function applyHover(on) {
        card.classList.toggle('hovering', on);
        scene.classList.toggle('hovering', on);
    }

    function applyHeld(on) {
        card.classList.toggle('held', on);
        scene.classList.toggle('held', on);
    }

    // Mouse-tracking tilt when hovering (gentle)
    function updateHoverTransform() {
        var rect = card.getBoundingClientRect();
        var x = Math.max(0, Math.min(1, (lastMouseX - rect.left) / rect.width));
        var y = Math.max(0, Math.min(1, (lastMouseY - rect.top)  / rect.height));
        var rotX = -(y - 0.5) * 8;
        var rotY  =  (x - 0.5) * 12;
        var base  = card.classList.contains('flipped') ? 180 : 0;
        card.style.transition = 'transform 0.1s ease-out';
        card.style.transform  = 'translateY(-10px) scale(1.02) rotateX(' + rotX + 'deg) rotateY(' + (base + rotY) + 'deg)';
    }

    // Mouse-tracking tilt when held (more dramatic lift)
    function updateHeldTransform() {
        var rect  = card.getBoundingClientRect();
        var x = Math.max(0, Math.min(1, (lastMouseX - rect.left)  / rect.width));
        var y = Math.max(0, Math.min(1, (lastMouseY - rect.top)   / rect.height));
        var rotX  = -(y - 0.5) * 14;
        var rotY  =  (x - 0.5) * 18;
        var base  = card.classList.contains('flipped') ? 180 : 0;
        card.style.transition = 'transform 0.06s linear';
        card.style.transform  = 'translateY(-22px) scale(1.04) rotateX(' + rotX + 'deg) rotateY(' + (base + rotY) + 'deg)';
    }

    function clearHeldTransform() {
        card.style.transition = '';
        card.style.transform  = '';
    }

    function startPress() {
        pressActive = true;
        isHeld = false;
        applyHover(true);
        holdTimer = setTimeout(function () {
            isHeld = true;
            applyHover(false);
            applyHeld(true);
            updateHeldTransform(); // snap to current cursor position immediately
        }, HOLD_MS);
    }

    function endPress(shouldFlip) {
        if (!pressActive) return;
        clearTimeout(holdTimer);
        pressActive = false;
        var wasHeld = isHeld;
        isHeld = false;
        applyHeld(false);
        if (wasHeld) clearHeldTransform();
        if (!wasHeld && shouldFlip) {
            clearHeldTransform(); // clear any hover-tilt inline style so CSS drives the flip
            card.classList.add('flipping');
            card.classList.toggle('flipped');
            card.addEventListener('transitionend', function () {
                card.classList.remove('flipping');
                if (card.classList.contains('hovering') && !isHeld) updateHoverTransform();
            }, { once: true });
        }
    }

    // Track mouse for held/hover tilt
    document.addEventListener('mousemove', function (e) {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        if (isHeld) {
            updateHeldTransform();
        } else if (!pressActive && !card.classList.contains('flipping') && card.classList.contains('hovering')) {
            updateHoverTransform();
        }
    });

    // — Mouse —
    card.addEventListener('mouseenter', function () {
        if (!pressActive) {
            applyHover(true);
            updateHoverTransform();
        }
    });

    card.addEventListener('mouseleave', function () {
        applyHover(false);
        applyHeld(false);
        clearTimeout(holdTimer);
        isHeld = false;
        pressActive = false;
        clearHeldTransform();
    });

    card.addEventListener('mousedown', function (e) {
        e.preventDefault();
        startPress();
    });

    document.addEventListener('mouseup', function () {
        if (pressActive) {
            endPress(true);
            if (card.matches(':hover') && !card.classList.contains('flipping')) {
                applyHover(true);
                updateHoverTransform();
            }
        }
    });

    // — Touch —
    card.addEventListener('touchstart', function (e) {
        touchStartY  = e.changedTouches[0].screenY;
        lastMouseX   = e.changedTouches[0].clientX;
        lastMouseY   = e.changedTouches[0].clientY;
        startPress();
    }, { passive: true });

    card.addEventListener('touchmove', function (e) {
        if (isHeld && e.changedTouches.length) {
            lastMouseX = e.changedTouches[0].clientX;
            lastMouseY = e.changedTouches[0].clientY;
            updateHeldTransform();
        }
    }, { passive: true });

    card.addEventListener('touchend', function (e) {
        var dy = Math.abs(touchStartY - e.changedTouches[0].screenY);
        var isTap = dy < TAP_DIST;
        if (isTap) e.stopPropagation();
        endPress(isTap);
        setTimeout(function () { applyHover(false); }, 380);
    });

    card.addEventListener('touchcancel', function () {
        clearTimeout(holdTimer);
        pressActive = false;
        isHeld = false;
        applyHover(false);
        applyHeld(false);
        clearHeldTransform();
    });

    // Prevent social link items (only) from triggering card flip
    document.querySelectorAll('.dl-social-item').forEach(function (item) {
        item.addEventListener('mousedown', function (e) { e.stopPropagation(); });
        item.addEventListener('touchstart', function (e) { e.stopPropagation(); }, { passive: true });
    });
}());