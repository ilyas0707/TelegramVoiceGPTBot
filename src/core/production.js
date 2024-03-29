import createDebug from 'debug'

const debug = createDebug('bot:dev')

const PORT = (process.env.PORT && parseInt(process.env.PORT, 10)) || 3000
const VERCEL_URL = `${process.env.VERCEL_URL}`

export const production = async (req, res, bot) => {
    debug('Bot runs in production mode')
    debug(`setting webhook: ${VERCEL_URL}`)

    if (!VERCEL_URL) {
        throw new Error('VERCEL_URL is not set.')
    }

    const getWebhookInfo = await bot.telegram.getWebhookInfo()
    if (getWebhookInfo.url !== VERCEL_URL + '/api') {
        debug(`deleting webhook ${VERCEL_URL}`)
        await bot.telegram.deleteWebhook()
        debug(`setting webhook: ${VERCEL_URL}/api`)
        await bot.telegram.setWebhook(`${VERCEL_URL}/api`)
    }

    if (req.method === 'POST') {
        await bot.handleUpdate(req.body, res)
    } else {
        res.status(200).json('Listening to bot events...')
    }
    debug(`starting webhook on port: ${PORT}`)

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
}