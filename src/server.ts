import app from "./app";
import connectDB from "./config/db";
import env from "./config/env";

//PORT
const PORT = env.PORT || 3000;

connectDB().then(() =>
  app.listen(PORT, () => console.log("Server running on PORT: " + PORT))
);
