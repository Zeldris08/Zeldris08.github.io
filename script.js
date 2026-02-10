const cover = document.getElementById('cover');
const coverTab = document.getElementById('coverTab');
const MAX_SLIDE = 550; 
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const hiddenMessage = document.getElementById('hiddenMessage');
let yesClicked = false; 
let dodgeHistory = []; 
let dodgeCount = 0; 
let buttonTiredness = 0; 
let buttonsActive = false;
let isDragging = false;
let startX;  
let currentX = 0;  

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
document.addEventListener('touchmove', drag);
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
        hiddenMessage.classList.add('revealed');
        buttonsActive = true;
        console.log("🎯 Buttons are now ACTIVE:", buttonsActive);
        
        yesBtn.style.animation = 'gentlePulse 2s infinite alternate';
        yesBtn.style.boxShadow = '0 0 15px rgba(255, 64, 129, 0.3)';
        
        yesBtn.addEventListener('mouseenter', () => {
            yesBtn.style.animation = 'gentlePulse 0.8s infinite alternate';
            yesBtn.style.boxShadow = '0 0 25px rgba(255, 64, 129, 0.6)';
            createFloatingHearts(2);
        });
        
        yesBtn.addEventListener('mouseleave', () => {
            yesBtn.style.animation = 'gentlePulse 2s infinite alternate';
            yesBtn.style.boxShadow = '0 0 15px rgba(255, 64, 129, 0.3)';
        });
        
        document.addEventListener('mousemove', handleNoButtonDodge);
        
        document.addEventListener('touchmove', (e) => {
            if (!buttonsActive) return;
            const touch = e.touches[0];
            handleNoButtonDodge({ clientX: touch.clientX, clientY: touch.clientY });
        });
        
    }, 600);
   
    setTimeout(() => {
        cover.style.display = 'none';
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

document.addEventListener('touchmove', function(e) {
    if (isDragging) {
        e.preventDefault();
    }
}, { passive: false });

function handleNoButtonDodge(e) {
    if (!buttonsActive || yesClicked) {
        return;
    }

    console.log("Dodging check");
    
    if (!buttonsActive) {
        console.log("⏸️ Buttons inactive");
        return;
    }
    
    const mouseX = e.clientX || (e.touches && e.touches[0].clientX);
    const mouseY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (!mouseX || !mouseY) return;
    
    const rect = noBtn.getBoundingClientRect();
    const btnX = rect.left + rect.width / 2;
    const btnY = rect.top + rect.height / 2;
    
    const distX = mouseX - btnX;
    const distY = mouseY - btnY;
    const distance = Math.sqrt(distX * distX + distY * distY);
    
    console.log(`📍 Distance: ${Math.round(distance)}px`);
    
    if (distance < 80) {
        console.log("💨 DODGING!");
        
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
    } else if (distance > 150) {
        noBtn.style.transition = 'transform 0.5s ease';
        noBtn.style.transform = 'translate(0, 0)';
    }
}

function updateNoButtonText() {
    const messages = [
        "Nope!",
        "Try again!",
        "Too slow!",
        "Missed me!",
        "Not today!",
        "Nice try!",
        "Almost!",
        "Nuh-uh!",
        "Psych!",
        "Swipe right!",
        "Catch me!",
        "Too easy!",
        "Getting tired?",
        "Persistent!",
        "Round " + (dodgeCount + 1)
    ];
    
    if (dodgeCount % 3 === 0) {
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        noBtn.textContent = randomMsg;
        
        noBtn.style.color = '#ff4081';
        setTimeout(() => {
            noBtn.style.color = '#666';
        }, 200);
    }
}

function createFloatingHearts(count) {
    for (let i = 0; i < count; i++) {
        const heart = document.createElement('div');
        heart.innerHTML = '💖';
        heart.style.position = 'fixed';
        heart.style.fontSize = '20px';
        heart.style.zIndex = '1000';
        heart.style.pointerEvents = 'none';
        heart.style.left = (yesBtn.getBoundingClientRect().left + 30) + 'px';
        heart.style.top = (yesBtn.getBoundingClientRect().top - 10) + 'px';
        heart.style.opacity = '1';
        document.body.appendChild(heart);
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 40;
        const duration = 800 + Math.random() * 400;
        
        heart.animate([
            { 
                transform: 'translate(0, 0) scale(1)', 
                opacity: 1 
            },
            { 
                transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance - 50}px) scale(0.5)`, 
                opacity: 0 
            }
        ], {
            duration: duration,
            easing: 'ease-out'
        });
        
        setTimeout(() => heart.remove(), duration);
    }
}

yesBtn.addEventListener('click', () => {
    if (!buttonsActive || yesClicked) {
        console.log("⏸️ Already clicked or not active");
        return;
    }
    
    yesClicked = true;
    yesBtn.classList.add('clicked');
    yesBtn.disabled = true;

    yesBtn.style.pointerEvents = 'none';
    yesBtn.style.opacity = '0.5';
    
    const buttonContainer = document.querySelector('.button-container');
    if (buttonContainer) {
        buttonContainer.style.transition = 'opacity 0.5s ease';
        buttonContainer.style.opacity = '0';
        
        setTimeout(() => {
            buttonContainer.style.display = 'none';
        }, 500);
    }
    
    //celebration
    yesBtn.textContent = "YAY! 💖🎉";
    yesBtn.style.animation = 'celebrate 1s ease-out';
    yesBtn.style.transform = 'scale(2.5)';
    yesBtn.style.background = 'linear-gradient(45deg, #ff4081, #ff80ab)';
    
    noBtn.style.opacity = '0';
    noBtn.style.transition = 'opacity 0.5s ease';
    
    createHeartExplosion(15);
    
    setTimeout(() => {
        const victory = document.createElement('div');
        victory.textContent = "Best Valentine's Ever! 💘";
        victory.className = 'victory-message';

        const valentineText = document.querySelector('.valentine-text');
        if (valentineText && valentineText.parentNode) {
            valentineText.parentNode.insertBefore(victory, valentineText.nextSibling);
        }
    }, 800);
   
    buttonsActive = false;
   
    document.removeEventListener('mousemove', handleNoButtonDodge);
});

function createHeartExplosion(count) {
    const hearts = ['💖', '💗', '💓', '💞', '💕', '💘'];
    
    for (let i = 0; i < count; i++) {
        const heart = document.createElement('div');
        heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.position = 'fixed';
        heart.style.fontSize = (25 + Math.random() * 20) + 'px';
        heart.style.zIndex = '1000';
        heart.style.left = (yesBtn.getBoundingClientRect().left + 40) + 'px';
        heart.style.top = (yesBtn.getBoundingClientRect().top + 20) + 'px';
        document.body.appendChild(heart);
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 150;
        const duration = 1000 + Math.random() * 500;
        
        heart.animate([
            { 
                transform: 'translate(0, 0) scale(1) rotate(0deg)', 
                opacity: 1 
            },
            { 
                transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0) rotate(${360}deg)`, 
                opacity: 0 
            }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)'
        });
        
        setTimeout(() => heart.remove(), duration);
    }
}

noBtn.addEventListener('click', (e) => {
    if (!buttonsActive) return;
    e.preventDefault();
    const jumpX = (Math.random() - 0.5) * 200;
    const jumpY = (Math.random() - 0.5) * 200;
    noBtn.style.transform = `translate(${jumpX}px, ${jumpY}px)`;
});

function playDodgeSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(300 + Math.random() * 200, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.log("No sound support");
    }
}