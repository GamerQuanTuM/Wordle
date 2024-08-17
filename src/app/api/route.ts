import { GoogleGenerativeAI } from "@google/generative-ai";
import { Prisma, PrismaClient } from "@prisma/client";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

type Word = {
    id: string,
    title: string
}

export async function GET(req: NextRequest) {
    let wordsArray: string[] = []

    const prisma = new PrismaClient()

    try {

        const words = await prisma.wordle.findMany()

        words.map((word) => (
            wordsArray.push(word.text)
        ))

        const question = `Generate a random five-letter word for a Wordle game in uppercase which is not the array ${wordsArray}`;

        const geminiModel = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_KEY as string);

        const model_pro = geminiModel.getGenerativeModel({ model: "gemini-pro" });

        const result = await model_pro.generateContent(question)

        const save = await prisma.wordle.create({
            data: {
                text: result.response.text()
            }
        })

        console.log(result.response.text())

        return NextResponse.json({ message: result.response.text() }, { status: 200 })
    } catch (error:any) {
        console.log(error)
        return NextResponse.json({ message: error }, { status: 500 })
    }

}