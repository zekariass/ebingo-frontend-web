// import { Telegraf, Markup } from 'telegraf';
// import axios from 'axios';
// import dotenv from 'dotenv';
// import path from 'path';
// import { Room } from '../lib/types';

// dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// if (!process.env.BOT_TOKEN) throw new Error('BOT_TOKEN missing');
// if (!process.env.BACKEND_BASE_URL) throw new Error('BACKEND_BASE_URL missing');
// if (!process.env.APP_URL) throw new Error('APP_URL missing');

// const API_BASE_URL = process.env.BACKEND_BASE_URL;
// const APP_URL = process.env.APP_URL;
// const ROOMS_PER_PAGE = 6;

// const bot = new Telegraf(process.env.BOT_TOKEN);

// // ------------------ Footer Keyboard ------------------
// function getFooterKeyboard() {
//   return Markup.keyboard([
//     ['🎲 Game Rooms', '🎮 Start Game'],
//     ['💰 Deposit Fund', '🔁 Transfer Fund'],
//     ['💸 Withdraw Money', '📖 Instructions'],
//     ['🧑‍💻 Support']
//   ]).resize().oneTime(false);
// }

// // ------------------ Function to fetch & show rooms ------------------
// async function showRooms(ctx: any, page = 1) {
//   try {
//     const response = await axios.get<{ data: Room[] }>(`${API_BASE_URL}/api/v1/public/rooms`);
//     const rooms = response.data.data;

//     if (!rooms || rooms.length === 0) {
//       await ctx.reply('❌ No rooms available right now.');
//       return;
//     }

//     const startIdx = (page - 1) * ROOMS_PER_PAGE;
//     const pagedRooms = rooms.slice(startIdx, startIdx + ROOMS_PER_PAGE);

//     // Flat array of room buttons
//     const roomButtons = pagedRooms.map(room =>
//       Markup.button.url(`${room.name} (${room.entryFee})`, `${APP_URL}/en/rooms/${room.id}`)
//     );

//     // Pagination buttons
//     const totalPages = Math.ceil(rooms.length / ROOMS_PER_PAGE);
//     const navButtons: any[] = [];
//     if (page > 1) navButtons.push(Markup.button.callback('⬅️ Prev', `show_rooms_${page - 1}`));
//     if (page < totalPages) navButtons.push(Markup.button.callback('Next ➡️', `show_rooms_${page + 1}`));
//     navButtons.push(Markup.button.callback('🏠 Back', 'show_menu'));

//     const inlineButtons = [...roomButtons, ...navButtons];

//     await ctx.reply('🎲 Choose a Bingo room:', Markup.inlineKeyboard(inlineButtons, { columns: 1 }));
//   } catch (err) {
//     console.error('[ERROR] Failed to fetch rooms:', err);
//     await ctx.reply('❌ Failed to load rooms. Please try again later.');
//   }
// }

// // ------------------ /start Command ------------------
// bot.start(async (ctx) => {
//   const firstName = ctx.from.first_name || 'Player';
//   await ctx.reply(`👋 Hello ${firstName}! Welcome to Bingo Fam!`, getFooterKeyboard());

//   // Immediately show all rooms
//   await showRooms(ctx);
// });

// // ------------------ Game Rooms menu item ------------------
// bot.hears('🎲 Game Rooms', async (ctx) => {
//   await showRooms(ctx);
// });

// // ------------------ Pagination handler ------------------
// bot.action(/show_rooms_(\d+)/, async (ctx) => {
//   await ctx.answerCbQuery();
//   const page = parseInt(ctx.match?.[1] || '1', 10);
//   await showRooms(ctx, page);
// });

// // ------------------ Footer Menu Handlers ------------------
// bot.hears('🎮 Start Game', async (ctx) => ctx.reply('🌟 Use the buttons below to navigate!', getFooterKeyboard()));
// bot.hears('💰 Deposit Fund', (ctx) => ctx.reply('Deposit here:', Markup.inlineKeyboard([Markup.button.url('Deposit Fund', `${APP_URL}/en`)])));
// bot.hears('🔁 Transfer Fund', (ctx) => ctx.reply('Transfer here:', Markup.inlineKeyboard([Markup.button.url('Transfer Fund', `${APP_URL}/transfer`)])));
// bot.hears('💸 Withdraw Money', (ctx) => ctx.reply('Withdraw here:', Markup.inlineKeyboard([Markup.button.url('Withdraw Money', `${APP_URL}/withdraw`)])));
// bot.hears('📖 Instructions', (ctx) => ctx.reply('Instructions:', Markup.inlineKeyboard([Markup.button.url('Instructions', `${APP_URL}/instructions`)])));
// bot.hears('🧑‍💻 Support', (ctx) => ctx.reply('Contact support:', Markup.inlineKeyboard([Markup.button.url('Get Support', `${APP_URL}/support`)])));

// // ------------------ Launch Bot ------------------
// bot.launch().then(() => console.log('🤖 Telegram bot is running...'));

