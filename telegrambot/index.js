const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const SecureFIR = require('./contractConfig.js'); // contract instance of SecureFIRSystem

const TOKEN = process.env.BOT_TOKEN;
const DATA_FILE = path.join(__dirname, 'user_data.json');

let phoneChatMap = {};

// Load existing data if available
if (fs.existsSync(DATA_FILE)) {
  try {
    phoneChatMap = JSON.parse(fs.readFileSync(DATA_FILE));
  } catch (err) {
    console.error('Error reading user_data.json:', err);
  }
}

// Save user data function
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(phoneChatMap, null, 2));
}

// Initialize the bot
const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Please share your mobile number to continue.', {
    reply_markup: {
      keyboard: [[{ text: 'Share Contact 📱', request_contact: true }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
});

// Handles both Contact Sharing & Manual Number Entry
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // If the message contains a contact
  if (msg.contact) {
    const phoneNumber = msg.contact.phone_number;
    registerUser(chatId, phoneNumber);
  } 
  // If user enters a phone number manually (10-15 digits)
  else if (/^\d{10,15}$/.test(msg.text)) {
    registerUser(chatId, msg.text);
  }
});

// Function to register user
function registerUser(chatId, phoneNumber) {
  if (!phoneChatMap[phoneNumber]) {
    phoneChatMap[phoneNumber] = chatId;
    saveData();
    bot.sendMessage(chatId, `✅ Thanks! Your number ${phoneNumber} has been registered.`);
  }

  bot.sendMessage(chatId, 'Choose an option:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📄 View Complaints', callback_data: 'view_complaint' }],
        [{ text: '📝 File Complaint', callback_data: 'file_complaint' }]
      ],
    },
  });
}

// Handles user actions (View or File Complaints)
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const phoneNumber = Object.keys(phoneChatMap).find(key => phoneChatMap[key] === chatId);

  if (!phoneNumber) return bot.sendMessage(chatId, '❌ Phone number not found.');

  if (data === 'view_complaint') {
    try {
      const result = await SecureFIR.getComplaints(phoneNumber);
      if (result.length === 0) return bot.sendMessage(chatId, 'No complaints found.');

      const formatted = result.map((comp, index) => 
        `🧾 Complaint ${index + 1}\n👮 Police: ${comp.policeWallet}\n🕒 Time: ${new Date(comp.timestamp * 1000).toLocaleString()}\n📌 Details: ${comp.details}`
      ).join('\n\n---\n\n');

      bot.sendMessage(chatId, `Your complaints:\n\n${formatted}`);
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, '❌ Error fetching complaints.');
    }
  }

  if (data === 'file_complaint') {
    bot.sendMessage(chatId, '📝 Please send your complaint in this format:\n\n`<Your Complaint>`', {
      parse_mode: 'Markdown'
    });

    bot.once('message', async (msg) => {
      const complaintText = msg.text;
      try {
        const tx = await SecureFIR.fileComplaint(phoneNumber, complaintText);
        await tx.wait();
        bot.sendMessage(chatId, '✅ Complaint filed successfully on the blockchain!');
      } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, '❌ Error filing complaint.');
      }
    });
  }

  bot.answerCallbackQuery(query.id);
});

console.log('🤖 Telegram bot is running...');
// const TelegramBot = require('node-telegram-bot-api');
// const fs = require('fs');
// const path = require('path');
// require('dotenv').config();
// const SecureFIR = require('./contractConfig.js'); // Blockchain contract instance
// console.log(SecureFIR); // Check what is inside SecureFIR
// console.log(typeof SecureFIR.getComplaints); // Should be "function"
// console.log(typeof SecureFIR.fileComplaint); // Should be "function"

// const TOKEN = process.env.BOT_TOKEN;
// const DATA_FILE = path.join(__dirname, 'user_data.json');

// let phoneChatMap = {};

// // Load existing user data
// if (fs.existsSync(DATA_FILE)) {
//   try {
//     phoneChatMap = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
//     console.log('✅ Loaded user data:', phoneChatMap);
//   } catch (err) {
//     console.error('❌ Error reading user_data.json:', err);
//   }
// }

// // Function to save user data
// function saveData() {
//   try {
//     fs.writeFileSync(DATA_FILE, JSON.stringify(phoneChatMap, null, 2));
//     console.log('💾 User data saved');
//   } catch (err) {
//     console.error('❌ Error saving user data:', err);
//   }
// }

// // Initialize Telegram Bot
// const bot = new TelegramBot(TOKEN, { polling: true });
// console.log('🤖 Telegram bot started...');

// // Global error handler
// process.on('unhandledRejection', (reason, promise) => {
//   console.error('🔥 Unhandled Rejection:', reason);
// });

// // Start command
// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   console.log(`📲 /start command received from chatId: ${chatId}`);

//   bot.sendMessage(chatId, 'Please share your mobile number to continue.', {
//     reply_markup: {
//       keyboard: [[{ text: '📱 Share Contact', request_contact: true }]],
//       resize_keyboard: true,
//       one_time_keyboard: true,
//     },
//   });
// });

