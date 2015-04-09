//-----define constants used
var NEW_PERSON_LABEL = "New Person";
var NEW_OCC_LABEL = "New Occasion";
var GIFT_FOR_PERSON = "PERSON";
var GIFT_FOR_OCCASION = "OCCASION";

document.addEventListener('DOMContentLoaded', function(){
                          console.log("add listner for content loaded");
                          document.addEventListener('deviceready', setup);
                          });

function setup(){
    console.log("content ready and device ready now...");
    setUpAddSaveCancelButtonListener();
    setupInitialVisiblePage();
    checkDB();
}

//------------the following function is used to open the database or set up the required table when the app opens the db
//------------for the first time;
//------------the database version parameter is empty for openDatabase so we can read the actual database version after this line
//------------is executed. If the database is opened for the first time, the version information will be empty.
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
    else
    {
        console.log("database is already in version 1.0");
    }
    
    updatePeopleList();
    updateOccasionList();
}


//----------------set up event listener for add/save/cancel buttons ------------------------------
function setUpAddSaveCancelButtonListener(){
    //-----------------------------set up event listeners for add button ---------------
    document.querySelector("#people-list h2 button").addEventListener("click", addPeople);
    document.querySelector("#occasion-list h2 button").addEventListener("click", addOccasion);
    document.querySelector("#gifts-for-person h2 button").addEventListener("click", addGiftForPerson);
    document.querySelector("#gifts-for-occasion h2 button").addEventListener("click", addGiftForOccasion);
    
    document.querySelector("#gifts-for-person input[type=button]").addEventListener("click", function(){
                                                                                    console.log("back button clicked");
                                                                                    document.querySelector("#gifts-for-person").style.display = "none";
                                                                                    document.querySelector("#people-list").style.display = "block";
                                                                                    });
    document.querySelector("#gifts-for-occasion input[type=button]").addEventListener("click", function(){
                                                                            console.log("back button clicked");
                                                                            document.querySelector("#gifts-for-occasion").style.display = "none";
                                                                            document.querySelector("#occasion-list").style.display = "block";
                                                                            });
    
    //--------set up event listener for cancel button on every modal dialog-------------
    document.querySelector("#add-person-occasion .btnCancel").addEventListener("click", function(){
                                                                               console.log("cancel button clicked");
                                                                               document.querySelector("#add-person-occasion").style.display="none";
                                                                               document.querySelector("[data-role=overlay]").style.display="none";
                                                                               });
    document.querySelector("#add-gift .btnCancel").addEventListener("click", function(){
                                                                    console.log("cancel button clicked");
                                                                    document.querySelector("#add-gift").style.display="none";
                                                                    document.querySelector("[data-role=overlay]").style.display="none";
                                                                    });
    
    //--------set up event listener for save button -------------
    document.querySelector("#add-person-occasion .btnSave").addEventListener("click", savePersonOrOccasion);
    document.querySelector("#add-gift .btnSave").addEventListener("click", saveGift);
    
    //---------set up swipe navigation between people list screen and occasion list screen ---------
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
}



