// Budget (Data) Controller 
var budgetController = (function(){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
        
    };
    Expense.prototype.calculatePercentage = function(totalIncome){
        if (totalIncome > 0){
            this.percentage =  Math.round((this.value/totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
        
    };
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    //calculate the total income or expense
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(currentItem){
            sum = sum + currentItem.value;
        });
        data.totals[type] = sum;
    };
    
    //The Object item list array[][]
    var data = {
        allItems:{
            //the name of items list should be type
            inc: [],
            exp: []
        },
        totals:{
            inc: 0,
            exp: 0
        },
        budget: 0,
        //The -1 means 'not exist'
        percentage: -1
    };
    return {
        addItem: function(type, des, val){
            var newItem, id;
            //Create new ID
            if(data.allItems[type].length > 0 ){
                id = data.allItems[type][data.allItems[type].length - 1].id +1; 
            } else {
                id = 0;
            }
            
            //Create the new item on 'inc' or 'exp' type
            if(type === 'exp'){
               newItem = new Expense(id, des, val);
               } else if (type ==='inc') {
                   newItem = new Income(id, des, val);
               }
            
            data.allItems[type].push(newItem);
            
            return newItem;
        },
        deleteItem: function(type, id){
            //cannot use data.allItems[type][id];
            //[1 3 5 7 8] if id = 3, then we will delete 7, since the index 3 is 7
            var getIDsFromList, index; 
            
            getIDsFromList = data.allItems[type].map(function(current){
                return current.id;
            });
            
            index = getIDsFromList.indexOf(id);
            if (index !== -1){
                data.allItems[type].splice(index, 1);
                }
            
        },
        
        calculateBudget: function(){
            //calculate the incomes, expense,  budget and the percentage of income we spent
            //calculate the total income and total expense
            calculateTotal('inc');
            calculateTotal('exp');
            //calculate the total budget
            data.budget = data.totals.inc - data.totals.exp;
            //calculate the percentage of income we spent
            
            if (data.totals.inc > 0){
               data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); 
            } else {
                data.percentage = -1;
            }
            
        },
        calculatePercentage: function(){
              data.allItems.exp.forEach(function(current){
                 current.calculatePercentage(data.totals.inc);
              });
        },
        getPercentage: function(){
            var allPercentage = data.allItems.exp.map(function(current){
                return current.getPercentage(); 
            });
            return allPercentage;
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp,
                percentage: data.percentage
            }  
        },
        
        //Use to testing during coding
        testing: function(){
            console.log(data);
        }
    };
    
})();


