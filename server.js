
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcryptjs");
const path = require("path");

const User = require("./models/user");
const Message = require("./models/message");

const app = express();
app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  name: "portfolio.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions"
  }),
cookie: {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000
}
}));

app.use(express.static(path.join(__dirname, "public")));

function isAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({
      message: "Please login first"
    });
  }

  next();
}

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Registration page
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Protected dashboard
app.get("/dashboard", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  res.sendFile(
    path.join(__dirname, "private", "dashboard.html")
  );
});

// Register student
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, course, college } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all required fields"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters"
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      course,
      college
    });

    req.session.userId = user._id.toString();

    res.status(201).json({
      message: "Registration successful",
      redirect: "/dashboard"
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Registration failed"
    });
  }
});

// Login student
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Enter email and password"
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({
          message: "Could not start login session"
        });
      }

      req.session.userId = user._id.toString();

      req.session.save((saveError) => {
        if (saveError) {
          return res.status(500).json({
            message: "Could not save login session"
          });
        }

        res.json({
          message: "Login successful",
          redirect: "/dashboard"
        });
      });
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Login failed"
    });
  }
});

// Get logged-in student information
app.get("/api/me", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({
      message: "Unable to load student information"
    });
  }
});

// Contact form
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Please complete all fields"
      });
    }

    await Message.create({ name, email, message });

    res.status(201).json({
      message: "Your message has been sent successfully!"
    });

  } catch (error) {
    res.status(500).json({
      message: "Unable to send message"
    });
  }
});

// Logout
app.post("/api/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        message: "Logout failed"
      });
    }

    res.clearCookie("portfolio.sid");

    res.json({
      message: "Logged out successfully",
      redirect: "/login"
    });
  });
});

// Start server after database connection
async function startServer() {
  try {
    if (!process.env.MONGO_URI || !process.env.SESSION_SECRET) {
      throw new Error("MONGO_URI and SESSION_SECRET are required");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Atlas connected successfully!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
}

startServer();
