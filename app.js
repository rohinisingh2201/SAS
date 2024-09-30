const express = require("express");
const mongoose = require("mongoose");
const app = express();
const Info = require("./models/info.js");
const flash = require("connect-flash");
const path = require("path");
const session = require("express-session");
const ejsMate = require("ejs-mate");
const { name } = require("ejs");
const { log, error } = require("console");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const { isLoggedIn, saveRedirectUrl } = require("./middleware.js");
const ExpressError = require("./ExpressError.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/student";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
  secret: "mysupersecretstring",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash middleware defined
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.curr = req.user;
  next();
});

app.get("/rules", async (req, res) => {
  res.render("infos/rules.ejs");
});

app.get("/home", isLoggedIn, async (req, res) => {
  const allInfos = await Info.find({});
  // console.log(allInfos[0]._id);
  const checkGp = req.user.gpNum;
  res.render("infos/home.ejs", { allInfos, checkGp });
});

app.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

app.post("/signup", async (req, res, next) => {
  try {
    let { username, name, gpNum, password } = req.body;
    const newUser = new User({ username, name, gpNum });
    const registeredUser = await User.register(newUser, password);
    // console.log(registeredUser);

    //automatically login
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Successfully registered!!");
      res.redirect("/home");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
});

app.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

app.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    // console.log(req.user);
    // console.log(req.body.gpNum);
    // res.locals.gp = req.body.gpNum;
    // res.render("infos/home.ejs");
    req.flash("success", "Welcome! You have successfully logged in!!");
    let redirectUrl = res.locals.redirectUrl || "/home";
    res.redirect(redirectUrl);
  }
);

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have successfully logged out!");
    res.redirect("/home");
  });
});

//new register get route
app.get("/infos/register", async (req, res) => {
  // console.log(req.user);
  res.render("infos/register.ejs");
});

//post create route
app.post("/infos/register", async (req, res) => {
  try {
    let info = req.body.info;
    const newInfo = new Info(info);
    await newInfo.save();
    res.redirect("/home");
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/home");
  }

  // console.log(info);
});

// Function to fetch and calculate minimum effort
async function getMinEffort(gpNum, round) {
  // console.log(context,"fiuehrufh");
  // console.log(effort,"fiuehrufh");

  try {
    // Fetch efforts for the given group
    // const {gpNum,round, effort} = context
    const groupEfforts = await Info.find({ gpNum: gpNum });
    // const gpEffort = await Info.find({});
    // console.log(groupEfforts);

    // console.log(groupEfforts);
    // console.log(round);

    // if (groupEfforts.length < 3 || groupEfforts.length > 5) {
    //     return { error: 'Group must have 3 to 5 people.' };
    // }

    let minEffort = Infinity; // Start with a high initial value

    for (var entry of groupEfforts) {
      const key = "effort" + round;
      minEffort = Math.min(minEffort, entry[key]);
    }

    var cumSum = 0;
    for (var i = 1; i <= round; i++) {
      // const groupEfforts = await Info.find({ gpNum: gpNum});
      var minPrev = Infinity;
      for (var entry of groupEfforts) {
        // console.log(entry);

        const key = "effort" + i;
        // console.log(entry[key]);
        minPrev = Math.min(minPrev, entry[key]);
        // console.log(minPrev,i);
      }
      cumSum += minPrev;
    }
    // console.log(cumSum);

    //         for(const entry of groupEfforts) {
    //           for (let round = 1; round <= 12; round++) {
    //             const key = "effort"+round;
    //             // console.log(entry[key]);
    //             minEffort = Math.min(minEffort, entry[key]);
    //           }
    //         }

    // console.log(minEffort);
    return { minEffort, cumSum, round };
  } catch (err) {
    console.log(err);
  }
}

//input form
app.get("/infos/:id", isLoggedIn, async (req, res) => {
  let { id } = req.params;
  const info = await Info.findById(id);
  // const allInfos = await Info.find({});
  // const score = await Info.findById(id).populate("name");
  // if(!score) {
  //   req.flash("error", "does not exist");
  //   res.redirect("/infos");
  // }
  // console.log(score);
  // res.locals.actualGp = info.name;
  const a = info.gpNum;
  req.actualGp = a;
  res.render("infos/index.ejs", { info });
});

//handle form submission
app.post("/infos/:id", async (req, res) => {
  let { id } = req.params;
  const info = await Info.findById(id);
  let { gpNum, round } = req.body;
  const a = info.gpNum;

  // console.log(req.body);

  const result = await getMinEffort(gpNum, round);
  result.minEffort = result.minEffort;

  if (a == gpNum) {
    res.render("infos/result.ejs", { result, gpNum });
  } else {
    req.flash("error", "You have entered wrong group number");
    let redirectUrl = res.locals.redirectUrl || "/home";
    res.redirect(redirectUrl);
  }
});

//error handling middleware
app.use((err, req, res, next) => {
  let { status = 500, message = "Some error occured" } = err;
  res.status(status).send(message);
});

//display min post route
// app.post("/infos", (req, res) => {
//     console.log(req.body);
//     res.send("standard post response");
// })

app.listen(8080, () => {
  console.log("server is listening on port 8080");
});
