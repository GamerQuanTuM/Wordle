import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

type Word = {
    id: string,
    title: string
}

export async function GET(req: NextRequest) {
    let wordsArray: string[] = []

    try {
        const words = (await axios.get("http://localhost:8000/word")).data as Word[];

        words.map((word) => (
            wordsArray.push(word.title)
        ))


        const question = `Generate a unique five-letter word for a Wordle game which is not the array ${wordsArray}`;

        const geminiModel = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_KEY as string);

        const model_pro = geminiModel.getGenerativeModel({ model: "gemini-pro" });

        const result = await model_pro.generateContent(question)

        await axios.post("http://localhost:8000/word", {
            id: uuidv4(),
            title: result.response.text()
        })

        return NextResponse.json({ message: result.response.text() }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: error }, { status: 500 })
    }

}