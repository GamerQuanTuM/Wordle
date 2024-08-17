import { GoogleGenerativeAI } from "@google/generative-ai";
import { Prisma, PrismaClient } from "@prisma/client";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

type Word = {
    id: string,
    title: string
}

let safe = [
    {
        "category": "HARM_CATEGORY_DANGEROUS",
        "threshold": "BLOCK_NONE",
    },
    {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_NONE",
    },
    {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_NONE",
    },
    {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_NONE",
    },
    {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_NONE",
    },
]

export async function GET(req: NextRequest) {
    let wordsArray: string[] = []

    const prisma = new PrismaClient()

    try {

        const words = await prisma.wordle.findMany()

        words.map((word) => (
            wordsArray.push(word.text)
        ))

        const question = `Generate a random, non-offensive five-letter English word suitable for a family-friendly word game. The word should not be in the following list: ${wordsArray.join(', ')}`;

        const geminiModel = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_KEY as string);

        const model_pro = geminiModel.getGenerativeModel({ model: "gemini-pro" });

        const result = await model_pro.generateContent(question)

        await prisma.wordle.create({
            data: {
                text: result.response.text().toUpperCase()
            }
        })

        return NextResponse.json({ message: result.response.text().toUpperCase() }, { status: 200 })
    } catch (error:any) {
        console.log(error)
        return NextResponse.json({ message: error }, { status: 500 })
    }

}