//---------the following function will be invoked when user taps on the save button
//---------to create gift for a selected person or an occasion
function saveGift(){
    
    var addGiftPage = document.querySelector("#add-gift");
    var dropDownForTheOtherID = document.querySelector("#list-per-occ");
    var theOtherID = dropDownForTheOtherID.options[dropDownForTheOtherID.selectedIndex].value;
    var giftIdeaEntered = document.querySelector("#new-idea").value;
    //--------From the h3 title we can tell if we need to save people or occasion ---------
    if (addGiftPage.getAttribute("giftFor") == GIFT_FOR_PERSON) {
        if(giftIdeaEntered != "")
        {
            //save the value in the gift table
            app.db.transaction(function(trans){
                               trans.executeSql('INSERT INTO gifts(person_id, occ_id, gift_idea) VALUES(?, ?, ?)', [addGiftPage.getAttribute("personOccID"),  theOtherID,giftIdeaEntered],
                                                function(tx, rs){
                                                //do something if it works, as desired
                                                output("Added row in gift table");
                                                updateGiftListForSelectedPeople(addGiftPage.getAttribute("personOccID"), "");
                                                //------------------hide modal dialog---------
                                                document.querySelector("#add-gift").style.display="none";
                                                document.querySelector("[data-role=overlay]").style.display="none";
                                                },
                                                function(tx, err){
                                                //failed to run query
                                                output( err.message);
                                                });
                               },
                               function(){
                               //error for the transaction
                               output("The insert sql transaction for gift table failed.")
                               },
                               function(){
                               //success for the transation
                               //this function is optional
                               });
        }else{
            alert("Gift idea is empty");
            return;
        }
        
    }
    else {
        if (addGiftPage.getAttribute("giftFor") == GIFT_FOR_OCCASION) {
            //save person;
            if(giftIdeaEntered != "")
            {
                //save the value in the gift table
                app.db.transaction(function(trans){
                                   trans.executeSql('INSERT INTO gifts(person_id, occ_id, gift_idea) VALUES(?, ?, ?)', [theOtherID, addGiftPage.getAttribute("personOccID"), giftIdeaEntered],
                                                    function(tx, rs){
                                                    //do something if it works, as desired
                                                    output("Added row in gift table for selected occasion");
                                                    updateGiftListForSelectedOccasion(addGiftPage.getAttribute("personOccID"), "");
                                                    document.querySelector("#add-gift").style.display="none";
                                                    document.querySelector("[data-role=overlay]").style.display="none";
                                                    },
                                                    function(tx, err){
                                                    //failed to run query
                                                    output( err.message);
                                                    });
                                   },
                                   function(){
                                   //error for the transaction
                                   output("The insert sql transaction for gift table failed.")
                                   },
                                   function(){
                                   //success for the transation
                                   //this function is optional
                                   });
            }else{
                alert("Gift idea is empty");
                return;
            }
            
        }
    }
    
    //------------------hide modal dialog---------
    document.querySelector("#add-person-occasion").style.display="none";
    document.querySelector("[data-role=overlay]").style.display="none";
    
}

