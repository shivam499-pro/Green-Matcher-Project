# 📘 Green Matchers

**India's First AI-Native Green-Jobs Platform**

> "We didn't build another job portal. We built intelligence for the green economy."

---

## 🎯 Product Vision

Build India's first AI-native green-jobs platform that works for non-English users first, powered by semantic intelligence, not keyword matching.

---

## 🏗️ Architecture

```
User (Browser)
   ↓
React Web App
   ↓
FastAPI (AI-first backend)
   ↓
AI Services Layer
   ↓
MariaDB (Vector + Relational)
```

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast Python web framework
- **Python 3.12** - Latest Python version
- **SQLAlchemy 2.0** - Modern ORM
- **MariaDB 10.11** - Database with vector support
- **JWT Auth** - Secure authentication
- **sentence-transformers** - AI embeddings (all-mpnet-base-v2)
- **Google Translate API** - Multi-language support

### Frontend
- **React 18** - Latest React
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **i18next** - Internationalization

---

## 📁 Project Structure

```
apps/
├── backend/
│   ├── core/        # config, security, deps
│   ├── models/      # SQLAlchemy models
│   ├── schemas/     # Pydantic schemas
│   ├── services/    # AI services
│   ├── routes/      # API endpoints
│   ├── utils/       # database utilities
│   └── main.py      # FastAPI app
└── web/
    ├── src/
    │   ├── components/   # React components
    │   ├── pages/        # Page components
    │   ├── hooks/        # Custom hooks
    │   ├── translations/  # i18n JSON files
    │   └── utils/        # API utilities
    ├── public/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- MariaDB 10.11+

### Backend Setup
```bash
cd apps/backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd apps/web
npm install
```

### Database Setup
```sql
CREATE DATABASE green_matchers CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'green_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON green_matchers.* TO 'green_user'@'localhost';
FLUSH PRIVILEGES;
```

### Running the Application
```bash
# Backend
cd apps/backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd apps/web
npm run dev
```

- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- API Docs: http://localhost:8000/docs

---

## 📚 Documentation

- [Architecture Plan](./plans/architecture-plan.md) - Detailed technical architecture
- [Quick Start Guide](./plans/quick-start.md) - Developer setup guide

---

## 🎨 Design Principles

- **White Space**: Generous padding and margins
- **Typography**: Large, readable fonts (16px base)
- **No Clutter**: Clean dashboards with essential info only
- **Mobile-Responsive**: Works on all screen sizes

---

## 🌐 Multi-Language Support

Phase 1 Languages:
- English (en)
- Hindi (hi)
- Tamil (ta)
- Telugu (te)
- Bengali (bn)
- Marathi (mr)

---

## 🤖 AI Features

1. **Semantic Search** - Vector-based similarity search
2. **Skill Matching** - AI-powered career recommendations
3. **Resume Parsing** - NLP + rule-based skill extraction
4. **Translation** - Google Translate API integration

---

## 📊 Analytics

- Career demand scores
- Skill popularity tracking
- Salary range analytics
- SDG goal distribution
- Verified company badges

---

## 🏆 Hackathon Strategy

### What Judges See
- ✅ Real AI (not buzzwords)
- ✅ Vector search demo
- ✅ Regional language switching
- ✅ Real jobs, real impact
- ✅ Clean, professional UI

### Key Message
> "We built intelligence for the green economy, not just another job board."

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

*Built with ❤️ for India's green economy*
