import express from "express";
import { Services } from "./services.js";
import { Book, sequelize } from "./database.js";
import { engine } from "express-handlebars";


const PORT = 8902;
const app = express();

console.log(process.env.GROQ_API_KEY)

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

const GutenbergService = new Services();

app.use(express.static("public"));

app.get("/", async (req, res) => {
  let books = await Book.findAll({ raw: true });
  books = books.map((el) => ({ ...el, metadata: JSON.parse(el.metadata) }));
  res.render("home", { books: books });
});

app.get("/search", async (req, res) => {
  res.render("searchable");
});

app.get("/gutenberg/:id", async (req, res) => {
  const book_id = req.params.id;

  const book = await Book.findOne({
    where: {
      book_iden: book_id,
    },
  });

  if (!book) {
    let book_content = await GutenbergService.fetchBookContent(book_id);
    let book_metadata = await GutenbergService.fetchBookMetadata(book_id);

    let book = await Book.create({
      book_iden: book_id,
      content: book_content,
      metadata: { ...book_metadata, ebookId: book_metadata["EBook-No."] },
    });

    return res.status(200).send(book);
  }

  return res.status(200).json(book);
});

app.get("/books", async (req, res) => {
  const book = await Book.findAll();

  return res.status(200).json(books);
});

app.get("/details/:id", async (req, res) => {
  const book = await Book.findOne({
    where: {
      book_iden: req.params.id,
    },
    raw: true,
  });

  if (!book) {
    return res.redirect("/");
  }

  book.metadata = JSON.parse(book.metadata);

  return res.render("details", { book: book });
});

app.get("/summary/:id", async (req, res) => {
  let id = req.params.id;

  let data = await GutenbergService.generateAISummary(id)

 
  return res.status(200).send(data)
});

app.listen(PORT, async function () {
  // await createSchemes()
  await sequelize.sync();
  console.log(`Running on PORT: ${PORT}`);
});
