# 🍽️ Campus Mess Intelligence

### Smart Dining. Shorter Queues. Better Campus Life.

Campus Mess Intelligence is a smart campus dining platform designed to help students make informed dining decisions by checking mess waiting times, exploring daily menus, viewing meal schedules, and sharing food feedback.

The project aims to improve the campus dining experience by combining a responsive web interface, centralized mess information, database integration, and machine learning-based waiting-time estimation.

---

## ✨ Features

- **⏱️ Mess Waiting-Time Information** — View queue counts, estimated waiting times, counter availability, and mess status.
- **🍛 Daily Menu** — Explore meal information for breakfast, lunch, snacks, and dinner.
- **📅 Weekly Menu** — Navigate between days to view the corresponding menu when data is available.
- **⭐ Food Ratings** — Share feedback about the campus food experience.
- **🕒 Mess Timings** — Check the scheduled serving hours for each meal.
- **📢 Complaints and Feedback** — Provide feedback about campus dining.
- **🤖 ML-Based Waiting-Time Estimation** — Experiment with predicting waiting times using queue and meal-related information.
- **📱 Responsive Interface** — Designed for desktop and mobile devices.

> **Note:** Features that depend on database configuration, the ML API, or live campus updates may require additional setup. Demonstration data is not a source of verified real-time information.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Building the user interface |
| TypeScript | Type-safe application development |
| Vite | Development server and build tooling |
| Tailwind CSS | Responsive styling |
| Lucide React | Interface icons |
| Supabase | Database and backend services |
| Python | Machine learning implementation |
| pandas | Data processing |
| scikit-learn | Training and evaluating ML models |
| FastAPI | Serving predictions through an API |
| joblib | Saving and loading trained models |

*The table describes the intended project stack; verify it against the dependencies and implementation in your repository.*

---

## 🧠 Machine Learning Component

The project includes an experimental machine learning component for estimating mess waiting times.

Potential input features include:

- Queue size
- Number of open counters
- Meal period
- Day of the week

The model uses these inputs to estimate a waiting time in minutes.

The prediction is intended to support student decision-making, not guarantee an exact waiting time.

**Current limitation:** Model performance depends on the quality and quantity of training data. Predictions trained on synthetic or demonstration data must be evaluated against real observations before being used operationally.

---

## 🍽️ Campus Dining Schedule

| Meal | Serving Time |
|---|---|
| Breakfast | 7:00 AM – 9:00 AM |
| Lunch | 12:00 PM – 2:00 PM |
| Snacks | 4:30 PM – 5:45 PM |
| Dinner | 7:00 PM – 9:00 PM |

These are the configured schedule values for the project and should be verified with campus management before operational use.

---

## 🏗️ Project Architecture

The application is organized around a frontend, database services, and an optional machine learning API.

```text
Campus Mess Intelligence
│
├── Frontend
│   ├── React
│   ├── TypeScript
│   └── Tailwind CSS
│
├── Backend Services
│   └── Supabase
│
└── Machine Learning
    ├── Python
    ├── Model Training
    └── FastAPI Prediction API
```

The exact directory structure may vary depending on the current implementation.

---

## 🚀 Getting Started

### Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/)
- npm
- [Git](https://git-scm.com/)
- Python 3.11 or another version supported by the project's ML dependencies, if using the ML API
- A Supabase project, if using the database integration

### 1. Clone the Repository

Replace `YOUR-USERNAME` with your GitHub username.

```bash
git clone https://github.com/YOUR-USERNAME/campus-mess-intelligence.git
```

Navigate into the project:

```bash
cd campus-mess-intelligence
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root if the application uses Supabase.

Example:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
```

Use the correct variable names expected by your source code. The example above matches a common Vite configuration.

**Security:** Never commit `.env.local`, service-role keys, database passwords, or other private credentials to GitHub. Vite variables prefixed with `VITE_` are exposed to the browser, so only use keys intended for public client-side access and secure database access with appropriate Row Level Security policies.

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL printed in your terminal, usually:

```text
http://localhost:5173
```

### 5. Run the Machine Learning API (Optional)

If the repository contains `ml/api.py` and the required Python dependencies, create and activate a Python virtual environment from the project root.

**Windows PowerShell:**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install the dependencies used by your ML API. For example, if your project has a suitable `requirements.txt`:

```bash
pip install -r ml/requirements.txt
```

Start the API:

```bash
python -m uvicorn ml.api:app --reload
```

If your dependency file is located elsewhere, use its actual path. Confirm that the API starts successfully and that the frontend uses the correct API URL.

---

## 📂 Project Structure

The following is an illustrative structure. Adjust it to match the actual files in your repository.

```text
campus-mess-intelligence/
├── public/
├── src/
│   ├── components/
│   ├── data/
│   ├── lib/
│   ├── App.tsx
│   └── main.tsx
├── ml/
│   ├── api.py
│   ├── train_model.py
│   └── mess_wait_data.csv
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🔐 Data and Privacy

- Keep private credentials outside version control.
- Use appropriate Supabase Row Level Security policies.
- Validate inputs before saving feedback or complaints.
- Clearly distinguish demonstration values from live campus information.
- Avoid collecting unnecessary personal information from students.

---

## 🛣️ Future Improvements

- Integrate verified, real-time queue updates from mess managers.
- Improve waiting-time estimates using real historical observations.
- Add reliable database-backed menu and availability management.
- Enable automatic refresh of mess status and queue information.
- Improve monitoring, error handling, and deployment configuration.
- Evaluate prediction quality using appropriate test data.

---

## 🎯 Project Objective

The goal of Campus Mess Intelligence is to make campus dining more convenient by giving students useful information before they reach a mess. The project also provides an opportunity to explore full-stack development, database integration, and practical machine learning.

---

## 👨‍💻 Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the changes.
5. Submit a pull request.

---

## 📄 License

No license has been specified yet. Add a license file if you intend to define how others may use, modify, and distribute this project.

---

**Campus Mess Intelligence** — making campus dining smarter, one meal at a time.
