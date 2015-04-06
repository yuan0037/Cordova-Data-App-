document.addEventListener('DOMContentLoaded', function(){
                          console.log("add listner for content loaded");
                          document.addEventListener('deviceready', setup);
                          });

function setup(){
	console.log("content ready and device ready now...");
    setUpAddButtonListener();
    setupInitialVisiblePage();
    checkDB();
}

function setUpAddButtonListener(){
    document.querySelector("#people-list h2 button").addEventListener("click", addPeople);
    document.querySelector("#occasion-list h2 button").addEventListener("click", addOccasion);
    document.querySelector("#gifts-for-person h2 button").addEventListener("click", addGiftForPerson);
    document.querySelector("#gifts-for-occasion h2 button").addEventListener("click", addGiftForOccasion);
    
    //--------add event listener for cancel button on every modal dialog
    document.querySelector(".btnCancel").addEventListener("click", function(){
                                                      document.querySelector("[data-role=modal]").style.display="none";
                                                      document.querySelector("[data-role=overlay]").style.display="none";
                                                      });
    document.querySelector("#add-person-occasion .btnSave").addEventListener("click", savePersonOrOccasion);
    
    peoplePage = document.querySelector("#people-list");
    var mcPeople = new Hammer.Manager(peoplePage);
    mcPeople.add( new Hammer.Swipe({ event: 'swipeleft', velocity:0.3}) );
    mcPeople.on("swipeleft", function(ev) {
          console.log("swipe left detected");
          document.querySelector("#people-list").style.display = "none";
          document.querySelector("#occasion-list").style.display = "block";
          });
    
    occasionPage = document.querySelector("#occasion-list");
    var mcOccasion = new Hammer.Manager(occasionPage);
    mcOccasion.add( new Hammer.Swipe({ event: 'swiperight', velocity:0.3}) );
    mcOccasion.on("swiperight", function(ev) {
          console.log("swipe right detected");
          document.querySelector("#people-list").style.display = "block";
          document.querySelector("#occasion-list").style.display = "none";
          });
    
//    
//    giftPage = document.querySelector("#occasion-list");
//    var mc = new Hammer.Manager(peoplePage);
//    
//    // Single tap recognizer
//    mc.add( new Hammer.Tap({ event: 'singletap' , taps: 1, threshold: 5}) );
    
}

function savePersonOrOccasion(){
    newEntityName = document.querySelector("#add-person-occasion #new-per-occ").value;
    if (document.querySelector("#add-person-occasion h3").innerHTML == "New Person") {
        //save person;
        
        if(newEntityName != ""){
            //save the value in the stuff table
            app.db.transaction(function(trans){
                               trans.executeSql('INSERT INTO people(person_name) VALUES(?)', [newEntityName],
                                                function(tx, rs){
                                                //do something if it works, as desired
                                                output("Added row in people");
                                                updatePeopleList();
                                                },
                                                function(tx, err){
                                                //failed to run query
                                                output( err.message);
                                                });
                               },
                               function(){
                               //error for the transaction
                               output("The insert sql transaction for people table failed.")
                               },
                               function(){
                               //success for the transation
                               //this function is optional
                               });
        }else{
            output("Text field is empty");
        }
        
    }
    else {
        if (document.querySelector("#add-person-occasion h3").innerHTML == "New Occasion"){
            //save occasion;
            if(newEntityName != ""){
                //save the value in the stuff table
                app.db.transaction(function(trans){
                                   trans.executeSql('INSERT INTO occasions(occ_name) VALUES(?)', [newEntityName],
                                                    function(tx, rs){
                                                    //do something if it works, as desired
                                                    output("Added row in occasions");
                                                    updateOccasionList();
                                                    },
                                                    function(tx, err){
                                                    //failed to run query
                                                    output( err.message);
                                                    });
                                   },
                                   function(){
                                   //error for the transaction
                                   output("The insert sql transaction for occasion table failed.")
                                   },
                                   function(){
                                   //success for the transation
                                   //this function is optional
                                   });
            }else{
                output("Text field is empty");
            }

        }
    }
    document.querySelector("[data-role=modal]").style.display="none";
    document.querySelector("[data-role=overlay]").style.display="none";
}

function setupInitialVisiblePage(){
    console.log("setup initial visible page");
    document.querySelector("#people-list").style.display  = "block";
    document.querySelector("#occasion-list").style.display = "none";
    document.querySelector("#gifts-for-person").style.display = "none";
    document.querySelector("#gifts-for-occasion").style.display = "none";
}