//---------the following function will be invoked when user taps on the save button
//---------to create a person or an occasion
function savePersonOrOccasion(){
    newEntityName = document.querySelector("#add-person-occasion #new-per-occ").value;
    
    //--------From the h3 title we can tell if we need to save people or occasion ---------
    if (document.querySelector("#add-person-occasion h3").innerHTML == NEW_PERSON_LABEL) {
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
        if (document.querySelector("#add-person-occasion h3").innerHTML == NEW_OCC_LABEL){
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
    
    //------------------hide modal dialog---------
    document.querySelector("#add-person-occasion").style.display="none";
    document.querySelector("[data-role=overlay]").style.display="none";
}

function setupInitialVisiblePage(){
    console.log("setup initial visible page");
    document.querySelector("#people-list").style.display  = "block";
    document.querySelector("#occasion-list").style.display = "none";
    document.querySelector("#gifts-for-person").style.display = "none";
    document.querySelector("#gifts-for-occasion").style.display = "none";
    document.querySelector("#add-gift").style.display = "none";
}

//------------the following function will be invoked when the "+" button
//------------is clicked on the people list screen
function addPeople(){
    console.log("add people clicked");
    document.querySelector("#add-person-occasion #new-per-occ").value = "";
    document.querySelector("#add-person-occasion h3").innerHTML = NEW_PERSON_LABEL;
    
    document.querySelector("#add-person-occasion").style.display="block";
    document.querySelector("[data-role=overlay]").style.display="block";
    

}

//------------the following function will be invoked when the "+" button
//------------is clicked on the occasion list screen
function addOccasion(){
    console.log("add occasion clicked");
    document.querySelector("#add-person-occasion #new-per-occ").value = "";
    document.querySelector("#add-person-occasion h3").innerHTML = NEW_OCC_LABEL;
    
    document.querySelector("#add-person-occasion").style.display="block";
    document.querySelector("[data-role=overlay]").style.display="block";
    

}

//----------The following function is invoked when the user taps on the "+" button
//----------from the gift list for selected person screen.
function addGiftForPerson(){
    //----------------set up a custom property on the addGiftPage to indicate now
    //----------------we are adding a gift for a person
    var addGiftPage = document.querySelector("#add-gift");
    addGiftPage.setAttribute("giftFor", GIFT_FOR_PERSON);
    
    //---------------read the current person id from the gift list page for person
    //---------------then assign this id to a custom property of the addGiftPage
    var list = document.querySelector("#gifts-for-person ul");
    tempSelectedPersonID = list.getAttribute("currentPersonOccID");
    addGiftPage.setAttribute("personOccID", tempSelectedPersonID);
    
    console.log("add addGiftForPerson clicked for person_id="+tempSelectedPersonID);
    
    //-----------------show modal dialog -------------
    document.querySelector("#add-gift").style.display="block";
    document.querySelector("[data-role=overlay]").style.display="block";
    
    
    //----------------set drop down list --------------
    var mySelect = document.querySelector("#list-per-occ")
    
    while( mySelect.firstChild ){
        mySelect.removeChild(mySelect.firstChild);
    }
    
    app.db.transaction(function(trans){
                       trans.executeSql("SELECT * FROM occasions ORDER BY occ_name", [],
                                        function(tx, rs){
                                        //success
                                        var numStuff = rs.rows.length;
                                        console.log("found "+numStuff+" occasions");
                                        for(var i=0; i<numStuff; i++){
                                        var option = document.createElement("option");
                                        option.value =rs.rows.item(i).occ_id;
                                        option.text = rs.rows.item(i).occ_name;
                                        console.log("added 1");
                                        mySelect.appendChild(option);
                                        }
                                        
                                        output("displayed the drop down list of the occasions table")
                                        },
                                        function(tx, err){
                                        //error
                                        output("transaction to get drop down contents of occasion failed")
                                        });
                       });
    
    document.querySelector("#new-idea").value = "";
}

//----------The following function is invoked when the user taps on the "+" button
//----------from the gift list for selected occasion screen.
function addGiftForOccasion(){
    //----------------set up a custom property on the addGiftPage to indicate now
    //----------------we are adding a gift for an occasion
    var addGiftPage = document.querySelector("#add-gift");
    addGiftPage.setAttribute("giftFor", GIFT_FOR_OCCASION);
    
    
    //---------------read the current person id from the gift list page for person
    //---------------then assign this id to a custom property of the addGiftPage
    var list = document.querySelector("#gifts-for-occasion ul");
    tempSelectedOccasionID = list.getAttribute("currentPersonOccID")
    addGiftPage.setAttribute("personOccID", tempSelectedOccasionID);
    
    
    console.log("add addGiftForOccasion clicked for occ_id="+tempSelectedOccasionID);
    
    //-----------------show modal dialog -------------
    document.querySelector("#add-gift").style.display="block";
    document.querySelector("[data-role=overlay]").style.display="block";
    
    
    //----------------set drop down list --------------
    var mySelect = document.querySelector("#list-per-occ")
    
    while( mySelect.firstChild ){
        mySelect.removeChild(mySelect.firstChild);
    }
    
    app.db.transaction(function(trans){
                       trans.executeSql("SELECT * FROM people ORDER BY person_name", [],
                                        function(tx, rs){
                                        //success
                                        var numStuff = rs.rows.length;
                                        console.log("found "+numStuff+" people");
                                        for(var i=0; i<numStuff; i++){
                                        var option = document.createElement("option");
                                        option.value =rs.rows.item(i).person_id;
                                        option.text = rs.rows.item(i).person_name;
                                        console.log("added 1");
                                        mySelect.appendChild(option);
                                        }
                                        
                                        output("displayed the drop down list of the person table")
                                        },
                                        function(tx, err){
                                        //error
                                        output("transaction to get drop down contents of person failed")
                                        });
                       });
    document.querySelector("#new-idea").value="";
}

function output(msg){
    console.log(msg);
}



//-----------------------the following function will be invoked when user taps on any people from the people list screen
//-----------------------it will show the user a gift list screen for the selected people
function updateGiftListForSelectedPeople(personID, personName){
    //------need to show modal dialog here ---------
    document.querySelector("#gifts-for-person").style.display = "block";
    document.querySelector("#people-list").style.display ="none";
    
    if (personName!="")
    {
        document.querySelector("#gifts-for-person .details").innerHTML = "Here are all the gifts ideas for <span>"+personName+"</span> for all occasions.";
    }
    else
    {
        //--------when invoked by adding a new gift for the current selected person, we don't
        //-------need to update the person name
    }
    
    list = document.querySelector("#gifts-for-person ul");
    list.setAttribute("currentPersonOccID", personID)
    //----empty ul ----
    while( list.firstChild ){
        list.removeChild( list.firstChild );
    }
    
    app.db.transaction(function(trans){
                       trans.executeSql("SELECT gifts.*, occasions.occ_name FROM gifts left join occasions on gifts.occ_id = occasions.occ_id where person_id=?", [personID],
                                        function(tx, rs){
                                        //success
                                        var numStuff = rs.rows.length;
                                        console.log("found "+numStuff+" gifts");
                                        for(var i=0; i<numStuff; i++){
                                        var li = document.createElement("li");
                                        li.innerHTML = rs.rows.item(i).gift_idea + " -- " + rs.rows.item(i).occ_name;
                                        li.setAttribute("id", rs.rows.item(i).gift_id);
                                        if (rs.rows.item(i).purchased == 1)
                                        {
                                        li.setAttribute("class", "selected");
                                        }
                                        else{
                                        li.setAttribute("class", "");
                                        }
                                        
                                        var mcForGiftOfSelectedPeople = new Hammer.Manager(li);
                                        mcForGiftOfSelectedPeople.add( new Hammer.Tap({ event: 'doubletap', taps: 2, threshold: 5, posThreshold: 30}) );
                                        // Single tap recognizer
                                        mcForGiftOfSelectedPeople.add( new Hammer.Tap({ event: 'singletap' , taps: 1, threshold: 5}) );
                                        mcForGiftOfSelectedPeople.get('doubletap').recognizeWith('singletap');
                                        mcForGiftOfSelectedPeople.get('singletap').requireFailure('doubletap');
                                        mcForGiftOfSelectedPeople.on("singletap doubletap", function(ev) {
                                                                     console.log("singletap/doubletap invoked on gift list for selected people.");
                                                                     curSelectedGiftIndex = ev.target.getAttribute("id");
                                                                     console.log("giftid = "+curSelectedGiftIndex);
                                                                     if (ev.type == "singletap")
                                                                     {
                                                                     app.db.transaction(function(trans){
                                                                                        //console.log("UPDATE gifts SET purchased = 1 where gift_id = ?");
                                                                                        trans.executeSql("UPDATE gifts SET purchased = CASE WHEN(purchased <> 1) THEN (1) ELSE (0)  END WHERE gift_id = ?", [curSelectedGiftIndex],
                                                                                                         function(tx, rs){
                                                                                                         //success
                                                                                                         console.log("updated one gift");
                                                                                                         //update the current list;
                                                                                                         updateGiftListForSelectedPeople(personID, personName);
                                                                                                         },
                                                                                                         function(tx, err){
                                                                                                         //error
                                                                                                         output("transaction to update a gift failed")
                                                                                                         });
                                                                                        });

                                                                     }
                                                                     else if (ev.type=="doubletap")
                                                                     {
                                                                     app.db.transaction(function(trans){
                                                                                        trans.executeSql("DELETE FROM gifts where gift_id = ?", [curSelectedGiftIndex],
                                                                                                         function(tx, rs){
                                                                                                         //success
                                                                                                         console.log("deleted one gift");
                                                                                                         //update the current list;
                                                                                                         updateGiftListForSelectedPeople(personID, personName);
                                                                                                         },
                                                                                                         function(tx, err){
                                                                                                         //error
                                                                                                         output("transaction to list contents of selected people's gifts failed")
                                                                                                         });
                                                                                        });
                                                                     }
                                                                     });
                                        
                                        list.appendChild(li);
                                        }
                                        output("displayed the current selected people's gift list")
                                        },
                                        function(tx, err){
                                        //error
                                        output("transaction to list contents of selected people's gifts failed.")
                                        });
                       });
    
}


//-----------------------the following function will be invoked when user taps on any occasion from the occasion list screen
//-----------------------it will show the user a gift list screen for the selected occasion

function updateGiftListForSelectedOccasion(occasionID, occasionName){
    //------need to show modal dialog here ---------
    document.querySelector("#gifts-for-occasion").style.display = "block";
    document.querySelector("#occasion-list").style.display ="none";
    
    
    if (occasionName!="") {
        document.querySelector("#gifts-for-occasion .details").innerHTML = "Here are all the gift ideas for <span>"+occasionName+"</span> for all people.";
    }
    else
    {
        //--------when invoked by adding a new gift for the current selected person, we don't
        //-------need to update the person name
    }
    list = document.querySelector("#gifts-for-occasion ul");
    list.setAttribute("currentPersonOccID", occasionID)
    //----empty ul ----
    while( list.firstChild ){
        list.removeChild( list.firstChild );
    }
    
    app.db.transaction(function(trans){
                       trans.executeSql("SELECT gifts.*, people.person_name FROM gifts  left join people on gifts.person_id = people.person_id where occ_id=?", [occasionID],
                                        function(tx, rs){
                                        //success
                                        var numStuff = rs.rows.length;
                                        console.log("found "+numStuff+" gifts");
                                        for(var i=0; i<numStuff; i++){
                                        var li = document.createElement("li");
                                        li.innerHTML = rs.rows.item(i).gift_idea + " -- " + rs.rows.item(i).person_name;
                                        li.setAttribute("id", rs.rows.item(i).gift_id);

                                        if (rs.rows.item(i).purchased == 1)
                                        {
                                        li.setAttribute("class", "selected");
                                        }
                                        else{
                                        li.setAttribute("class", "");
                                        }
                                        
                                        var mcForGiftOfSelectedPeople = new Hammer.Manager(li);
                                        mcForGiftOfSelectedPeople.add( new Hammer.Tap({ event: 'doubletap', taps: 2, threshold: 5, posThreshold: 30}) );
                                        // Single tap recognizer
                                        mcForGiftOfSelectedPeople.add( new Hammer.Tap({ event: 'singletap' , taps: 1, threshold: 5}) );
                                        mcForGiftOfSelectedPeople.get('doubletap').recognizeWith('singletap');
                                        mcForGiftOfSelectedPeople.get('singletap').requireFailure('doubletap');
                                        mcForGiftOfSelectedPeople.on("singletap doubletap", function(ev) {
                                                                     console.log("singletap/doubletap invoked on gift list for selected people.");
                                                                     curSelectedGiftIndex = ev.target.getAttribute("id");
                                                                     console.log("giftid = "+curSelectedGiftIndex);
                                                                     if (ev.type == "singletap")
                                                                     {
                                                                     app.db.transaction(function(trans){
                                                                                        //console.log("UPDATE gifts SET purchased = 1 where gift_id = ?");
                                                                                        trans.executeSql("UPDATE gifts SET purchased = CASE WHEN(purchased <> 1) THEN (1) ELSE (0)  END WHERE gift_id = ?", [curSelectedGiftIndex],
                                                                                                         function(tx, rs){
                                                                                                         //success
                                                                                                         console.log("updated one gift");
                                                                                                         //update the current list;
                                                                                                         updateGiftListForSelectedOccasion(occasionID, occasionName);
                                                                                                         },
                                                                                                         function(tx, err){
                                                                                                         //error
                                                                                                         output("transaction to update a gift failed")
                                                                                                         });
                                                                                        });
                                                                     }
                                                                     else if (ev.type=="doubletap")
                                                                     {
                                                                     app.db.transaction(function(trans){
                                                                                        trans.executeSql("DELETE FROM gifts WHERE gift_id = ?", [curSelectedGiftIndex],
                                                                                                         function(tx, rs){
                                                                                                         //success
                                                                                                         console.log("deleted one gift");
                                                                                                         //update the current list;
                                                                                                         updateGiftListForSelectedOccasion(occasionID, occasionName);
                                                                                                         },
                                                                                                         function(tx, err){
                                                                                                         //error
                                                                                                         output("transaction to list contents of selected occasion's gifts failed")
                                                                                                         });
                                                                                        });
                                                                     }
                                                                     });
                                        
                                        list.appendChild(li);
                                        }
                                        output("displayed the current selected occasion's gift list")
                                        },
                                        function(tx, err){
                                        //error
                                        output("transaction to list contents of selected occasion's gifts failed.")
                                        });
                       });
    
}



//----------the following function will be invoked to show the user a screen with list of people
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
                                        li.setAttribute("id", rs.rows.item(i).person_id);
                                        
                                        var mcForPeople = new Hammer.Manager(li);
                                        mcForPeople.add( new Hammer.Tap({ event: 'doubletap', taps: 2, threshold: 5, posThreshold: 30}) );
                                        // Single tap recognizer
                                        mcForPeople.add( new Hammer.Tap({ event: 'singletap' , taps: 1, threshold: 5}) );
                                        mcForPeople.get('doubletap').recognizeWith('singletap');
                                        mcForPeople.get('singletap').requireFailure('doubletap');
                                        mcForPeople.on("singletap doubletap", function(ev) {
                                                       console.log("singletap/doubletap invoked");
                                                       curSelectedIndex = ev.target.getAttribute("id");
                                                       console.log("peopleid = "+curSelectedIndex);
                                                       if (ev.type == "singletap")
                                                       {
                                                       updateGiftListForSelectedPeople(curSelectedIndex, ev.target.innerHTML);
                                                       }
                                                       else if (ev.type=="doubletap")
                                                       {
                                                       //delete the tapped people
                                                       app.db.transaction(function(trans){
                                                                          trans.executeSql("DELETE FROM people where person_id = ?", [ev.target.getAttribute("id")],
                                                                                           function(tx, rs){
                                                                                           //success
                                                                                           console.log("deleted one person");
                                                                                           output("displayed the current contents of the people table")
                                                                                           },
                                                                                           function(tx, err){
                                                                                           //error
                                                                                           output("transaction to list contents of people failed")
                                                                                           });
                                                                          });
                                                       updatePeopleList();
                                                       }
                                                       });
                                        
                                        list.appendChild(li);
                                        }
                                        output("displayed the current contents of the people table")
                                        },
                                        function(tx, err){
                                        //error
                                        output("transaction to list contents of people failed")
                                        });
                       });
}

