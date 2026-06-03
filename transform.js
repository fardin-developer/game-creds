const fs = require('fs');
const path = './app/components/TopUpPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Theme Colors
// primary: '#E7121B'
// primaryDark: '#C21011'
// secondary: '#FFFFFF'
// secondarySoft: '#EFEBF0'
// text: '#010102'

// 1. Backgrounds
content = content.replace(/backgroundColor: '#232426'/g, "backgroundColor: '#EFEBF0'");
content = content.replace(/background: 'linear-gradient\(180deg, rgba\(127, 140, 170, 0\.3\) 0%, transparent 100%\)'/g, "background: 'linear-gradient(180deg, rgba(231, 18, 27, 0.15) 0%, transparent 100%)'");
content = content.replace(/linear-gradient\(90deg, #7F8CAA 0%, #5C667C 100%\)/g, "linear-gradient(90deg, #E7121B 0%, #C21011 100%)");
content = content.replace(/linear-gradient\(135deg, #7F8CAA 0%, #5C667C 100%\)/g, "linear-gradient(135deg, #E7121B 0%, #C21011 100%)");
content = content.replace(/linear-gradient\(90deg, #363B48 0%, #333844 100%\)/g, "linear-gradient(90deg, #FFFFFF 0%, #F8F9FA 100%)"); // Validated Info box
content = content.replace(/rgb\(35, 36, 38\)/g, "'#FFFFFF'"); // Modal background
content = content.replace(/#7F8CAA/g, "#E7121B");
content = content.replace(/#9FB0D6/g, "#EFEBF0");

// 2. Select Diamond Pack Section
content = content.replace(/<h2 className="text-white font-bold text-base sm:text-lg mb-4">Select Diamond Pack<\/h2>/g, '<h2 className="text-[#010102] font-bold text-base sm:text-lg mb-4">Select Diamond Pack</h2>');

// Category Buttons
content = content.replace(/linear-gradient\(135deg, rgb\(127, 140, 170\) 0%, rgb\(92, 102, 124\) 100%\)/g, "linear-gradient(135deg, #E7121B 0%, #C21011 100%)");
content = content.replace(/linear-gradient\(135deg, rgb\(35, 36, 38\) 0%, rgb\(54, 59, 72\) 100%\)/g, "linear-gradient(135deg, #FFFFFF 0%, #EFEBF0 100%)");
content = content.replace(/2px solid rgb\(127, 140, 170\)/g, "2px solid #E7121B");
content = content.replace(/2px solid rgb\(75, 85, 99\)/g, "2px solid #EFEBF0");

// For unselected category text, it might need to be dark, but currently it's just 'text-white'. Let's change the text-white on category text depending on isSelected.
content = content.replace(/className="text-white font-bold text-xs leading-tight break-words"/g, 'className={`${isSelected ? "text-white" : "text-[#010102]"} font-bold text-xs leading-tight break-words`}');

// Diamond Pack Cards
content = content.replace(/linear-gradient\(90deg, rgb\(127, 140, 170\) 0%, rgb\(51, 56, 68\) 100%\)/g, "'#FFFFFF'");
content = content.replace(/linear-gradient\(90deg, rgb\(54, 59, 72\) 0%, rgb\(51, 56, 68\) 100%\)/g, "'#EFEBF0'");
// Fix text inside diamond pack cards
content = content.replace(/<h3 className="text-white mb-1" style=\{\{/g, '<h3 className="text-[#010102] mb-1" style={{');
content = content.replace(/<p className="text-gray-300" style=\{\{ fontSize: '10px' \}\}>/g, '<p className="text-[#E7121B] font-bold" style={{ fontSize: \'10px\' }}>');

// Main page text that needs to be dark
content = content.replace(/<p className="text-white text-lg">Loading/g, '<p className="text-[#010102] text-lg">Loading');
content = content.replace(/<p className="text-white text-lg">Game not/g, '<p className="text-[#010102] text-lg">Game not');
content = content.replace(/text-gray-300 text-xs space-y-1/g, 'text-gray-700 text-xs space-y-1');
content = content.replace(/text-gray-300 text-xs space-y-2/g, 'text-gray-700 text-xs space-y-2');
content = content.replace(/text-white font-semibold text-xs mb-1/g, 'text-[#E7121B] font-semibold text-xs mb-1');
content = content.replace(/<span className="text-white font-mono text-sm">/g, '<span className="text-[#010102] font-mono text-sm">');
content = content.replace(/<span className="text-gray-300 text-sm">/g, '<span className="text-gray-600 text-sm">');

// Modals text
content = content.replace(/text-center font-bold text-xl text-white/g, 'text-center font-bold text-xl text-[#010102]');
content = content.replace(/text-gray-400 text-sm mb-6/g, 'text-gray-600 text-sm mb-6');

// Validated Info inside card (it was dark #363B48, now white)
content = content.replace(/className="mt-4 p-4 text-white"/g, 'className="mt-4 p-4 text-[#010102]"');

// Checkout Popup backgrounds and text
content = content.replace(/background: 'linear-gradient\(90deg, #E7121B 0%, #333844 100%\)'/g, "background: '#FFFFFF'"); // Previously #7F8CAA to #333844, now #7F8CAA is #E7121B. Wait, the original was `linear-gradient(90deg, #7F8CAA 0%, #333844 100%)`. I already replaced #7F8CAA with #E7121B.
content = content.replace(/linear-gradient\(90deg, #E7121B 0%, #333844 100%\)/g, "'#FFFFFF'");

// Input fields and borders
content = content.replace(/backgroundColor: '#D9D9D9'/g, "backgroundColor: '#FFFFFF', border: '1px solid #EFEBF0', color: '#010102'");
content = content.replace(/border: isSelected \? '2px solid #E7121B' : '2px solid #EFEBF0'/g, "border: isSelected ? '2px solid #E7121B' : '2px solid #EFEBF0'"); // already handled above

// Buttons
content = content.replace(/bg-blue-500/g, "bg-[#E7121B]");
content = content.replace(/text-blue-400/g, "text-[#E7121B]");

// "No, Enter Manually" button
content = content.replace(/className="w-full py-3\.5 rounded-2xl text-gray-300/g, 'className="w-full py-3.5 rounded-2xl text-gray-700');

// Mobile Legends Note text updates
content = content.replace(/text-green-300/g, "text-[#E7121B] font-bold");

// Update color logic inside style objects
content = content.replace(/backgroundColor: highlightButton \? '#ef4444' : \(invalidFields\.length > 0 \? '#ef4444' : '#FFFFFF'\)/g, "backgroundColor: highlightButton ? '#E7121B' : (invalidFields.length > 0 ? '#ef4444' : '#E7121B')");
content = content.replace(/'rgb\(35, 36, 38\)'/g, "'#FFFFFF'");

// Fix border in Checkout Method (Selected)
content = content.replace(/border: selectedPaymentMethod === 'zoro-coins' \? '3px solid white' : 'none'/g, "border: selectedPaymentMethod === 'zoro-coins' ? '3px solid #E7121B' : '1px solid #EFEBF0'");
content = content.replace(/border: selectedPaymentMethod === 'upi' \? '3px solid white' : 'none'/g, "border: selectedPaymentMethod === 'upi' ? '3px solid #E7121B' : '1px solid #EFEBF0'");

// Fix text-white inside Checkout Methods
// Checkout popup uses text-white extensively
content = content.replace(/className="text-white text-sm" style=\{\{ fontFamily: 'Poppins'/g, 'className="text-[#010102] text-sm" style={{ fontFamily: \'Poppins\'');

// Save changes
fs.writeFileSync(path, content, 'utf8');
console.log('Done replacing strings.');
