
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: { // Evodefi theme configuration
    colors: {
      transparent:        'transparent',
      current:            'currentColor',
      black:              '#2b2c2e',      // Total black
      white:              '#ffffff',      // Total white
      'gray-medium':      '#a4a8b0',      // Gray — Medium
      'gray-ghost':       '#babdc1',      // Gray — Ghost button icon color
      'gray-disabled':    '#c7c8cb',      // Gray — Disabled Items
      'gray-light':       '#d6d8dd',      // Gray — Light
      'gray-stroke':      '#e2e4e9',      // Gray — Stroke
      'gray-dividers':    '#ebf0f5',      // Gray — Dividers
      'gray-hover':       '#f0f2f7',      // Gray — Hover, secondary
      'gray-hover-main':  '#f8f9fb',      // Gray — BG, hover
      'highlight':        '#fff5dc',      // Light Yellow
      'info':             '#f4f3fe',      // Light Yellow
      'accent':           '#415eff',      // Main accent
      'attention':        '#ff6b74',      // Attention
      'coins-btc':        '#dab226',      // Coins - Bitcoin
    },
    backgroundImage: {
      'grad-main': 'linear-gradient(247.82deg, #5872ff 35.52%, #a258ff 161.03%)', // Main Gradient
      'grad-second': 'linear-gradient(233.45deg, #D389A8 0.01%, #9687F0 78.71%)', // Secondary Gradient
    },
    fontFamily: {
      euclid: ['Euclid Circular', 'Arial', 'sans-serif'],
    }
  },
  plugins: [
  ]
};
