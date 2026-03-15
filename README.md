# PixelPureAI — AI-Powered Photo Enhancement SaaS

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/Convex-Database-orange?style=for-the-badge" alt="Convex" />
  <img src="https://img.shields.io/badge/Clerk-Auth-purple?style=for-the-badge&logo=clerk" alt="Clerk" />
  <img src="https://img.shields.io/badge/ImageKit-AI%20CDN-green?style=for-the-badge" alt="ImageKit" />
  <img src="https://img.shields.io/badge/Razorpay-Payments-blue?style=for-the-badge&logo=razorpay" alt="Razorpay" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel" alt="Vercel" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License MIT" />
</p>

<p align="center">
  <strong>A full-stack AI photo enhancement SaaS inspired by Remini.</strong><br/>
  Upload any photo and instantly enhance it using AI —<br/>
  Face Restore, Upscale 4×, Background Removal and more.
</p>

<p align="center">
  <a href="https://pixel-pure-ai.vercel.app">
    <img src="https://img.shields.io/badge/Live_Demo-Visit_App-blue?style=for-the-button&logo=vercel" alt="Live Demo" />
  </a>
  <a href="https://github.com/jatin12-alt/PixelPureAI">
    <img src="https://img.shields.io/badge/GitHub-Source_Code-black?style=for-the-button&logo=github" alt="GitHub" />
  </a>
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| ⚡ Auto Enhancement | Every uploaded photo is instantly enhanced |
| 🎨 12 AI Tools | Face Restore, Upscale 2×/4×, BG Remove, Sharpen, Denoise, Cinematic B&W, Smart Crop & more |
| 🖼️ Before/After Slider | Remini-style comparison slider |
| 🔗 Stacked Transforms | Chain multiple enhancements on one image |
| 🪙 Credit System | Credits deducted only on HD download |
| 💳 Razorpay Billing | Free / Pro / Business subscription plans |
| 💾 Project Save/Load | Save projects with full transform history |
| 📱 Fully Responsive | Mobile bottom-sheet + Desktop 3-panel layout |
| 🔐 Secure Auth | Clerk JWT with webhook-based user sync |
| ☁️ CDN Hosted | All images on ImageKit CDN |

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | JavaScript |
| **Frontend** | React 19, Tailwind CSS 4, Framer Motion |
| **UI Library** | Shadcn UI, Lucide Icons |
| **Database** | Convex (Real-time serverless) |
| **Authentication** | Clerk (JWT + Webhooks) |
| **AI & Image CDN** | ImageKit |
| **Payments** | Razorpay |
| **Deployment** | Vercel |
| **Package Manager** | npm |

---

## 📁 Project Structure

```text
PixelPureAI/
├── app/
│   ├── (auth)/              # Clerk sign-in/sign-up pages
│   ├── (main)/
│   │   └── dashboard/       # User project management
│   ├── studio/              # AI enhancement studio
│   ├── api/
│   │   ├── imagekit/        # Image upload route
│   │   ├── ai/              # AI transform routes
│   │   ├── payments/        # Razorpay order + verify
│   │   └── webhooks/        # Razorpay webhook handler
│   ├── pricing/             # Pricing page
│   ├── about/               # About page
│   ├── demo/                # Demo page
│   └── privacy/             # Privacy policy
├── components/
│   ├── ui/                  # Shadcn UI primitives
│   ├── comparison-slider    # Before/After slider
│   ├── header               # Global navbar
│   └── footer               # Global footer
├── convex/
│   ├── schema.js            # DB schema
│   ├── users.js             # User mutations
│   ├── projects.js          # Project mutations
│   ├── credits.js           # Credit system
│   └── http.js              # Clerk webhook handler
├── hooks/
│   └── useCredits.js        # Credits hook
├── lib/
│   └── imagekit-transforms  # AI transform config
└── public/                  # Static assets
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm
- Accounts on: Clerk, Convex, ImageKit, Razorpay

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jatin12-alt/PixelPureAI.git
cd PixelPureAI
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your `.env.local`:
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# Convex
NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
CONVEX_DEPLOY_KEY=prod:xxx

# ImageKit
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_xxx
IMAGEKIT_PRIVATE_KEY=private_xxx
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/xxx

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
```

5. Start Convex development server:
```bash
npx convex dev
```

6. Start Next.js development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

| Variable | Description | Required |
|---|---|---|
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | Clerk public key | ✅ |
| CLERK_SECRET_KEY | Clerk secret key | ✅ |
| CLERK_WEBHOOK_SECRET | Clerk webhook signing secret | ✅ |
| NEXT_PUBLIC_CONVEX_URL | Convex deployment URL | ✅ |
| CONVEX_DEPLOY_KEY | Convex deploy key | ✅ |
| NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY | ImageKit public key | ✅ |
| IMAGEKIT_PRIVATE_KEY | ImageKit private key | ✅ |
| NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT | ImageKit URL endpoint | ✅ |
| RAZORPAY_KEY_ID | Razorpay key ID | ✅ |
| RAZORPAY_KEY_SECRET | Razorpay secret key | ✅ |
| RAZORPAY_WEBHOOK_SECRET | Razorpay webhook secret | ✅ |
| NEXT_PUBLIC_RAZORPAY_KEY_ID | Razorpay public key (client) | ✅ |

---

## 🌐 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project on [https://vercel.com](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Set build command:
```bash
npx convex deploy && next build
```
5. Set install command:
```bash
npm install --legacy-peer-deps
```
6. Deploy!

---

## 🤖 AI Tools

| Tool | ImageKit Transform | Credits |
|---|---|---|
| AI Enhance | `e-restore,q-100` | Free |
| Face Restore | `e-restore,e-upscale-2,q-100` | Free |
| Upscale 2× | `e-upscale-2,q-100` | Free |
| Upscale 4× | `e-upscale-4,q-100` | Free |
| Remove BG | `e-bgremove` | Free |
| Blur Background | `e-bgremove,e-bg-blur-15` | Free |
| Sharpen | `e-sharpen,q-100` | Free |
| Denoise | `e-noise,q-100` | Free |
| AI Vivid | `e-contrast,e-saturation-20` | Free |
| Cinematic B&W | `e-grayscale,q-100` | Free |
| Smart Crop | `c-maintain_ratio,fo-face` | Free |
| Auto Trim | `e-trim-10,q-100` | Free |

---

## 💳 Pricing

| Plan | Price | Credits | Features |
|---|---|---|---|
| **Free** | ₹0/month | 20 credits | Basic tools, watermark on download |
| **Pro** | ₹299/month | 200 credits | All tools, no watermark, priority |
| **Business** | ₹799/month | 1000 credits | Everything + API access |

> Credits are deducted only when downloading HD images.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Jatin Dongre**
- LinkedIn: [https://www.linkedin.com/in/jatin-dongre-6a13a3294](https://www.linkedin.com/in/jatin-dongre-6a13a3294)
- GitHub: [https://github.com/jatin12-alt](https://github.com/jatin12-alt)
- Email: jatindongre926@gmail.com

---

<p align="center">
  Built with ❤️ by Jatin Dongre
  <br/>
  <a href="https://pixel-pure-ai.vercel.app">pixel-pure-ai.vercel.app</a>
</p>
