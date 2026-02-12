// DOM Elements
const cover = document.getElementById('cover');
const coverTab = document.getElementById('coverTab');
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const hiddenMessage = document.getElementById('hiddenMessage');

//  STATE VARIABLES
const MAX_SLIDE = 550;
let yesClicked = false;
let buttonsActive = false;
let isDragging = false;
let startX;
let currentX = 0;
let dodgeCount = 0;

const FLOWERS = ['🌸', '🌼', '🌻', '🌺', '🌸', '🌷', '🌹', '💮', '🏵️', '🌼', '🌸', '💖', '💗', '💓'];

function spawnFlower(e) {
    let x, y;
    
    if (e.type === 'click') {
        x = e.clientX;
        y = e.clientY;
    } else if (e.type === 'touchstart') {
        if (e.touches[0]) {
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        } else {
            return;
        }
    } else {
        return;
    }
    
    // Create flower element
    const flower = document.createElement('div');
    flower.className = 'flower';
    flower.textContent = FLOWERS[Math.floor(Math.random() * FLOWERS.length)];
    
    // Randomize
    flower.style.left = x + 'px';
    flower.style.top = y + 'px';
    flower.style.fontSize = (25 + Math.floor(Math.random() * 25)) + 'px';
    flower.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
    flower.style.animationDelay = (Math.random() * 0.2) + 's';
    
    // Random rotation
    flower.style.transform = `rotate(${Math.random() * 60 - 30}deg)`;
    
    // Add to page
    document.body.appendChild(flower);
    
    // Remove after animation
    setTimeout(() => {
        if (flower.parentNode) flower.remove();
    }, 3000);
}

// ============================================
//  DRAG LOGIC
// ============================================

coverTab.addEventListener('mousedown', startDrag);
coverTab.addEventListener('touchstart', startDrag);

function startDrag(e) {
    isDragging = true;
    cover.style.transition = 'none';
    
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    startX = clientX - currentX;
    
    coverTab.style.cursor = 'grabbing';
    cover.classList.add('dragging');
    e.preventDefault();
}

document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag, { passive: false });

function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    cover.style.transition = 'none';
    
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    let newX = clientX - startX;
    
    if (newX < 0) newX = 0;
    if (newX > MAX_SLIDE) newX = MAX_SLIDE;
    
    currentX = newX;
    cover.style.transform = `translateX(${currentX}px)`;
    
    const opacity = 0.95 * (1 - currentX / MAX_SLIDE);
    cover.style.opacity = Math.max(0, opacity);
}

document.addEventListener('mouseup', stopDrag);
document.addEventListener('touchend', stopDrag);

function stopDrag() {
    isDragging = false;
    coverTab.style.cursor = 'grab';
    cover.classList.remove('dragging');
    
    if (currentX > MAX_SLIDE * 0.8) {
        completeReveal();
    } else {
        slideBack();
    }
}

function completeReveal() {
    cover.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    cover.style.transform = `translateX(${MAX_SLIDE + 100}px)`;
    cover.style.opacity = '0';
    
    setTimeout(() => {
        cover.style.display = 'none';
        hiddenMessage.classList.add('revealed');
        buttonsActive = true;
        
        // Yes button pulse
        yesBtn.style.animation = 'gentlePulse 2s infinite alternate';
        yesBtn.style.boxShadow = '0 0 15px rgba(255, 64, 129, 0.3)';
        
        // Hover effects
        yesBtn.addEventListener('mouseenter', () => {
            yesBtn.style.animation = 'gentlePulse 0.8s infinite alternate';
            yesBtn.style.boxShadow = '0 0 25px rgba(255, 64, 129, 0.6)';
            // Spawn extra flowers on hover
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    spawnFlower({
                        type: 'click',
                        clientX: yesBtn.getBoundingClientRect().left + 50,
                        clientY: yesBtn.getBoundingClientRect().top
                    });
                }, i * 50);
            }
        });
        
        yesBtn.addEventListener('mouseleave', () => {
            yesBtn.style.animation = 'gentlePulse 2s infinite alternate';
            yesBtn.style.boxShadow = '0 0 15px rgba(255, 64, 129, 0.3)';
        });
        
        // Start dodging
        document.addEventListener('mousemove', handleNoButtonDodge);
        document.addEventListener('touchmove', handleTouchDodge);
        
    }, 500);
}

function slideBack() {
    cover.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    cover.style.transform = 'translateX(0px)';
    cover.style.opacity = '0.95';
    currentX = 0;
    setTimeout(() => {
        cover.style.transition = 'transform 0.1s ease';
    }, 300);
}

// ============================================
//  NO BUTTON DODGING
// ============================================

function handleNoButtonDodge(e) {
    if (!buttonsActive || yesClicked) return;
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    const rect = noBtn.getBoundingClientRect();
    const btnX = rect.left + rect.width / 2;
    const btnY = rect.top + rect.height / 2;
    
    const distX = mouseX - btnX;
    const distY = mouseY - btnY;
    const distance = Math.sqrt(distX * distX + distY * distY);
    
    if (distance < 80) {
        const force = 80;
        const moveX = -distX / distance * force;
        const moveY = -distY / distance * force;
        
        const randomX = (Math.random() - 0.5) * 30;
        const randomY = (Math.random() - 0.5) * 30;
        
        noBtn.style.transition = 'transform 0.15s ease-out';
        noBtn.style.transform = `translate(${moveX + randomX}px, ${moveY + randomY}px)`;
        
        if (Math.random() > 0.7) {
            const texts = ["Nope!", "Missed!", "Too slow!", "Try again!"];
            noBtn.textContent = texts[Math.floor(Math.random() * texts.length)];
        }
        
        dodgeCount++;
        
    } else if (distance > 150) {
        noBtn.style.transition = 'transform 0.5s ease';
        noBtn.style.transform = 'translate(0, 0)';
        noBtn.textContent = 'No.';
    }
}

