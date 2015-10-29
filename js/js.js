$(document).ready(function() {

  // Prepare
  var History = window.History; // Note: We are using a capital H instead of a lower h
  if (!History.enabled) {
    // History.js is disabled for this browser.
    // This is because we can optionally choose to support HTML4 browsers or not.
    return false;
  }

  // Bind to StateChange Event
  History.Adapter.bind(window, 'statechange', function() { // Note: We are using statechange instead of popstate
    var State = History.getState();
    if (State.internal) {
      var url = State.url;
      loadpage(url);
    } else {}

  });

  var isloading = 0;
  var titlePage;

  // Background Image
  $.backstretch(["images/home/liam-wright-home-05.jpg",
    "images/home/liam-wright-home-10.jpg",
    "images/home/liam-wright-home-01.jpg",
    "images/home/liam-wright-home-09.jpg",
    "images/home/liam-wright-home-11.jpg",
    "images/home/liam-wright-home-03.jpg",
    "images/home/liam-wright-home-02.jpg",
    "images/home/liam-wright-home-04.jpg"
  ], {
    duration: 5000,
    fade: "slow"
  });

  // Highlight menu
  //  highlightCurrentPage();

  $('body').on('click', '.nav li a', function(event) {
    //first animate the header dom element to fix to the left
    $('header').stop(true, true)
      .animate({
        left: '98px'
      }, 1000, function() {
        $('.content').fadeTo("slow", 1);
      })
      .animate({
        height: '100%',
        top: '0px'
      }, 1000);

    $(this).parents('.nav').find('.active').removeClass('active').end()
      .end().addClass('active');

    //invoke ajax loadpage with url
    if (isloading !== 1) {
      var url = $(this).attr('href');
      loadpage(url);
    }
    //return false to prevent dom bubbling
    return false;
  });

  $('body').on('click', '#logo', function(event) {
    //first animate the header dom element to fix to the left
    $('header').stop(true, true)
      .animate({
        left: '50%'
      }, 1000, function() {
        $('.content').fadeTo("slow", 0);
      })
      .animate({
        height: '550px',
        top: '10%'
    }, 1000);

    //invoke ajax loadpage with url
    if (isloading !== 1) {
      loadpage("/");
    }
    //return false to prevent dom bubbling
    return false;
  });

});

function loadpage(url) {
  var titlePage;
  isloading = 1;

  toLoad = 'index.html .' + url + ' > *';
  console.log(toLoad);
  $('.content').innerHTML = "";
  $('.content').load(toLoad, function(response, status, xhr) {
    if (status == "error") {
      var msg = "Sorry but there was an error: ";
      $(".content").html(msg + xhr.status + " " + xhr.statusText);
      History.pushState('/404', document.title +
        " | Liam Wright Photography", '/404');
    } else {
      var dataPage = $(response),
        titlePage = dataPage.filter("title").text();
      document.title = titlePage;
      History.pushState(url, titlePage, url);
      //  _gaq.push(['_trackPageview', url]);
      inject();
    }

  });
}

function inject() {
  isloading = 0;
  pages = window.location.pathname.split('/');
  page = window.location.pathname.split('/').pop();

  if ($.inArray("contact", pages) > -1) {
    $('.message').one("keypress", function() {
      $('.name').fadeIn();
    });
    $('.name').one("keypress", function() {
      $('.email').fadeIn();
      $('.tel').fadeIn();
      $('.submit').fadeIn();
      console.log('keypress');
    });
    initform();
  }

  if ($.inArray("portraits", pages) > -1 || $.inArray("fashion", pages) > -1 ||
    $.inArray("weddings", pages) > -1) {
    $('.fancybox').fancybox();
    var $grid = $('.grid').imagesLoaded(function() {
      $grid.masonry({
        itemSelector: '.grid-item',
        percentPosition: true,
        columnWidth: '.grid-sizer'
      });
    });
    $('.fancybox').fancybox();
  }
}

pages = window.location.pathname.split('/');
page = window.location.pathname.split('/').pop();
if (page !== '') {
  //page isn't home
  $('header').stop(true, true)
    .animate({
      left: '98px'
    }, 1000, function() {
      $('.content').fadeTo("slow", 1);
    })
    .animate({
      height: '100%',
      top: '0px'
    }, 1000);
}

inject();

function initform() {

  $(".submit").click(function(event) {
    event.preventDefault();
    var proceed = true;
    //simple validation at clients end
    //loop through each field and we simply change border color to red for invalid fields
    $(".contact input, .contact textarea").each(function() {

      $(this).css('border', '');
      if (!$(this).val()) { //if this field is empty
        $(this).attr("placeholder", "Please enter your " + $(this).attr(
          "name"));
        $(this).css('border-bottom', '1px solid red'); //change border color to red
        $('.submit').css('background-color', 'rgb(202, 42, 42)'); //change background color to red
        proceed = false; //set do not proceed flag
      }
    });

    if (proceed) //everything looks good! proceed...
    {
      //get input field values data to be sent to server
      post_data = {
        'name': $('input[name=name]').val(),
        'email': $('input[name=email]').val(),
        'tel': $('input[name=tel]').val(),
        'message': $('textarea[name=message]').val()
      };

      //Ajax post data to server
      $.post('/contact.php', post_data, function(response) {
        if (response.type == 'error') { //load json data from server and output message
          output = '<div class="error">' + response.text + '</div>';
          $('.contact [name="' + response.field + '"]').css(
            'border-bottom', '1px solid red'); //change border color to red
          $('.contact .submit').css('background-color',
            'rgb(202, 42, 42)'); //change background color to red

        } else {
          output = '<div class="success"><h3>' + response.text +
            '</h3></div>';
          //reset values in all input fields
          $(".contact input, .contact textarea").val('');


        }
        $(".contact").html(output);
      }, 'json');
    } else {}
  });

  //reset previously set border colors and hide all message on .keyup()
  $(".contact input, .contact textarea").keyup(function() {
    $(this).css('border', '2px solid #004b6c');
    $('.submit').css('background-color', '#fff'); //change background color to red
  });
}
