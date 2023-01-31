"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_ejs_layouts_1 = __importDefault(require("express-ejs-layouts"));
const passport_1 = __importDefault(require("passport"));
const express_flash_1 = __importDefault(require("express-flash"));
const express_session_1 = __importDefault(require("express-session"));
const passport_2 = __importDefault(require("./config/passport"));
const index_1 = __importDefault(require("./routes/index"));
const submit_1 = __importDefault(require("./routes/submit"));
const fund_1 = __importDefault(require("./routes/fund"));
const startup_1 = __importDefault(require("./routes/startup"));
const admin_1 = __importDefault(require("./routes/admin"));
const onboarding_1 = __importDefault(require("./routes/onboarding"));
const check_auth_1 = require("./middleware/check-auth");
const app = (0, express_1.default)();
(0, passport_2.default)(passport_1.default);
app.use(
  (0, express_session_1.default)({
    // Key we want to keep secret which will encrypt all of our information
    secret: "12345",
    // Should we resave our session variables if nothing has changes which we dont
    resave: true,
    // Save empty value if there is no vaue which we do not want to do
    saveUninitialized: false,
  })
);
// Funtion inside passport which initializes passport
app.use(passport_1.default.initialize());
// Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport_1.default.session());
app.use((0, express_flash_1.default)());
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/login");
app.use(express_ejs_layouts_1.default);
app.use(express_1.default.static("public"));
app.use("/css", express_1.default.static(__dirname + "/public/css"));
app.use("/js", express_1.default.static(__dirname + "/public/js"));
app.use(
  "/node-modules",
  express_1.default.static(__dirname + "/../node_modules")
);
app.use("/img", express_1.default.static(__dirname + "/public/img"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/", index_1.default);
app.use(check_auth_1.checkNotAuthenticated);
app.use("/submit", submit_1.default);
app.use("/fund", fund_1.default);
app.use("/admin", admin_1.default);
app.use("/startup", startup_1.default);
app.use("/onboarding", onboarding_1.default);
app.listen(process.env.PORT || 3000);
