
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//const items = ["Buy Food", "Cook Food", "Eat Food"];

mongoose.connect("mongodb+srv://admin-manish:asd123@cluster0-gg3qb.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true, useFindAndModify: false});
//const workItems = [];

const itemSchema = {
  name : String
};

const Item=mongoose.model("Item",itemSchema);

const item1 = new Item({name:'BuyFood'});
const item2 = new Item({name:'CookFood'});
const item3 = new Item({name:'EatFood'});

const defaultItems=[item1,item2,item3];

// Item.insertMany(defaultItems,function(err){
//   if(err){console.log(err);}
//   else{console.log("succesfully inserted item to database");}
// });

const listSchema = {
  name : String,
  items: [itemSchema]
};

const List=mongoose.model("List",listSchema);


app.get("/", function(req, res) {

  Item.find({},function(err,itemfound){
    if(itemfound.length==0){
      Item.insertMany(defaultItems,function(err){
        if(err){console.log(err);}
        else{console.log("succesfully inserted item to database");
             mongoose.connection.close;}
      });
      res.redirect("/");
    }
    else{
        res.render("list", {listTitle: "Today", newListItems:itemfound});
      }
});
});

app.get("/:customListName",function(req,res){
   const customListName= _.capitalize(req.params.customListName);
   // const list= new List({
   //    name :customListName,
   //    items: defaultItems
   // }):

   // list.save();
   List.findOne({name: customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //crate a new list
        const list=new List({
          name : customListName,
          items : defaultItems
        });

        list.save();

        res.redirect("/" + customListName);
      }else{

          //show an existing list
          res.render("list",{listTitle:foundList.name,newListItems:foundList.items})
   }}
 });

});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item=new Item({
    name : itemName
  });

  if(listName ==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
    }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req,res){

  const checkboxID=req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkboxID,function(err){
    if(err){console.log(err);}
    else{
      res.redirect("/");
    }
  });
  }else{
      // go to custom list and find the particular data and delete 
      // customlist is array of list
      // look for the element in the array

      List.findOneAndUpdate({name :listName } , {$pull :{items:{_id: checkboxID}}},function(err,foundList){
        if(!err){
          res.redirect("/" + listName);
        }
      });
    }
  
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//   res.render("about");
// });

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on selected port");
});




// This is dynamic todolist 
// u can make any listName with any name
// data remain store
// Adding facility
// Deleting facility
// Searching facility 
