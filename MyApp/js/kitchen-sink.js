// Init App
var myApp = new Framework7({
    modalTitle: 'Framework7',
    // Enable Material theme
    material: true,
});

// Expose Internal DOM library
var $$ = Dom7;

// Add main view
var mainView = myApp.addView('.view-main', {
});
// Add another view, which is in right panel
var rightView = myApp.addView('.view-right', {
});

// Show/hide preloader for remote ajax loaded pages
// Probably should be removed on a production/local app
$$(document).on('ajaxStart', function (e) {
    myApp.showIndicator();
});
$$(document).on('ajaxComplete', function () {
    myApp.hideIndicator();
});

// Connect to firebase
var firebaseRef = new Firebase("https://pocket-invoice.firebaseio.com");

// Get an existing session for this user, if it exists
var authData = firebaseRef.getAuth();

// If the user has previously logged in
if (authData) {
     console.log("Authenticated user with uid:", authData.uid);
} else {
    // if not logged in
    myApp.loginScreen(); // Immediately displays the login screen
}


// When the user clicks on the Login button (on the login screen)
$$('.login-screen').find('.button').on('click', function () {
    // get username & password from the form
    var email = $$('.login-screen').find('input[name="email"]').val();
    var password = $$('.login-screen').find('input[name="password"]').val();

    // Authenticate with Firebase
    firebaseRef.authWithPassword({
        "email": email, "password": password
    }, function (error, authData) {
        if (error) {
            console.log(error);
            myApp.addNotification({
                message: error
            });
        } else {
            var userID = authData.uid;
            console.log("Authenticated user with uid:", authData.uid);
            myApp.closeModal('.login-screen');
            window.location.reload();
        }
    });
});

$(document).ready(function () {
    // Click this button to bring up the registration form
    $('.register-button').click(function () {
        myApp.closeModal('.login-screen'); // Close the login modal
        $('.hidden-register-button').click();
    });
});

myApp.lineItems = [];

myApp.addItem = function () {
    var obj = {};

    obj.title = $$('#nliTitle').val();
    obj.description = $$('#nliDescription').val();
    obj.quantity = $$('#nliQuantity').val();
    obj.attr = $$('#nliAttr').val();
    obj.price = $$('#nliPrice').val();
    myApp.lineItems.push(obj);

    var template = ' <li class="swipeout"> <div class="swipeout-content"><a href="#" class="item-link item-content"> <div class="item-inner"> <div class="item-title-row"> <div class="item-title">{{title}}</div> <div class="item-after">{{price}}</div> </div> <div class="item-text">{{description}}</div> </div></a></div> <div class="swipeout-actions-right"><a href="#" data-confirm="Are you sure you want to delete this item?" class="swipeout-delete swipeout-overswipe">Delete</a></div> </li>';
    var output = "";

    myApp.lineItems.forEach(function (item) {
        var priceString = item.quantity + " " + item.attr + " x $" + item.price;
        thisTemplate = template.replace('{{title}}', item.title).replace('{{description}}', item.description).replace('{{price}}', priceString);
        output += thisTemplate
    });

    setTimeout(function () {
        $('#lineItemsOutput').html(output);
    }, 300);


};

function register () {
    var email = $$('.registration-form').find('input[type="email"]').val();
    var password = $$('.registration-form').find('input[type="password"]').val();
    console.log(email, password);

    firebaseRef.createUser({
        email: email,
        password: password
    }, function(error, userData) {
        if (error) {
            switch (error.code) {
                case "EMAIL_TAKEN":
                    console.log("The new user account cannot be created because the email is already in use.");
                    myApp.addNotification({
                        message: 'Email already in use.'
                    });
                    break;
                case "INVALID_EMAIL":
                    console.log("The specified email is not a valid email.");
                    myApp.addNotification({
                        message: 'Invalid Email.'
                    });
                    break;
                default:
                    console.log("Error creating user:", error);
            }
        } else {
            console.log("Successfully created user account with uid:", userData.uid);
            myApp.addNotification({
                message: 'Account Successfully Created.',
                button: {
                    text: 'Login',
                    color: 'yellow'
                },
                onClose: function () {
                    myApp.loginScreen(); // Display login screen
                }
            });
        }
    });
}