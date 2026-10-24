import { MadeWithDyad } from "@/components/made-with-dyad";
import { useState, useEffect, useRef } from "react";
import React from "react";

// =====================
// JESUS QUOTES LIBRARY
// =====================
const peaceQuotes = [
  '"The peace I give is not as the world gives." — John 14:27',
  '"Cast all your anxiety on him because he cares for you." — 1 Peter 5:7',
  '"May the Lord of peace himself give you peace at all times." — 2 Thessalonians 3:16',
  '"In peace I will lie down and sleep, for you alone, Lord, make me dwell in safety." — Psalm 4:8',
  '"Let the peace of Christ rule in your hearts." — Colossians 3:15',
];

const strengthQuotes = [
  '"I can do all this through him who gives me strength." — Philippians 4:13',
  '"Be strong and courageous. Do not be afraid... for the Lord your God will be with you." — Deuteronomy 31:6',
  '"The Lord is my strength and my shield; my heart trusts in him." — Psalm 28:7',
  '"He gives power to the faint; and to him who has no might he increases strength." — Isaiah 40:29',
  '"Be of good courage, and he shall strengthen your heart." — Psalm 31:24',
];

const loveQuotes = [
  '"Love is patient, love is kind." — 1 Corinthians 13:4',
  '"We love because he first loved us." — 1 John 4:19',
  '"Above all, love one another deeply." — 1 Peter 4:8',
  '"Let all that you do be done with love." — 1 Corinthians 16:14',
  '"This is my command: Love each other." — John 15:17',
];

const allQuotes = [...peaceQuotes, ...strengthQuotes, ...loveQuotes];

// =====================
// TYPES
// =====================
interface Particle {
  x: number;
  y: number;
  type: string;
  size: number;
  color: string;
  velocity: { x: number; y: number };
  life: number;
  endScale: number;
  currentLife: number;
}

// =====================
// PARTICLE ENGINE
// =====================
const particleEngine = {
  particles: [] as Particle[],
  canvas: null as HTMLCanvasElement | null,
  ctx: null as CanvasRenderingContext2D | null,
  animationId: null as number | null,
  isRunning: false,
  lastTimestamp: 0,

  init() {
    if (this.canvas) return;
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1';
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.isRunning = true;
    this.animate();
  },

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  createParticle(x: number, y: number) {
    const types = ['✨', '🤍', '•', '✦'];
    const type = types[Math.floor(Math.random() * types.length)];
    const size = Math.random() * 3 + 1;
    const color = ['#FFD1E0', '#FFB6C1', '#FF6B9D', '#FF8C42'][Math.floor(Math.random() * 4)];
    const velocity = {
      x: (Math.random() - 0.5) * 6,
      y: (Math.random() - 0.5) * 6 - 2,
    };
    const life = Math.random() * 800 + 500;
    const endScale = Math.random() * 0.5 + 0.2;
    return { x, y, type, size, color, velocity, life, endScale, currentLife: 0 };
  },

  spawnCluster(x: number, y: number) {
    for (let i = 0; i < 4; i++) {
      const p = this.createParticle(x, y);
      this.particles.push(p);
    }
  },

  updateParticles(delta: number) {
    this.particles = this.particles.filter(p => {
      p.currentLife += delta;
      if (p.currentLife >= p.life) return false;

      p.x += p.velocity.x * (delta / 16);
      p.y += p.velocity.y * (delta / 16);
      p.velocity.y += 0.1;
      p.size *= p.endScale ** (delta / p.life);

      this.ctx!.fillStyle = p.color;
      this.ctx!.font = `${Math.max(1, p.size)}px system-ui`;
      this.ctx!.fillText(p.type, p.x, p.y);

      return true;
    });
  },

  animate(timestamp: number) {
    if (!this.ctx || !this.isRunning) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.updateParticles(timestamp - (this.lastTimestamp || timestamp));
    this.lastTimestamp = timestamp;
    this.animationId = requestAnimationFrame((t) => this.animate(t));
  },

  start() {
    this.init();
    this.lastTimestamp = performance.now();
    this.animate();
  },

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isRunning = false;
    if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.particles = [];
    this.ctx = null;
    this.canvas = null;
  },
};

// =====================
// QUOTE CARD COMPONENT
// =====================
interface QuoteCardProps {
  quote: string;
  category: string;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quote, category }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative border rounded-3xl border-gray-200 bg-white/80 backdrop-blur-md shadow-2xl shadow-gray-200/30 transition-all duration-500 hover:translate-y-2 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <p className="text-center text-sm text-gray-600 capitalize">{category}</p>
      <p className="text-xl mt-4 font-medium text-cocoa truncate">{quote}</p>
    </div>
  );
};

