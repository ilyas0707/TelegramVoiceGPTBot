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
import { development, production } from './core'
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

async function start() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })

        bot.launch()

        console.log('MongoDB Connected and bot started.')

        process.on('uncaughtException', (err) => {
            console.error('Неперехваченное исключение:', err)
            // process.exit(1)
        })

        process.on('unhandledRejection', (reason, promise) => {
            console.error({ unhandledRejection: { reason, promise } })
        })

        // process.once('SIGINT', () => bot.stop('SIGINT'))
        // process.once('SIGTERM', () => bot.stop('SIGTERM'))
    } catch (e) {
        console.log('Server Error', e.message)
        process.exit(1)
    }
}

start()