//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require('lodash');
require('dotenv').config()

const app = express();

const port = process.env.PORT||3000 

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const uri = "mongodb+srv://"+process.env.NAME+":"+process.env.PASSWORD+"@cluster0.zjypaj2.mongodb.net/todolistDB"

// await mongoose.connect(uri)
//   .then(() => {
//     console.log('Connected to MongoDB Atlas');
//   })
//   .catch((error) => {
//     console.error('Error connecting to MongoDB Atlas:', error);
//   });

  try {
    await mongoose.connect(uri,options);
  } catch (error) {
    handleError(error);
  }

// mongoose.connect('mongodb+srv://akashava50:Akash8050@cluster0.zjypaj2.mongodb.net/todolistDB',{
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('Connected!'))
//   .catch(function(err){
//     console.log(err);
//   })

  const itemsSchema = new mongoose.Schema({
      name:{
        type:String,
        required:true
      }
  })

  const Item = mongoose.model("Item",itemsSchema) 

  const item1 = new Item({
    name:"Welcome to your todolist!"
  })

  const item2 = new Item({
    name:"Hit the + button to add a new Item"
  })

  const item3 = new Item({
    name:"<-- Hit this to delete an Item"
  })

  const defaultItems = [item1,item2,item3]

  const listSchema = new mongoose.Schema({
    name:String,
    items:[itemsSchema]
  })

  const List = mongoose.model("List",listSchema)


app.get("/", function(req, res) {
  
  Item.find({})
  .then(function(items){
    if(items.length===0){
         Item.insertMany(defaultItems)
         .then(function(){
         console.log("Inserted Many Items");
         })
        .catch(function(err){
        console.log(err);
       })
       res.redirect("/")
    }else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  
  })
  .catch(function(err){
    console.log(err);
  })
});

app.get("/:customListName", function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName})
  .then(function(list){
     if(list==null){
      const list = new List({
        name:customListName,
        items:defaultItems
      })
      list.save();
      res.redirect("/"+list.name)
     }else{
      res.render("list", {listTitle: list.name, newListItems: list.items});
     }
  })
 .catch(function(err){
  console.log(err);
 })

 
  
 });

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox
  const listName = req.body.listName

  if(listName=="Today"){
    Item.findByIdAndRemove(checkedItemId)
    .then(function(){
      console.log("Successfully Deleted Checked Item");
      res.redirect("/")
    })
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
    .then(function(list){
       res.redirect("/"+listName)
    })
    .catch(function(err){
      console.log(err);
    })
  }
 
})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const postItem = new Item({
    name:itemName
  })

  if(listName=="Today"){
    postItem.save()
    res.redirect('/')
  }else{
    List.findOne({name:listName})
    .then(function(list){
      list.items.push(postItem)
      list.save()
      res.redirect("/"+listName)
    })
  }
 

});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(port, function() {
  console.log("Server started on port 3000");
});
