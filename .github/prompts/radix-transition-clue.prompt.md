# Radix UI Wave Transition Effects: Technical Implementation Guide

Radix UI itself **does not include built-in wave-like transition effects** for theme switching. However, the framework's CSS-first architecture and excellent third-party library integration make it an ideal foundation for implementing sophisticated wave animations using modern CSS techniques and JavaScript libraries.

## Radix UI's theme system approach

Radix UI employs a **CSS-first methodology** for theme transitions, relying on CSS variables and class-based switching rather than complex JavaScript animations. The system uses semantic color tokens like `--accent-1` through `--accent-12` that automatically update based on parent class changes (`.dark` or `.light`).

The framework integrates seamlessly with `next-themes` for automatic theme switching and provides excellent hooks for animation libraries like Framer Motion and React Spring. While Radix UI includes some built-in animations (accordion expand/collapse, spinner rotations), these focus on functional transitions rather than decorative wave effects.

## CSS wave animation techniques

Modern CSS provides several powerful methods for creating wave-like transitions that can be integrated with Radix UI's theme system.

### Radial gradient ripple effects

The most effective approach uses radial gradients to create expanding circle animations from the theme toggle button:

```css
.theme-toggle {
  position: relative;
  overflow: hidden;
}

.theme-toggle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, var(--theme-bg) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1), height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-switching .theme-toggle::before {
  width: 300px;
  height: 300px;
}
```

### CSS mask-based wave animations

For more complex wave patterns, CSS masks create sophisticated flowing effects:

```css
.wave-transition {
  --wave-size: 50px;
  mask: radial-gradient(var(--wave-size) at 50% 0%, transparent 99%, red 101%) 
        50% var(--wave-size)/calc(4 * var(--wave-size)) 100% repeat-x;
  animation: wave-flow 2s ease-in-out infinite;
}

@keyframes wave-flow {
  0% { mask-position: 0% 0%; }
  100% { mask-position: 100% 0%; }
}
```

### Advanced clip-path implementations

Clip-path animations create organic wave shapes with precise control:

```css
.wave-clippath {
  clip-path: polygon(0% 0%, 0% 82.5%, 1.69% 84.3%, 5.08% 87.9%, 
                     10.17% 92.78%, 15.25% 96.66%, 20.34% 99.14%, 
                     25.42% 100%, 30.51% 99.14%, 35.59% 96.66%);
  animation: wave-clip 3s ease-in-out infinite;
}
```

## JavaScript library integration

Several JavaScript libraries excel at creating wave-like theme transitions that integrate well with Radix UI.

### View Transitions API implementation

The **View Transitions API** represents the most modern approach, providing native browser support for smooth theme transitions:

```javascript
const toggleTheme = () => {
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      document.documentElement.classList.toggle('dark');
    });
  } else {
    document.documentElement.classList.toggle('dark');
  }
};
```

### Framer Motion integration

Framer Motion provides excellent integration with Radix UI components for complex wave animations:

```jsx
import * as Switch from '@radix-ui/react-switch';
import { motion } from 'framer-motion';

const ThemeSwitch = () => (
  <Switch.Root asChild>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Switch.Thumb asChild>
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
        />
      </Switch.Thumb>
    </motion.button>
  </Switch.Root>
);
```

### GSAP for complex animations

GSAP provides industry-standard animation capabilities with precise control over wave timing and easing:

```javascript
const createWaveTransition = (element, isDark) => {
  const tl = gsap.timeline();
  
  tl.to(element, {
    duration: 0.8,
    backgroundColor: isDark ? '#000' : '#fff',
    ease: "power2.inOut"
  })
  .to('.wave-overlay', {
    duration: 1.2,
    scale: 3,
    opacity: 0,
    ease: "circ.out"
  }, 0);
};
```

## Production-ready implementation

For a complete wave transition system with Radix UI, combine CSS variables with JavaScript coordination:

```css
:root {
  --theme-bg: #ffffff;
  --theme-text: #000000;
  --wave-color: #2196f3;
  --transition-duration: 0.6s;
}

.theme-dark {
  --theme-bg: #121212;
  --theme-text: #ffffff;
  --wave-color: #bb86fc;
}

.wave-container {
  position: relative;
  background: var(--theme-bg);
  color: var(--theme-text);
  transition: background-color var(--transition-duration) ease,
              color var(--transition-duration) ease;
}

.wave-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--wave-color);
  border-radius: 50%;
  transform: scale(0);
  transition: transform var(--transition-duration) cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  z-index: 9999;
}

.wave-overlay.active {
  transform: scale(3);
}
```

The corresponding JavaScript creates coordinated wave animations:

```javascript
function createWaveTransition(clickX, clickY) {
  const wave = document.createElement('div');
  wave.className = 'wave-overlay';
  
  const size = Math.max(window.innerWidth, window.innerHeight) * 2;
  wave.style.width = wave.style.height = size + 'px';
  wave.style.left = (clickX - size / 2) + 'px';
  wave.style.top = (clickY - size / 2) + 'px';
  
  document.body.appendChild(wave);
  
  requestAnimationFrame(() => {
    wave.classList.add('active');
  });
  
  setTimeout(() => {
    wave.remove();
  }, 600);
}
```

## Performance and accessibility considerations

Modern wave transitions must balance visual appeal with performance and accessibility. **Use `transform` and `opacity` properties** for hardware acceleration, and implement `prefers-reduced-motion` media queries:

```css
@media (prefers-reduced-motion: no-preference) {
  .wave-transition {
    transition: transform 0.6s ease, opacity 0.6s ease;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wave-transition {
    transition: background-color 0.3s ease, color 0.3s ease;
  }
}
```

## Conclusion

While Radix UI doesn't include built-in wave transition effects, its CSS-first architecture and excellent third-party integration make it an ideal foundation for implementing sophisticated wave animations. The combination of modern CSS techniques (radial gradients, masks, clip-path) with JavaScript libraries (View Transitions API, Framer Motion, GSAP) provides powerful tools for creating smooth, accessible theme transitions that enhance user experience while maintaining performance standards.

## Prompt

when changing theme, i wanted to implement theme transition animation like radix-ui does in their live examples, those effect will be like "wave" effect that start from the right to the left, the wave from right side is having the new theme whereas the left side is the unchanged theme, i hope u know what i meant

i've setup clue to help you implement this transition