//---------------the following function will be used to show the user a screen with a list of occasions
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
                                        li.setAttribute("id", rs.rows.item(i).occ_id);
                                        
                                        var mcForOccasion = new Hammer.Manager(li);
                                        mcForOccasion.add( new Hammer.Tap({ event: 'doubletap', taps: 2, threshold: 5, posThreshold: 30}) );
                                        // Single tap recognizer
                                        mcForOccasion.add( new Hammer.Tap({ event: 'singletap' , taps: 1, threshold: 5}) );
                                        mcForOccasion.get('doubletap').recognizeWith('singletap');
                                        mcForOccasion.get('singletap').requireFailure('doubletap');
                                        mcForOccasion.on("singletap doubletap", function(ev) {
                                                         console.log("singletap/doubletap invoked");
                                                         curSelectedIndex = ev.target.getAttribute("id");
                                                         console.log("occasionid = "+curSelectedIndex);
                                                         if (ev.type == "singletap")
                                                         {
                                                         updateGiftListForSelectedOccasion(curSelectedIndex, ev.target.innerHTML);
                                                         }
                                                         else if (ev.type=="doubletap")
                                                         {
                                                         //delete the tapped people
                                                         app.db.transaction(function(trans){
                                                                            trans.executeSql("DELETE FROM occasions where occ_id = ?", [ev.target.getAttribute("id")],
                                                                                             function(tx, rs){
                                                                                             //success
                                                                                             console.log("deleted one occasion");
                                                                                             output("displayed the current contents of the occasions table")
                                                                                             },
                                                                                             function(tx, err){
                                                                                             //error
                                                                                             output("transaction to list contents of occasition failed")
                                                                                             });
                                                                            });
                                                         updateOccasionList();
                                                         }
                                                         });
                                        
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

