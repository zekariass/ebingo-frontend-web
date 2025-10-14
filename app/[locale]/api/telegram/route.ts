import { NextRequest, NextResponse } from 'next/server';
import { Telegraf, Markup } from 'telegraf';
import axios from 'axios';
import path from 'path';
import dotenv from 'dotenv';
import { Room } from '@/lib/types';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.BOT_TOKEN) throw new Error('BOT_TOKEN missing');
if (!process.env.BACKEND_BASE_URL) throw new Error('BACKEND_BASE_URL missing');
if (!process.env.APP_URL) throw new Error('APP_URL missing');

const API_BASE_URL = process.env.BACKEND_BASE_URL;
const APP_URL = process.env.APP_URL;
const ROOMS_PER_PAGE = 2;
const currency = "Birr";

const bot = new Telegraf(process.env.BOT_TOKEN);

// ---------------- Language state ----------------
const availableLanguages = ['en', 'am'];
const userLanguageMap = new Map<number, string>();

function getUserLanguage(ctx: any) {
  const userId = ctx.from?.id;
  return userId ? userLanguageMap.get(userId) || 'en' : 'en';
}

// ---------------- Translation Helper ----------------
const translations: Record<string, Record<string, string>> = {
  en: { /* same as your original code */ },
  am: { /* same as your original code */ },
};

function t(ctx: any, key: string): string {
  const lang = getUserLanguage(ctx);
  return translations[lang]?.[key] || translations['en'][key] || key;
}

// ---------------- Set localized commands ----------------
async function setLocalizedCommands() {
  await bot.telegram.setMyCommands([
    { command: 'webview', description: '🌐 Open Web View' },
    { command: 'gamerooms', description: '🎲 Game Rooms' },
    { command: 'startgame', description: '🎮 Start Game' },
    { command: 'deposit', description: '💰 Deposit Fund' },
    { command: 'transfer', description: '🔁 Transfer Fund' },
    { command: 'withdraw', description: '💸 Withdraw Money' },
    { command: 'instructions', description: '📖 Instructions' },
    { command: 'support', description: '🧑‍💻 Support' },
    { command: 'language', description: '🌐 Change Language' },
  ], { language_code: 'en' });

  await bot.telegram.setMyCommands([
    { command: 'webview', description: '🌐 የድህረገፅ እይታ' },
    { command: 'gamerooms', description: '🎲 የጨዋታ ክፍሎች' },
    { command: 'startgame', description: '🎮 ጨዋታ ጀምር' },
    { command: 'deposit', description: '💰 ተቀማጭ' },
    { command: 'transfer', description: '🔁 ክፍያ ላክ' },
    { command: 'withdraw', description: '💸 ገንዘብ ውሰድ' },
    { command: 'instructions', description: '📖 መመሪያ' },
    { command: 'support', description: '🧑‍💻 ድጋፍ' },
    { command: 'language', description: '🌐 ቋንቋ ለውጥ' },
  ], { language_code: 'am' });
}

// ---------------- Footer keyboard ----------------
function getFooterKeyboard(selectedLanguage: string = 'en') {
  const langTrans = translations[selectedLanguage];
  return Markup.keyboard([
    [langTrans.btnWebview],
    [langTrans.btnGameRooms, langTrans.btnStartGame],
    [langTrans.btnDeposit, langTrans.btnTransfer],
    [langTrans.btnWithdraw, langTrans.btnInstructions],
    [langTrans.btnSupport],
    [`${langTrans.btnLanguage}: ${selectedLanguage.toUpperCase()}`]
  ])
    .resize()
    .oneTime(true)
}

