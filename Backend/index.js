require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./User');
const cors = require('cors');
const auth = require("./auth");


const app = express();
app.use(cors({
  origin: "https://kapil0099.github.io"
}));
app.use(express.json());

// DB connect
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("DB Connected"))
.catch(err => console.log(err));

// test route
app.get('/', (req, res) => {
  res.send('API Working');
});

// signup route
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    email,
    password: hashedPassword
  });

  await user.save();

  res.send("User created");
});

// START SERVER
app.listen(5000, () => {
  console.log("Server running on port 5000");
});

const jwt = require("jsonwebtoken");

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send("User not found");
    }

    // ✅ correct way to compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send("Wrong password");
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET
    );

    res.json({ token });

  } catch (err) {
    res.status(500).send("Error in login");
  }
});

const Entry = require('./Entry');
const authMiddleware = require('./auth');

app.post('/entry', auth, async (req, res) => {
  const { type, amount, category } = req.body;

  const entry = new Entry({
    email: req.user.email,
    type,
    amount,
    category
  });

  await entry.save();

  res.send("Entry added");
});



app.get('/summary', auth, async (req, res) => {
  const range = req.query.range; // today, week, month

  let startDate = new Date();

  if (range === "today") {
    startDate.setHours(0,0,0,0);
  } else if (range === "week") {
    startDate.setDate(startDate.getDate() - 7);
  } else if (range === "month") {
    startDate.setMonth(startDate.getMonth() - 1);
  }

  const entries = await Entry.find({
    email: req.user.email,
    date: { $gte: startDate }
  });

  let income = 0;
  let expense = 0;

  entries.forEach(e => {
    if (e.type === "income") income += e.amount;
    else expense += e.amount;
  });

  res.json({
    income,
    expense,
    profit: income - expense
  });
});
