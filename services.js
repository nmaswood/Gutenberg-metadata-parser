import sqlite3 from "sqlite3";
import axios from "axios";
import { JSDOM } from "jsdom";
import "reflect-metadata";
import { Book } from "./database.js";
import Groq from "groq-sdk";
import dotenv from 'dotenv';
dotenv.config()



const db = new sqlite3.Database("data.sqlite3");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY});

export class Services {
  constructor() {}

  async fetchBookContent(book_id) {
    let response = await axios.get(
      `https://www.gutenberg.org/files/${book_id}/${book_id}-0.txt`
    );
    return response.data;
  }

  async fetchBookMetadata(book_id) {
    let res = await axios.get(`https://www.gutenberg.org/ebooks/${book_id}`);

    let data = await res.data;

    const dom = new JSDOM(data);
    const document = dom.window.document;
    const quotes = document
      .querySelectorAll("#bibrec > div > table > tbody")[0]
      .querySelectorAll("tr");
    let metadata = {};

    quotes.forEach((el) => {
      let title = el.firstElementChild.textContent;
      let value = el.lastElementChild.childNodes.length
        ? el.lastElementChild.textContent
        : el.lastElementChild.firstElementChild.textContent;
      metadata[title] = value;
    });

    return metadata
  }

  async generateAISummary(book_id){
    let book = await Book.findOne({
        where: {
            book_iden: book_id
        }
    })

    const completion = await groq.chat.completions
    .create({
      messages: [
        {
          role: "user",
          content: `Generate Summary for the book - ${book.metadata.Title}`,
        },
      ],
      model: "llama3-8b-8192",
    })
    const data = completion.choices[0]?.message?.content

    book.gencontent = data.slice(data.indexOf('\n'))

    book.save()

    return data

  }
}
