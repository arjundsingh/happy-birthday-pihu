// Birthday Website for Pihu - Interactive Features
// Minimal vanilla JavaScript for animations, confetti, and music

// Global variables
let musicPlaying = false
let confettiAnimationId
const audio = document.getElementById("bg-music")
const musicBtn = document.getElementById("music-btn")
const canvas = document.getElementById("confetti-canvas")
const ctx = canvas.getContext("2d")

// Initialize the website
document.addEventListener("DOMContentLoaded", () => {
  initializeWebsite()
  setupEventListeners()
  setupIntersectionObserver()
  setupParallax()
  setCurrentDate()
})

// Initialize website features
function initializeWebsite() {
  // Set canvas size
  resizeCanvas()
  window.addEventListener("resize", resizeCanvas)

  // Setup audio
  if (audio) {
    audio.volume = 0.3 // Set gentle volume
    audio.addEventListener("loadstart", () => {
      console.log("Audio loading started")
    })
    audio.addEventListener("error", (e) => {
      console.log("Audio error:", e)
      // Hide music button if audio fails to load
      if (musicBtn) {
        musicBtn.style.display = "none"
      }
    })
  }

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Press 'M' to toggle music
    if (e.key.toLowerCase() === "m" && !e.ctrlKey && !e.altKey) {
      e.preventDefault()
      toggleMusic()
    }
    // Press 'Escape' to skip intro
    if (e.key === "Escape") {
      skipIntro()
    }
  })
}

// Setup event listeners
function setupEventListeners() {
  // Smooth scroll for navigation buttons
  document.querySelectorAll('[onclick*="scrollToSection"]').forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault()
      const sectionId = this.getAttribute("onclick").match(/'([^']+)'/)[1]
      scrollToSection(sectionId)
    })
  })
}

// Intersection Observer for reveal animations
function setupIntersectionObserver() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed")
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  // Observe all elements with data-reveal attribute
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    observer.observe(el)
  })
}

// Gentle parallax effect for floating hearts
function setupParallax() {
  let ticking = false

  function updateParallax() {
    const scrolled = window.pageYOffset
    const parallaxElements = document.querySelectorAll(".heart-float, .star-float")

    parallaxElements.forEach((el, index) => {
      const speed = 0.5 + index * 0.1 // Different speeds for each element
      const yPos = -(scrolled * speed)
      el.style.transform = `translateY(${yPos}px)`
    })

    ticking = false
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateParallax)
      ticking = true
    }
  }

  // Only add parallax if user hasn't requested reduced motion
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener("scroll", requestTick)
  }
}

// Skip intro animation
function skipIntro() {
  const loader = document.getElementById("intro-loader")
  const mainContent = document.getElementById("main-content")

  if (loader && mainContent) {
    loader.style.display = "none"
    mainContent.style.opacity = "1"
    mainContent.style.animation = "none"
  }
}

// Smooth scroll to section
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId)
  if (section) {
    const offsetTop = section.offsetTop - 80 // Account for any fixed headers

    // Use smooth scrolling
    window.scrollTo({
      top: offsetTop,
      behavior: "smooth",
    })
  }
}

// Toggle background music
function toggleMusic() {
  if (!audio) return

  if (musicPlaying) {
    audio.pause()
    musicPlaying = false
    updateMusicButton(false)
    showToast("Music paused 🎵")
  } else {
    // Try to play audio
    const playPromise = audio.play()

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          musicPlaying = true
          updateMusicButton(true)
          showToast("Music playing 🎶")
        })
        .catch((error) => {
          console.log("Audio play failed:", error)
          showToast("Unable to play music 😔")
        })
    }
  }
}

// Update music button appearance
function updateMusicButton(playing) {
  if (!musicBtn) return

  const musicIcon = musicBtn.querySelector(".music-icon")
  const musicText = musicBtn.querySelector(".music-text")

  if (playing) {
    musicIcon.textContent = "♫"
    musicText.textContent = "Pause Music"
    musicBtn.classList.add("playing")
  } else {
    musicIcon.textContent = "♪"
    musicText.textContent = "Play Music"
    musicBtn.classList.remove("playing")
  }
}

// Confetti system
function triggerConfetti() {
  showToast("Make a wish, Pihu! ✨")
  createConfetti()

  // Add some extra sparkle to the wish button
  const wishButton = document.querySelector(".wish-button")
  if (wishButton) {
    wishButton.style.animation = "heartbeat 0.6s ease-in-out 3"
    setTimeout(() => {
      wishButton.style.animation = "heartbeat 1.5s ease-in-out infinite"
    }, 1800)
  }
}

// Create confetti animation
function createConfetti() {
  const particles = []
  const colors = ["#FF7EB6", "#FFD1DC", "#B3E5FC", "#F7C948", "#FFF7F0"]
  const particleCount = window.innerWidth < 768 ? 50 : 100 // Fewer particles on mobile

  // Create particles
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -10,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 4 + 2,
      life: 1,
      decay: Math.random() * 0.02 + 0.01,
    })
  }

  // Animation loop
  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]

      // Update particle
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.1 // Gravity
      p.life -= p.decay

      // Draw particle
      ctx.save()
      ctx.globalAlpha = p.life
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Remove dead particles
      if (p.life <= 0 || p.y > canvas.height) {
        particles.splice(i, 1)
      }
    }

    // Continue animation if particles exist
    if (particles.length > 0) {
      confettiAnimationId = requestAnimationFrame(animateConfetti)
    }
  }

  // Start animation
  animateConfetti()
}

// Resize canvas to match window size
function resizeCanvas() {
  if (canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
}

// Show toast notification
function showToast(message) {
  const toast = document.getElementById("toast")
  if (!toast) return

  toast.textContent = message
  toast.classList.add("show")

  // Hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show")
  }, 3000)
}

// Set current date in footer
function setCurrentDate() {
  const dateElement = document.getElementById("current-date")
  if (dateElement) {
    const now = new Date()
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    dateElement.textContent = now.toLocaleDateString("en-US", options)
  }
}

// Utility function for smooth animations
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

// Handle visibility change (pause music when tab is hidden)
document.addEventListener("visibilitychange", () => {
  if (document.hidden && musicPlaying && audio) {
    audio.pause()
    updateMusicButton(false)
    musicPlaying = false
  }
})

// Cleanup function
window.addEventListener("beforeunload", () => {
  if (confettiAnimationId) {
    cancelAnimationFrame(confettiAnimationId)
  }
  if (audio && musicPlaying) {
    audio.pause()
  }
})

// Export functions for inline event handlers (if needed)
window.skipIntro = skipIntro
window.scrollToSection = scrollToSection
window.toggleMusic = toggleMusic
window.triggerConfetti = triggerConfetti

// Console message for Arjun
console.log(`
🎂 Happy Birthday Website for Pihu! 🎂
Made with love by Arjun

To customize:
1. Replace photos in /assets/images/ (pihu-01.jpg to pihu-10.jpg)
2. Add your music file to /assets/audio/bg-melody.mp3
3. Edit colors in styles.css :root variables
4. Update timeline memories in HTML

Press 'M' to toggle music
Press 'Escape' to skip intro

With love,
Your Birthday Website ❤️
`)

const carousel = document.querySelector(".photo-carousel");
const prevBtn = document.querySelector(".carousel-btn.prev");
const nextBtn = document.querySelector(".carousel-btn.next");

nextBtn.addEventListener("click", () => {
  carousel.scrollBy({ left: 300, behavior: "smooth" });
});

prevBtn.addEventListener("click", () => {
  carousel.scrollBy({ left: -300, behavior: "smooth" });
});
  