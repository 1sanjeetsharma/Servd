# 🍳AI Recipe Generator

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" />
  <img src="https://img.shields.io/badge/Strapi-CMS-purple?logo=strapi" />
  <img src="https://img.shields.io/badge/Security-Arcjet-red" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
  <img src="https://img.shields.io/badge/Status-Active-success" />
</p>

---

## ✨ About the Project

A full-stack **AI Recipe Generator** that transforms ingredients into complete recipes using AI.

Users can either:
- ✍️ Enter ingredients manually  
- 📸 Upload an image of ingredients  

The system detects ingredients from images and generates recipes accordingly.

---

## 🚀 Features

- 🤖 AI-powered recipe generation  
- 📸 Image-based ingredient detection  
- 🧾 Recipe suggestions from detected ingredients  
- 📄 Export recipes as PDF  
- 🔐 Authentication with Clerk  
- 🛡️ API protection using Arcjet  
- 📦 CMS-powered backend (Strapi)  
- 💾 Save and manage recipes  

---

## 🧠 How It Works

1. User uploads an image of ingredients 📸  
2. AI extracts ingredient names from the image  
3. Extracted ingredients are sent to recipe generator  
4. AI generates a structured recipe 🍳  

---

## 🧱 Tech Stack

### Frontend (`/frontend`)
- Next.js 16  
- React 19  
- TailwindCSS 4  
- ShadCN UI  

### Backend (`/backend`)
- Node.js  
- Strapi CMS  

### Services
- Google Generative AI (recipe generation + image understanding)  
- Arcjet (Security & rate limiting)  
- Clerk (Authentication)  

---

## 📁 Project Structure

```
servd/
├── frontend/    # Next.js app
├── backend/     # Strapi CMS
```

---

## ⚙️ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:  
http://localhost:3000

---

## 🧠 Backend Setup (Strapi)

```bash
cd backend
npm install
npm run develop
```

Backend runs at:  
http://localhost:1337

---

## 🔗 Connecting Frontend & Backend

Create `.env.local` inside **frontend**:

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
GOOGLE_API_KEY=your_key
CLERK_SECRET_KEY=your_key
ARCJET_KEY=your_key
```

---

## 🛡️ Arcjet Protection Example

```js
if (decision.isDenied()) {
  if (decision.reason.isBot) {
    return NextResponse.json(
      { error: "no bots allowed", reason: decision.reason },
      { status: 403 }
    );
  }
}
```

---

## 📸 Screenshots

_Add screenshots here_

---

## 🌱 Future Improvements

- Meal planning  
- Grocery list generation  
- Mobile app  
- Multi-language recipes  

---

## 🧑‍💻 Author

**Sanjeet Sharma**  
Frontend Developer | React | Next.js  

---

## 📄 License

MIT License
