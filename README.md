# EonLogic – AI-powered Website Builder

Welcome to the **Durable-style AI Website Builder** – a playful, developer-friendly clone of the rapid website creator you always wished existed. Give us a couple of details about your business and we'll hand back a polished, production-ready Next.js site, complete with images, copy, and design defaults.

> "Press a button, pour a coffee, come back to a website." ☕️

---

## ✨ What's inside?

- **Next.js + React + TypeScript** – modern, typed, and blazingly fast.
- **Tailwind CSS** – utility-first styling with zero config.
- **AI content generation** – powered via `GROQ_API_KEY` (or swap in OpenAI if you like).
- **Image sourcing** – royalty-free photos pulled on-the-fly from Pexels (`PEXELS_API_KEY`).
- **Drag-and-drop section builder** – reorder, duplicate, or delete blocks.
- **One-click "Add Section"** – sits neatly between every block (à la Durable).
- **Live style panels** – tweak colors, spacing, and layout in real time.
- **Local storage autosave** – never lose your work when you refresh.

---

## 🚀 Quick start

### 1. Clone & install

```bash
# Clone the repo
$ git clone https://github.com/your-username/ai-website-builder.git
$ cd ai-website-builder

# Install dependencies (choose one)
$ pnpm install   # ‑ or ‑
$ yarn           # ‑ or ‑
$ npm install
```

### 2. Environment variables

Create a `.env.local` in the project root and add:

```bash
# AI text generation (GROQ, OpenAI, etc.)
GROQ_API_KEY="YOUR_AI_API_KEY"

# Pexels for royalty-free images
PEXELS_API_KEY="YOUR_PEXELS_API_KEY"
```

> Don't have keys? Grab a free Pexels key [here](https://www.pexels.com/api/) and a GROQ/OpenAI key from your provider of choice.

### 3. Dev server

```bash
# run locally at http://localhost:3000
$ npm run dev
```

### 4. Build for production

```bash
$ npm run build
$ npm start
```

---

## 🗂 Project structure (high-level)

```
.
├── cli
│   └── src
│       └── app
│           └── website
│               └── page.tsx     # 8K lines of AI-driven magic ✨
├── pages/api
│   ├── generate-content.ts      # AI content endpoint
│   └── fetch-image.ts           # Pexels proxy endpoint
└── README.md                    # you are here
```

Feel free to dive straight into `cli/src/app/website/page.tsx` – every UI interaction, state handler, and helper lives there. If a feature exists, you'll find it in that file.

---

## 🧑‍💻 Contributing

Pull requests are welcome! If you spot a bug or have a feature idea:

1. Open an issue describing the problem / enhancement.
2. Branch from `main`, commit with conventional commits, and make a PR.
3. Drink more coffee while the CI runs ☕️.

---

## 📄 License

[MIT](LICENSE) – free as in freedom. Go build something awesome.

---

### ❤️ Acknowledgements

- **Durable AI** – inspiration for the "instant website" experience.
- **Pexels** – beautiful free photography.
- **OpenAI / GROQ** – language models that do the heavy lifting.
- **Tailwind UI & Lucide Icons** – quick, accessible visuals.

---

Made with love, TypeScript, and way too much caffeine. Enjoy! ☕️🚀