function handleTouchDodge(e) {
    if (!buttonsActive || yesClicked) return;
    if (e.touches[0]) {
        handleNoButtonDodge({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
    }
}

// ============================================
//  YES BUTTON CLICK - FLOWERS CONTINUE!
// ============================================

yesBtn.addEventListener('click', () => {
    if (!buttonsActive || yesClicked) return;
    
    yesClicked = true;
    yesBtn.disabled = true;
    
    // Fade out button container
    const buttonContainer = document.querySelector('.button-container');
    if (buttonContainer) {
        buttonContainer.style.transition = 'opacity 0.5s ease';
        buttonContainer.style.opacity = '0';
        setTimeout(() => {
            buttonContainer.style.display = 'none';
        }, 500);
    }
    
    // Celebration
    yesBtn.textContent = "YAY! 💖🎉";
    yesBtn.style.animation = 'celebrate 1s ease-out';
    yesBtn.style.transform = 'scale(2.5)';
    yesBtn.style.background = 'linear-gradient(45deg, #ff4081, #ff80ab)';
    
    // Hide no button
    noBtn.style.opacity = '0';
    noBtn.style.transition = 'opacity 0.5s ease';
    
    // Heart explosion
    createHeartExplosion(20);
    
    // Spawn a burst of flowers on Yes click
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            spawnFlower({
                type: 'click',
                clientX: yesBtn.getBoundingClientRect().left + 50 + (Math.random() - 0.5) * 100,
                clientY: yesBtn.getBoundingClientRect().top + 20 + (Math.random() - 0.5) * 100
            });
        }, i * 30);
    }
    
    // Victory message
    setTimeout(() => {
        const victory = document.createElement('div');
        victory.textContent = "Best Valentine's Ever! 💘";
        victory.className = 'victory-message';
        
        const valentineText = document.querySelector('.valentine-text');
        if (valentineText && valentineText.parentNode) {
            valentineText.parentNode.insertBefore(victory, valentineText.nextSibling);
        }
        
        // Spawn flowers around victory message
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                spawnFlower({
                    type: 'click',
                    clientX: window.innerWidth / 2 + (Math.random() - 0.5) * 300,
                    clientY: window.innerHeight / 2 + (Math.random() - 0.5) * 200
                });
            }, i * 50);
        }
    }, 800);
    
    buttonsActive = false;
    
    // Remove dodging listeners but KEEP FLOWERS
    document.removeEventListener('mousemove', handleNoButtonDodge);
    document.removeEventListener('touchmove', handleTouchDodge);
});

// ============================================
//  HEART EXPLOSION
// ============================================

function createHeartExplosion(count) {
    const hearts = ['💖', '💗', '💓', '💞', '💕', '💘'];
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.position = 'fixed';
            heart.style.fontSize = (25 + Math.random() * 20) + 'px';
            heart.style.zIndex = '10000';
            heart.style.left = (yesBtn.getBoundingClientRect().left + 40) + 'px';
            heart.style.top = (yesBtn.getBoundingClientRect().top + 20) + 'px';
            heart.style.pointerEvents = 'none';
            heart.style.animation = 'floatFlower 1.5s ease-out forwards';
            heart.style.color = '#ff4081';
            document.body.appendChild(heart);
            
            setTimeout(() => {
                if (heart.parentNode) heart.remove();
            }, 1500);
        }, i * 30);
    }
}

// ============================================
//  INITIALIZATION - FLOWERS FOREVER!
// ============================================

// Start flowers immediately - NO CONDITIONS, ALWAYS ON
document.addEventListener('click', spawnFlower);
document.addEventListener('touchstart', spawnFlower);

// Also spawn flowers on drag end for extra fun
document.addEventListener('mouseup', (e) => {
    if (Math.random() > 0.5) {
        spawnFlower(e);
    }
});

console.log("🌸 FLOWERS FOREVER! Click anywhere - even after Yes!");

// No button click escape
noBtn.addEventListener('click', (e) => {
    if (!buttonsActive || yesClicked) return;
    e.preventDefault();
    const jumpX = (Math.random() - 0.5) * 200;
    const jumpY = (Math.random() - 0.5) * 200;
    noBtn.style.transform = `translate(${jumpX}px, ${jumpY}px)`;
    
    // Spawn flower on no button dodge
    spawnFlower(e);
});

// Prevent touch scrolling on drag
document.addEventListener('touchmove', function(e) {
    if (isDragging) {
        e.preventDefault();
    }
}, { passive: false });

// Spawn a welcome burst on page load
window.addEventListener('load', () => {
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            spawnFlower({
                type: 'click',
                clientX: window.innerWidth / 2 + (Math.random() - 0.5) * 400,
                clientY: window.innerHeight / 2 + (Math.random() - 0.5) * 300
            });
        }, i * 50);
    }
});