// ---------------- Show Rooms ----------------
async function showRooms(ctx: any, page = 1) {
  try {
    const response = await axios.get<{ data: Room[] }>(`${API_BASE_URL}/api/v1/public/rooms`);
    const rooms = response.data.data;
    if (!rooms || rooms.length === 0) {
      await ctx.reply(t(ctx, 'noRooms'));
      return;
    }

    const startIdx = (page - 1) * ROOMS_PER_PAGE;
    const pagedRooms = rooms.slice(startIdx, startIdx + ROOMS_PER_PAGE);

    const roomButtons = pagedRooms.map(room =>
      Markup.button.webApp(`(${room.entryFee} ${currency})`, `${APP_URL}/${getUserLanguage(ctx)}/rooms/${room.id}`)
    );

    const totalPages = Math.ceil(rooms.length / ROOMS_PER_PAGE);
    const navButtons: any[] = [];
    if (page > 1) navButtons.push(Markup.button.callback(t(ctx, 'prev'), `show_rooms_${page - 1}`));
    if (page < totalPages) navButtons.push(Markup.button.callback(t(ctx, 'next'), `show_rooms_${page + 1}`));

    const inlineButtons = [...roomButtons, ...navButtons];
    await ctx.reply(t(ctx, 'chooseRoom'), Markup.inlineKeyboard(inlineButtons, { columns: 2 }));
  } catch (err) {
    console.error('[ERROR] Failed to fetch rooms:', err);
    await ctx.reply(t(ctx, 'fetchError'));
  }
}

// ---------------- Start Menu ----------------
async function showStartMenu(ctx: any) {
  const lang = getUserLanguage(ctx);
  const firstName = ctx.from.first_name || 'Player';
  const greeting =
    lang === 'en' ? `👋 Hello ${firstName}!` :
    lang === 'am' ? `👋 ሰላም ${firstName}!` :
    `👋 Hello!`;

  const langTrans = translations[lang];

  await ctx.reply(`${greeting}\n\n${t(ctx, 'greeting')}`, getFooterKeyboard(lang));

  const inlineButtons = [
    [
      Markup.button.callback(langTrans.btnWebview, 'cmd_webview'),
      Markup.button.callback(langTrans.btnGameRooms, 'cmd_gamerooms'),
    ],
    [
      Markup.button.callback(langTrans.btnStartGame, 'cmd_startgame'),
      Markup.button.callback(langTrans.btnDeposit, 'cmd_deposit'),
    ],
    [
      Markup.button.callback(langTrans.btnTransfer, 'cmd_transfer'),
      Markup.button.callback(langTrans.btnWithdraw, 'cmd_withdraw'),
    ],
    [
      Markup.button.callback(langTrans.btnInstructions, 'cmd_instructions'),
      Markup.button.callback(langTrans.btnSupport, 'cmd_support'),
    ],
    [
      Markup.button.callback(`${langTrans.btnLanguage}`, 'cmd_language'),
    ],
  ];

  await ctx.reply('📋 Choose a command:', Markup.inlineKeyboard(inlineButtons));
}

// ---------------- Bot Handlers ----------------

// ------------------ Inline command handlers ------------------
bot.action('cmd_webview', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(t(ctx, 'openingWebview'), Markup.inlineKeyboard([
    Markup.button.webApp('Open Lobby', `${APP_URL}/${getUserLanguage(ctx)}`)
  ]));
});

bot.action('cmd_gamerooms', async (ctx) => {
  await ctx.answerCbQuery();
  await showRooms(ctx);
});

bot.action('cmd_startgame', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(t(ctx, 'startGame'), getFooterKeyboard(getUserLanguage(ctx)));
  // await showStartMenu(ctx)
});

bot.action('cmd_deposit', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(t(ctx, 'deposit'), Markup.inlineKeyboard([
    Markup.button.webApp('Deposit Fund', `${APP_URL}/${getUserLanguage(ctx)}/deposit`)
  ]));
});

bot.action('cmd_transfer', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(t(ctx, 'transfer'), Markup.inlineKeyboard([
    Markup.button.webApp('Transfer Fund', `${APP_URL}/${getUserLanguage(ctx)}/transfer`)
  ]));
});

bot.action('cmd_withdraw', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(t(ctx, 'withdraw'), Markup.inlineKeyboard([
    Markup.button.webApp('Withdraw Money', `${APP_URL}/${getUserLanguage(ctx)}/withdraw`)
  ]));
});

