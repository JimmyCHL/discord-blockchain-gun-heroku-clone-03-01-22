import express from "express";
import Gun from "gun";
import cors from "cors";

//What is the Procfile in Heroku?
//Heroku apps include a Procfile that specifies the commands that are executed by the app on startup. You can use a Procfile to declare a variety of process types, including: Your app's web server. Multiple types of worker processes.

const app = express();
//heroku would assign random port so you can not have fix port
const port = process.env.PORT || 5000;

app.use(cors());

app.use(Gun.serve);

app.get("/", (req, res) => {
  res.status(200).send("> DEBUG: Discord Node is Live");
});

const server = app.listen(port, () => {
  console.log(`> DEBUG: Discord Node is listening at http://localhost:${port}`);
});

Gun({ web: server });
