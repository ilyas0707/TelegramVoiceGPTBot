import { OpenAI } from 'openai'
import { createReadStream } from 'fs'
import dotenv from 'dotenv';

dotenv.config()

const CHAT_GPT_MODEL = 'gpt-3.5-turbo'

class OpenAi {
    roles = {
        ASSISTANT: 'assistant',
        SYSTEM: 'system',
        USER: 'user',
    }

    constructor(apiKey) {
        this.openai = new OpenAI({
            apiKey,
        })
    }

    async chat(messages = [], user = '') {
        try {
            const completion = await this.openai.chat.completions.create({
                model: CHAT_GPT_MODEL,
                messages,
                user,
            })

            console.log('Usage', completion.usage)

            return completion.choices[0].message
        } catch (e) {
            console.error(`Error while chat completion: ${e.message}`)
        }
    }

    async transcription(filepath) {
        try {
            const response = await this.openai.audio.transcriptions.create(
                {
                    file: createReadStream(filepath),
                    model: 'whisper-1',
                }
            );
            return response.text;
        } catch (e) {
            console.error(`Error while transcription: ${e.message}`);
        }
    }

    // async image(prompt = 'a white siamese cat') {
    //     const response = await this.openai.images.generate({
    //         prompt,
    //         n: 1,
    //         size: '1024x1024',
    //     })
    //     return response.data.data[0].url
    // }
}

export const openai = new OpenAi(process.env.OPENAI_KEY)
