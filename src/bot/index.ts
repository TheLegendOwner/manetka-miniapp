// src/bot/index.ts
import 'dotenv/config';
import { Telegraf, Markup } from 'telegraf';

// Подхватываем токен из .env.local
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is not defined in .env');
}

const bot = new Telegraf(token);

bot.start(async ctx => {
  const name = ctx.from.first_name || 'Дружище';
  const welcome = `<b>Привет, ${name}!</b>\n\nДобро пожаловать в Manetka Wallet!`;
  const photoUrl = `${process.env.NEXT_PUBLIC_APP_URL}/banner.jpg`;

  await ctx.replyWithPhoto(
    { url: photoUrl },
    {
      caption: welcome,
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.url('Открыть кошелек', `${process.env.NEXT_PUBLIC_APP_URL}`)],
        [Markup.button.callback('Помощь', 'help')],
      ])
    }
  );
});

bot.action('help', async ctx => {
  await ctx.answerCbQuery();
  return ctx.reply('Напишите ваш вопрос, и я постараюсь помочь!');
});

bot.launch().then(() => {
  console.log('🐝 Bot started');
});
