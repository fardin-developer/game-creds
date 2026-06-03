const fs = require('fs');
const path = './app/components/TopUpPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace history items background gradients
content = content.replace(/rgba\(127, 140, 170, 0\.3\)/g, "rgba(231, 18, 27, 0.1)");
content = content.replace(/rgba\(92, 102, 124, 0\.3\)/g, "rgba(194, 16, 17, 0.1)");
content = content.replace(/rgba\(127, 140, 170, 0\.2\)/g, "rgba(231, 18, 27, 0.05)");
content = content.replace(/rgba\(92, 102, 124, 0\.2\)/g, "rgba(194, 16, 17, 0.05)");

// Replace hovers
content = content.replace(/hover:bg-gray-700/g, "hover:bg-gray-100");

// Let's also check for any remaining '#4F7CFF' (Blue buttons) -> '#E7121B'
content = content.replace(/#4F7CFF/g, "#E7121B");
content = content.replace(/#3B5FCC/g, "#C21011");
content = content.replace(/rgba\(79, 124, 255, 0\.3\)/g, "rgba(231, 18, 27, 0.3)");

fs.writeFileSync(path, content, 'utf8');
console.log('Done second pass.');