// // ------------------ Graceful Shutdown ------------------
// process.once('SIGINT', () => bot.stop('SIGINT'));
// process.once('SIGTERM', () => bot.stop('SIGTERM'));



import { Telegraf, Markup } from 'telegraf';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { Room } from '../lib/types';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.BOT_TOKEN) throw new Error('BOT_TOKEN missing');
if (!process.env.BACKEND_BASE_URL) throw new Error('BACKEND_BASE_URL missing');
if (!process.env.APP_URL) throw new Error('APP_URL missing');

const API_BASE_URL = process.env.BACKEND_BASE_URL;
const APP_URL = process.env.APP_URL;
const ROOMS_PER_PAGE = 6;

const bot = new Telegraf(process.env.BOT_TOKEN);

// ------------------ Footer Keyboard ------------------
function getFooterKeyboard() {
  return Markup.keyboard([
    ['🎲 Game Rooms', '🎮 Start Game'],
    ['💰 Deposit Fund', '🔁 Transfer Fund'],
    ['💸 Withdraw Money', '📖 Instructions'],
    ['🧑‍💻 Support']
  ])
    .resize()
    .oneTime(false);
}

// ------------------ Function to fetch & show rooms ------------------
async function showRooms(ctx: any, page = 1) {
  try {
    const response = await axios.get<{ data: Room[] }>(`${API_BASE_URL}/api/v1/public/rooms`);
    const rooms = response.data.data;

    if (!rooms || rooms.length === 0) {
      await ctx.reply('❌ No rooms available right now.');
      return;
    }

    const startIdx = (page - 1) * ROOMS_PER_PAGE;
    const pagedRooms = rooms.slice(startIdx, startIdx + ROOMS_PER_PAGE);

    // WebApp buttons instead of URL
    const roomButtons = pagedRooms.map(room =>
      Markup.button.webApp(`${room.name} (${room.entryFee})`, `${APP_URL}/en/rooms/${room.id}`)
    );

    const totalPages = Math.ceil(rooms.length / ROOMS_PER_PAGE);
    const navButtons: any[] = [];
    if (page > 1) navButtons.push(Markup.button.callback('⬅️ Prev', `show_rooms_${page - 1}`));
    if (page < totalPages) navButtons.push(Markup.button.callback('Next ➡️', `show_rooms_${page + 1}`));
    navButtons.push(Markup.button.callback('🏠 Back', 'show_menu'));

    const inlineButtons = [...roomButtons, ...navButtons];

    await ctx.reply('🎲 Choose a Bingo room:', Markup.inlineKeyboard(inlineButtons, { columns: 1 }));
  } catch (err) {
    console.error('[ERROR] Failed to fetch rooms:', err);
    await ctx.reply('❌ Failed to load rooms. Please try again later.');
  }
}

// ------------------ /start Command ------------------
bot.start(async (ctx) => {
  const firstName = ctx.from.first_name || 'Player';
  await ctx.reply(`👋 Hello ${firstName}! Welcome to Bingo Fam!`, getFooterKeyboard());

  await showRooms(ctx);
});

// ------------------ Game Rooms menu item ------------------
bot.hears('🎲 Game Rooms', async (ctx) => {
  await showRooms(ctx);
});

// ------------------ Pagination handler ------------------
bot.action(/show_rooms_(\d+)/, async (ctx) => {
  await ctx.answerCbQuery();
  const page = parseInt(ctx.match?.[1] || '1', 10);
  await showRooms(ctx, page);
});

// ------------------ Footer Menu Handlers ------------------
bot.hears('🎮 Start Game', async (ctx) => ctx.reply('🌟 Use the buttons below to navigate!', getFooterKeyboard()));
bot.hears('💰 Deposit Fund', (ctx) =>
  ctx.reply('Deposit here:', Markup.inlineKeyboard([
    Markup.button.webApp('Deposit Fund', `${APP_URL}/en/deposit`)
  ]))
);
bot.hears('🔁 Transfer Fund', (ctx) =>
  ctx.reply('Transfer here:', Markup.inlineKeyboard([
    Markup.button.webApp('Transfer Fund', `${APP_URL}/en/transfer`)
  ]))
);
bot.hears('💸 Withdraw Money', (ctx) =>
  ctx.reply('Withdraw here:', Markup.inlineKeyboard([
    Markup.button.webApp('Withdraw Money', `${APP_URL}/en/withdraw`)
  ]))
);
bot.hears('📖 Instructions', (ctx) =>
  ctx.reply('Instructions:', Markup.inlineKeyboard([
    Markup.button.webApp('How to Play', `${APP_URL}/en/instructions`)
  ]))
);
bot.hears('🧑‍💻 Support', (ctx) =>
  ctx.reply('Contact support:', Markup.inlineKeyboard([
    Markup.button.webApp('Get Support', `${APP_URL}/en/support`)
  ]))
);

// ------------------ Launch Bot ------------------
bot.launch().then(() => console.log('🤖 Telegram bot is running in WebApp mode...'));

// ------------------ Graceful Shutdown ------------------
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