//User Interface controller 
var UIController = (function(){
    
    //DOM String, the classes name from html part
    var DOMstrings = {
        inputType: '.add__type',  
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLable: '.budget__value',
        incomeLable: '.budget__income--value',
        expensesLable: '.budget__expenses--value',
        percentageLable: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentLable: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    var formatNumber = function(num, type){
            //Make the value of items look better
            var num, numSplit, int, dec, type;
            //Make the value like 200.13
            num = Math.abs(num); //absolute number
            num = num.toFixed(2);// 2 decimal number 
            
            //
            numSplit = num.split('.');
            int = numSplit[0];
            if (int.length > 3){
                //cannot use 
                //int = int.substr(0, 1) + ',' + int.substr(1, 3);
                //would be show 25130 to 2,5130
                
                //make the value like 31215 to 31,215
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }
            
            dec = numSplit[1];
            
            //return the value like + 12,134.13
            return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
        };
        var nodeListForEach = function(list, callback){
                for(var i = 0; i < list.length; i++){
                    callback(list[i], i);
                }
            };
    
    return {
        getinput: function(){
            
            return{
            //To see that the input is income or expense
            type: document.querySelector(DOMstrings.inputType).value,    
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
            
        },
        addListItems: function(obj, type){
            //To do list
            //Create HTML part(string) with placeholder text here
            //Replace the placeholder text with some actual data
            // Insert the HTML into DOM
            var html, newHTML, element;
            
            if (type === 'inc'){
                
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp'){
                       
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //replace the html string with actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));
            
            //put the html string into element(class name)
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);       
        },
        clearFields: function(){
            var fields;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            //cannot use fields.slice()
            var fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function(current, index, array){
                current.value = "";
                
            });
            //To focus the input back to the description text field
            fieldsArray[0].focus();
        },
        //Delete the item from the user interface
        deleteListItems: function(selectorID){
            //document.getElementById(selectorID).parentNode.removeChild(document.getElementById(selectorID));
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        displayBudget: function(obj){
            //show the total income, total expense and budget 
            
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLable).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLable).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expensesLable).textContent = formatNumber(obj.totalExpense, 'exp');
            
            //show the percentage in lable 
            if (obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLable).textContent = obj.percentage + '%'; 
                } else {
                    document.querySelector(DOMstrings.percentageLable).textContent = '--%'; 
                }
        },
        
        displayPercentage: function(percentages){
            var field = document.querySelectorAll(DOMstrings.expensesPercentLable);
            

            //display the percent in each items
            nodeListForEach(field, function(current, index){
                if (percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                   } else {
                       current.textContent = '--%';
                   }
            });
        },
        getDOMstring: function(){
            return DOMstrings;
        },
        displayMonth: function(){
            var now, month, months, year;
            now = new Date();
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        changedType: function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + 
                DOMstrings.inputDescription + ',' + 
                DOMstrings.inputValue);
            //change the color depend on the type
            nodeListForEach(fields, function(current){
                current.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        }
    };
})();


//module that connect between two controller modules
var controller = (function(budgetFun, UIFun){
        /* TO DO LIST
        Get the input data from form in HTML
        Add the input items to the budget control
        Add the input items to User interface
        Clear the input textholder after adding items
        Calculate the budget and percentage
        Return the calculated budget and percentage
        Display the calculated budget on the user interface
        */
    
    var setupEventListeners = function(){
        //If the button is clicked
        document.querySelector(DOM.inputBtn).addEventListener('click', controllerAddItem);
            //Testing the button
            /*
            console.log('Button was clicked');
            */

        //If press the Enter key
        document.addEventListener('keypress', function(event){
           if(event.keyCode === 13 || event.whick === 13){
                controllerAddItem();
              } 
        });    
        document.querySelector(DOM.container).addEventListener('click', controllerDeleterItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UIFun.changedType);
    }
    
    var DOM = UIFun.getDOMstring();
    var controllerAddItem = function(){
        var input, newItem; 
        
        //Get the input items
        var input = UIFun.getinput();
        
        //Testing the input is reading
        //console.log(input);
        
        //To vaild the input items
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
           
            

            var newItem = budgetFun.addItem(input.type, input.description, input.value);

            UIFun.addListItems(newItem, input.type); 
            //clear the input textholder 
            UIFun.clearFields();

            updateBudget();
            
            updatePercentage();
        }
    };
    var controllerDeleterItem = function(event){
        /*
        detete item from data structure
        delete item fron UI
        Update and show new budget
        */
        var itemID, splitID, type;
        //The parents of the delete button, item 
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            //Delete the list from list 
            budgetFun.deleteItem(type, ID);
            //Display the result after delete item
            UIFun.deleteListItems(itemID);
            
            updateBudget();
            updatePercentage();
        }
    };
     
    var updateBudget = function(){
        //calculate the budget 
        budgetFun.calculateBudget();
        
        //return the value
        var budget = budgetFun.getBudget();
        
        //Display the buget on the User interface
        UIFun.displayBudget(budget);
        
    };
    var updatePercentage = function(){
        //Calculate the percentage
        //Read the percentage from budget controller
        //Update the user interface with the new percentages
        
        
        budgetFun.calculatePercentage();
        var percentage = budgetFun.getPercentage();
        UIFun.displayPercentage(percentage);
    };
    
    return {
        init: function(){
            console.log('Application has started');
            UIFun.displayMonth();
            //Display the buget on the UI
            UIFun.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }
    
    

})(budgetController, UIController);

controller.init();