bot.action('cmd_instructions', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(t(ctx, 'instructions'), Markup.inlineKeyboard([
    Markup.button.webApp('How to Play', `${APP_URL}/${getUserLanguage(ctx)}/instructions`)
  ]));
});

bot.action('cmd_support', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(t(ctx, 'support'), Markup.inlineKeyboard([
    Markup.button.webApp('Get Support', `${APP_URL}/${getUserLanguage(ctx)}/support`)
  ]));
});

bot.action('cmd_language', async (ctx) => {
  await ctx.answerCbQuery();
  const inlineButtons = availableLanguages.map(lang =>
    Markup.button.callback(lang.toUpperCase(), `set_language_${lang}`)
  );
  await ctx.reply('🌐 Select your language:', Markup.inlineKeyboard(inlineButtons, { columns: 2 }));
});


// ------------------ Command Handlers ------------------
bot.command('webview', async (ctx) => {
  await ctx.reply(t(ctx, 'openingWebview'), Markup.inlineKeyboard([
    Markup.button.webApp('Open Lobby', `${APP_URL}/${getUserLanguage(ctx)}`)
  ]));
});

bot.command('gamerooms', async (ctx) => await showRooms(ctx));
bot.command('startgame', async (ctx) => await showStartMenu(ctx));
bot.command('deposit', async (ctx) => await ctx.reply(t(ctx, 'deposit'), Markup.inlineKeyboard([
  Markup.button.webApp('Deposit Fund', `${APP_URL}/${getUserLanguage(ctx)}/deposits`)
])));
bot.command('transfer', async (ctx) => await ctx.reply(t(ctx, 'transfer'), Markup.inlineKeyboard([
  Markup.button.webApp('Transfer Fund', `${APP_URL}/${getUserLanguage(ctx)}/transfers`)
])));
bot.command('withdraw', async (ctx) => await ctx.reply(t(ctx, 'withdraw'), Markup.inlineKeyboard([
  Markup.button.webApp('Withdraw Money', `${APP_URL}/${getUserLanguage(ctx)}/withdraw`)
])));
bot.command('instructions', async (ctx) => await ctx.reply(t(ctx, 'instructions'), Markup.inlineKeyboard([
  Markup.button.webApp('How to Play', `${APP_URL}/${getUserLanguage(ctx)}/instructions`)
])));
bot.command('support', async (ctx) => await ctx.reply(t(ctx, 'support'), Markup.inlineKeyboard([
  Markup.button.webApp('Get Support', `${APP_URL}/${getUserLanguage(ctx)}/support`)
])));

// ------------------ Language Command ------------------
bot.command('language', async (ctx) => {
  const inlineButtons = availableLanguages.map(lang =>
    Markup.button.callback(lang.toUpperCase(), `set_language_${lang}`)
  );
  await ctx.reply('🌐 Select your language:', Markup.inlineKeyboard(inlineButtons, { columns: 2 }));
});

// ------------------ Language Action Handler ------------------
bot.action(/set_language_(.+)/, async (ctx) => {
  await ctx.answerCbQuery();
  const selectedLang = ctx.match?.[1];
  const userId = ctx.from?.id;
  if (!userId || !selectedLang) return;
  userLanguageMap.set(userId, selectedLang);
  await ctx.reply(`${t(ctx, 'languageChanged')} ${selectedLang.toUpperCase()}`, getFooterKeyboard(selectedLang));
});

// ------------------ Pagination Handler ------------------
bot.action(/show_rooms_(\d+)/, async (ctx) => {
  await ctx.answerCbQuery();
  const page = parseInt(ctx.match?.[1] || '1', 10);
  await showRooms(ctx, page);
});
// ------------------ Webhook handler ----------------
export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    await bot.handleUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: false, error });
  }
}

// ------------------ Setup webhook on deployment ----------------
setLocalizedCommands().then(async () => {
  const webhookUrl = `${APP_URL}/api/telegram`;
  await bot.telegram.setWebhook(webhookUrl);
  console.log(`🤖 Telegram bot webhook set at ${webhookUrl}`);
});
