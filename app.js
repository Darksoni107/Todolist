const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const _capitalize = require("lodash/capitalize");

const app = express();
const port = 3000;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose
  .connect(
    "mongodb+srv://divyanshSoni:8290485588@cluster.jnp4jpz.mongodb.net/todolistDB"
  )
  .then(() => {
    console.log("Succefully connected to Database.");
  })
  .catch(console.error);

const itemsSchema = new Schema({
  task: String,
});
const listSchema = new Schema({
  listName: String,
  items: [itemsSchema],
});

const Item = mongoose.model("item", itemsSchema);
const List = mongoose.model("list", listSchema);

const item1 = new Item({ task: "Welcome to todolist!" });
const item2 = new Item({ task: "Hit the + button to add task" });
const item3 = new Item({ task: "<-- Hit this to delete task" });

const defualtItems = [item1, item2, item3];

app.get("/", async (req, res) => {
  const items_list = await Item.find();
  if (items_list.length === 0) {
    await Item.insertMany(defualtItems);
    res.redirect("/");
  } else {
    res.render("list", { listTitle: "Today", newListItems: items_list });
  }
});

app.get("/:customListName", async (req, res) => {
  const customListName = _capitalize(req.params.customListName);
  let findList = await List.findOne({ listName: customListName });
  if (!findList) {
    const list = new List({
      listName: customListName,
      items: defualtItems,
    });
    await List.insertMany([list]).then(() => console.log("succefully added"));
    res.redirect("/" + customListName);
  } else
    res.render("list", {
      listTitle: customListName,
      newListItems: findList.items,
    });
});

app.post("/", async (req, res) => {
  const listName = req.body.list;
  const task = new Item({ task: req.body.newItem });
  if (listName === "Today") {
    await Item.insertMany([task]);
    res.redirect("/");
  } else {
    await List.findOneAndUpdate(
      { listName: listName },
      { $push: { items: task } }
    );
    res.redirect("/" + listName);
  }
});

// for delteting
app.post("/delete", async (req, res) => {
  const task_to_deleteID = req.body.taskId;
  const listTitle = req.body.list;

  if (listTitle === "Today") {
    await Item.findByIdAndDelete(task_to_deleteID);
    res.redirect("/");
  } else {
    await List.findOneAndUpdate(
      { listName: listTitle },
      { $pull: { items: { _id: task_to_deleteID } } }
    );
    res.redirect("/" + listTitle);
  }
});
app.listen(process.env.PORT || port,()=> console.log("Listnening on port " ,port))