function addPeople(){
    console.log("add people clicked");
    document.querySelector("#add-person-occasion #new-per-occ").value = "";
    document.querySelector("#add-person-occasion h3").innerHTML = "New Person";
    
    document.querySelector("#add-person-occasion").style.display="block";
    document.querySelector("[data-role=overlay]").style.display="block";
}

function addOccasion(){
    console.log("add occasion clicked");
    document.querySelector("#add-person-occasion #new-per-occ").value = "";
    document.querySelector("#add-person-occasion h3").innerHTML = "New Occasion";
    
    document.querySelector("#add-person-occasion").style.display="block";
    document.querySelector("[data-role=overlay]").style.display="block";
}

function addGiftForPerson(){
    console.log("add addGiftForPerson clicked");
}

function addGiftForOccasion(){
    console.log("add addGiftForOccasion clicked");
}

function output(msg){
    console.log(msg);
}

function checkDB(){
    app.db = openDatabase('giftrdb', '', 'Giftr Database', 1024*1024);
    console.log("db version = " + app.db.version);
    if (app.db.version == "")
    {
        console.log("change version starts now");
        app.db.changeVersion("", "1.0", function(trans){
                             //something to do in addition to incrementing the value
                             //otherwise your new version will be an empty DB
                             output("DB version incremented");
                             //do the initial setup
                             //create some table(s)
                             //add stuff into table(s)
                             trans.executeSql('CREATE TABLE IF NOT EXISTS people(person_id INTEGER PRIMARY KEY AUTOINCREMENT, person_name TEXT)', [],
                                              function(tx, rs){
                                              //do something if it works
                                              output("Table people	 created");
                                              },
                                              function(tx, err){
                                              //failed to run query
                                              output( err.message);
                                              });
                             trans.executeSql('CREATE TABLE  IF NOT EXISTS occasions(occ_id INTEGER PRIMARY KEY AUTOINCREMENT, occ_name TEXT)', [],
                                              function(tx, rs){
                                              //do something if it works
                                              output("Table occasions created");
                                              },
                                              function(tx, err){
                                              //failed to run query
                                              output( err.message);
                                              });
                             
                             trans.executeSql('CREATE TABLE  IF NOT EXISTS gifts(gift_id INTEGER PRIMARY KEY AUTOINCREMENT, person_id INTEGER, occ_id INTEGER, gift_idea TEXT, purchased NUMERIC)', [],
                                              function(tx, rs){
                                              //do something if it works
                                              output("Table gifts created");
                                              },
                                              function(tx, err){
                                              //failed to run query
                                              output( err.message);
                                              });
                             },
                             
                             function(err){
                             //error in changing version
                             //if the increment fails
                             output( "Change version call error " + err.message);
                             },
                             function(){
                             //successfully completed the transaction of incrementing the version number   
                             output("Change version function worked.")
                             });
    }
    else {
        console.log("database is already in version 1.0");
    }

    updatePeopleList();
    updateOccasionList();
}

function updatePeopleList(){
    console.log("updatePeopleList invoked");
    var list = document.querySelector("#people-list ul");
    list.innerHTML = "";
    //clear out the list before displaying everything
    app.db.transaction(function(trans){
                       trans.executeSql("SELECT * FROM people ORDER BY person_name", [],
                                        function(tx, rs){
                                        //success
                                        var numStuff = rs.rows.length;
                                        console.log("found "+numStuff+" people");
                                        for(var i=0; i<numStuff; i++){
                                        var li = document.createElement("li");
                                        li.innerHTML = rs.rows.item(i).person_name;
                                        list.appendChild(li);
                                        }
                                        output("displayed the current contents of the people table")
                                        }, 
                                        function(tx, err){
                                        //error
                                        output("transaction to list contents of stuff failed")
                                        });
                       });
}

function updateOccasionList(){
    console.log("updateOccasionList invoked");
    var list = document.querySelector("#occasion-list ul");
    list.innerHTML = "";
    //clear out the list before displaying everything
    app.db.transaction(function(trans){
                       trans.executeSql("SELECT * FROM occasions ORDER BY occ_name", [],
                                        function(tx, rs){
                                        //success
                                        var numStuff = rs.rows.length;
                                        console.log("found "+numStuff+" occasions");
                                        for(var i=0; i<numStuff; i++){
                                        var li = document.createElement("li");
                                        li.innerHTML = rs.rows.item(i).occ_name;
                                        list.appendChild(li);
                                        }
                                        output("displayed the current contents of the occasions table")
                                        },
                                        function(tx, err){
                                        //error
                                        output("transaction to list contents of occasition failed")
                                        });
                       });
}