// =====================
// MAIN PAGE COMPONENT
// =====================
const JesusQuotesPage = () => {
  const [currentQuote, setCurrentQuote] = useState(allQuotes[0]);
  const [visibleQuote, setVisibleQuote] = useState(allQuotes[0]);
  const [showNewQuote, setShowNewQuote] = useState(false);
  const [category, setCategory] = useState<'peace' | 'strength' | 'love' | 'all'>('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const particlesRef = useRef<typeof particleEngine>(particleEngine);

  // Initialize particle engine on mount
  useEffect(() => {
    particlesRef.current.init();
    return () => particlesRef.current.stop();
  }, []);

  // Generate new quote
  const generateNewQuote = () => {
    setVisibleQuote(currentQuote);
    setShowNewQuote(true);

    // Select new quote based on category
    let newQuote: string;
    if (category === 'peace') {
      newQuote = peaceQuotes[Math.floor(Math.random() * peaceQuotes.length)];
    } else if (category === 'strength') {
      newQuote = strengthQuotes[Math.floor(Math.random() * strengthQuotes.length)];
    } else if (category === 'love') {
      newQuote = loveQuotes[Math.floor(Math.random() * loveQuotes.length)];
    } else {
      newQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
    }
    setCurrentQuote(newQuote);

    // Trigger sparkles from center
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    particlesRef.current.spawnCluster(centerX, centerY);

    // Animate transition
    setTimeout(() => {
      setShowNewQuote(false);
    }, 1200);
  };

  // Handle clicks on canvas
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      particlesRef.current.spawnCluster(e.clientX, e.clientY);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Lofi music toggle
  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  // Generate initial quote
  useEffect(() => {
    setCurrentQuote(allQuotes[Math.floor(Math.random() * allQuotes.length)]);
    setVisibleQuote(allQuotes[Math.floor(Math.random() * allQuotes.length)]);
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gradient-to-b from-[#E8D7FF] via-[#FFD6E0] to-[#FFFDF9]">
      {/* Particle Canvas */}
      {particlesRef.current.canvas && particlesRef.current.isRunning && (
        <canvas ref={particlesRef.current.canvas} />
      )}

      {/* Master Blessing Oracle - Main Focus Card */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center py-12 px-4">
        {/* Hero Welcome Section */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-cocoa tracking-tight mb-2 font-display">
            Words of Life
          </h1>
          <p className="text-2xl md:text-3xl text-gray-400 text-opacity-80 max-w-xl mx-auto font-body">
            Rest a while, and listen to Him.
          </p>
        </header>

        {/* Master Blessing Oracle Card */}
        <div className="relative w-full max-w-3xl mx-auto bg-white/80 backdrop-blur-xl border-2 border-white/30 rounded-3xl shadow-2xl shadow-gray-300/20 p-8 md:p-12 transition-all duration-700 ease-out group">
          {/* Current Quote Display */}
          <div
            key={currentQuote}
            className={`transition-all duration-700 ease-out ${
              showNewQuote ? 'animate-quote-dissolve' : 'animate-quote-cascade-in'
            }`}
          >
            <QuoteCard quote={currentQuote} category="Blessing" />
          </div>
          
          {/* Glowing Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={generateNewQuote}
              className="group relative rounded-full bg-gradient-to-r from-pink-400 to-purple-300 px-12 py-4 text-xl font-bold text-white shadow-lg shadow-pink-400/30 hover:shadow-2xl hover:shadow-pink-400/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 animate-button-glow"
              aria-label="Receive a new word from Jesus"
            >
              Receive a Word ✨
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-12 flex gap-2 justify-center px-4 flex-wrap">
          <button
            onClick={() => setCategory('peace')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
              category === 'peace'
                ? 'bg-purple-100 text-purple-600 border border-purple-200 shadow-sm'
                : 'bg-white/60 text-gray-400 border border-gray-200 hover:border-gray-300 hover:text-gray-600'
            }`}
          >
            Peace 🕊️
          </button>
          <button
            onClick={() => setCategory('strength')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
              category === 'strength'
                ? 'bg-pink-100 text-pink-600 border border-pink-200 shadow-sm'
                : 'bg-white/60 text-gray-400 border border-gray-200 hover:border-gray-300 hover:text-gray-600'
            }`}
          >
            Strength 💪
          </button>
          <button
            onClick={() => setCategory('love')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
              category === 'love'
                ? 'bg-rose-100 text-rose-600 border border-rose-200 shadow-sm'
                : 'bg-white/60 text-gray-400 border border-gray-200 hover:border-gray-300 hover:text-gray-600'
            }`}
          >
            Love 💖
          </button>
          <button
                      onClick={() => setCategory('all')}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                        category === 'all'
                          ? 'bg-pastel-cream text-cocoa-dark border border-pastel-cream shadow-sm'
                          : 'bg-white/60 text-gray-400 border border-gray-200 hover:border-gray-300 hover:text-gray-600'
                      }`}
                    >
                      All
                    </button>
        </div>
      </main>

      {/* Categorized Wisdom Grid */}
      <section className="mt-20 w-full max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {category === 'all' ? allQuotes : 
          category === 'peace' ? peaceQuotes 
          : category === 'strength' ? strengthQuotes 
          : loveQuotes
        }.map((quote, index) => (
          <QuoteCard
            key={index}
            quote={quote}
            category={category === 'all' ? 'All Moods' : category}
          />
        ))}
      </section>

      {/* Lofi Ambient Widget - Floating in corner */}
      <div className="fixed bottom-8 right-8 flex items-center gap-2 pointer-events-none">
        <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 backdrop-blur-md border border-white/30 shadow-lg shadow-purple-300/20">
          <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-500 group-hover:rotate-6 transition-transform duration-500" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <span className="text-sm text-gray-400 ml-2 font-medium">{isPlaying ? 'Pause' : 'Play'}</span>
      </div>

      {/* Made with Dyad */}
      <div className="fixed bottom-4 left-4 z-10">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default JesusQuotesPage;