// // Handle contact sharing
// bot.on('contact', async (msg) => {
//   const chatId = msg.chat.id;
//   console.log('📞 Contact received:', msg);

//   const phoneNumber = msg.contact?.phone_number;

//   if (!phoneNumber) {
//     bot.sendMessage(chatId, '⚠ Could not read your phone number. Please try again.');
//     console.log('⚠ Missing phone number in contact');
//     return;
//   }

//   // Register user in the blockchain if not already registered
//   if (!phoneChatMap[phoneNumber]) {
//     try {
//       console.log(`🔄 Registering user ${phoneNumber} in blockchain...`);
//       await SecureFIR.registerUser(phoneNumber);
//       console.log(`✅ Blockchain registration successful for ${phoneNumber}`);

//       phoneChatMap[phoneNumber] = chatId;
//       saveData();
//     } catch (err) {
//       console.error(`❌ Blockchain registration error for ${phoneNumber}:`, err);
//       return bot.sendMessage(chatId, '❌ Error registering. Please try again later.');
//     }
//   } else {
//     console.log(`ℹ Phone number already registered: ${phoneNumber}`);
//   }

//   sendMainMenu(chatId);
// });

// // Function to send the main menu
// function sendMainMenu(chatId) {
//   bot.sendMessage(chatId, 'Choose an option:', {
//     reply_markup: {
//       inline_keyboard: [
//         [{ text: '📄 View Complaints', callback_data: 'view_complaint' }],
//         [{ text: '📝 File Complaint', callback_data: 'file_complaint' }],
//       ],
//     },
//   }).then(() => console.log('✅ Main menu sent'));
// }

// // Handle callback queries (View or File Complaints)
// bot.on('callback_query', async (query) => {
//   const chatId = query.message.chat.id;
//   const data = query.data;
//   const phoneNumber = Object.keys(phoneChatMap).find((key) => phoneChatMap[key] === chatId);

//   console.log(`➡ Callback: ${data} from chatId ${chatId} (phone: ${phoneNumber})`);

//   if (!phoneNumber) {
//     bot.sendMessage(chatId, '⚠ Phone number not found. Please restart with /start.');
//     return;
//   }

//   if (data === 'view_complaint') {
//     await handleViewComplaints(chatId, phoneNumber);
//   }

//   if (data === 'file_complaint') {
//     await handleFileComplaint(chatId, phoneNumber);
//   }

//   bot.answerCallbackQuery(query.id);
// });

// // Function to handle viewing complaints
// async function handleViewComplaints(chatId, phoneNumber) {
//   try {
//     console.log(`📡 Fetching complaints for ${phoneNumber}...`);
//     const result = await SecureFIR.getComplaints(phoneNumber);

//     if (!result || result.length === 0) {
//       console.log(`ℹ No complaints found for ${phoneNumber}`);
//       return bot.sendMessage(chatId, '📭 No complaints found.');
//     }

//     const formatted = result
//       .map(
//         (comp, index) =>
//           `🧾 Complaint ${index + 1}\n👮 Police: ${comp.policeWallet}\n🕒 Time: ${new Date(
//             comp.timestamp * 1000
//           ).toLocaleString()}\n📝 Details: ${comp.details}`
//       )
//       .join('\n\n---\n\n');

//     bot.sendMessage(chatId, `🗂 Your complaints:\n\n${formatted}`);
//   } catch (err) {
//     console.error(`❌ Error fetching complaints for ${phoneNumber}:`, err);
//     bot.sendMessage(chatId, '❌ Error fetching complaints.');
//   }
// }

// // Function to handle filing complaints
// const complaintHistory = new Map(); // Track last complaints to prevent duplicates

// async function handleFileComplaint(chatId, phoneNumber) {
//   bot.sendMessage(chatId, '📥 Please send your complaint as a text message.', {
//     parse_mode: 'Markdown',
//   });

//   bot.once('message', async (msg) => {
//     const complaintText = msg.text.trim();

//     if (!complaintText) {
//       return bot.sendMessage(chatId, '⚠ Complaint cannot be empty.');
//     }

//     // Prevent duplicate complaints
//     if (complaintHistory.get(phoneNumber) === complaintText) {
//       console.log(`⚠ Duplicate complaint detected for ${phoneNumber}`);
//       return bot.sendMessage(chatId, '⚠ This complaint has already been filed.');
//     }

//     try {
//       console.log(`📡 Filing complaint for ${phoneNumber}: "${complaintText}"`);
//       const tx = await SecureFIR.fileComplaint(phoneNumber, complaintText);
//       console.log(`⏳ Transaction hash: ${tx.hash}`);
//       await tx.wait();
//       console.log(`✅ Complaint successfully filed for ${phoneNumber}`);

//       complaintHistory.set(phoneNumber, complaintText); // Save last complaint
//       bot.sendMessage(chatId, '✅ Complaint filed successfully on the blockchain!');
//     } catch (err) {
//       console.error(`❌ Error filing complaint for ${phoneNumber}:`, err);
//       bot.sendMessage(chatId, '❌ Error filing complaint. Please try again.');
//     }
//   });
// }

// console.log('🚀 Telegram bot is running...');
