import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import mongoose from 'mongoose'
import {
    proccessVoiceMessage,
    proccessTextMessage,
    handleCallbackQuery,
    getUserConversations,
} from './logic.js'
import { initCommand, normalize } from './utils.js'
import { development } from './core/development.js'
import { production } from './core/production.js'
import dotenv from 'dotenv'

dotenv.config()

const ENVIRONMENT = process.env.NODE_ENV || ''

const bot = new Telegraf(process.env.TELEGRAM_TOKEN, {
    handlerTimeout: Infinity,
})

bot.use(session())
bot.use(normalize())

bot.command(
    'new',
    initCommand('Начат новый диалог. Жду голосовое или текстовое сообщение.')
)

bot.command(
    'start',
    initCommand(
        'Добро пожаловать в бота. Отправьте голосовое или текстовое сообщение для общения с ChatGPT.'
    )
)

bot.command('history', getUserConversations)

bot.on(message('voice'), proccessVoiceMessage)

bot.on(message('text'), proccessTextMessage)

bot.on('callback_query', handleCallbackQuery)

export const startVercel = async (req, res) => {
    await production(req, res, bot);
};

ENVIRONMENT !== 'production' && development(bot)