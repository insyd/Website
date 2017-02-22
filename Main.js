var $origBalance = 0;
var $balance = 0;
var $currentBet = 0;
var $currentStreak = 0;
var $streakRequired = 3;
var $toPlayWith = 100;
var $origToPlaywith = 100;
var $profit = 0;
var $betColor = 'g';
var $lastResult = 'r';
var $list = "";
var $tempList = "";
var $streaking = false;
var $lastStreak = 0;
var $betPlaced = false;
var $banked = 0;
var $bankEvery = 0;
var $startTime = Date.now();

function init() {
  $streakRequired = prompt("Enter streak required before betting: ", 3);
  $balance = $(".user-balance").html();
  $origBalance = $balance;
  $toPlayWith = prompt("Enter balance to play with", $balance);
  $currentBet = Math.round($toPlayWith * Math.pow(0.5,  6));
  $bankEvery = prompt("How often to bank? (-1 for double money)",-1);
  $origToPlaywith = $toPlayWith;
  setBet($currentBet);
  $lastResult = getLastResult();
  injectUI();
  console.log("initialised");
  mainLoop();
}

function msToTime(duration) {
    var milliseconds = parseInt((duration%1000)/100)
        , seconds = parseInt((duration/1000)%60)
        , minutes = parseInt((duration/(1000*60))%60)
        , hours = parseInt((duration/(1000*60*60))%24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve,ms));
}

function injectUI() {
  $(".user-balance").parent().parent().append($("<div>").load('https://raw.githubusercontent.com/insyd/insyd.github.io/master/UI.html'));
}

function updateUI() {
  $balance = $(".user-balance").html();
  $("#JSBetUI-ToPlayWith").html("ToPlayWith: " + $toPlayWith);
  $("#JSBetUI-CurrentBet").html("CurrentBet: " + $currentBet);
  $("#JSBetUI-Profit").html("Profit: " + ($balance - $origBalance));
  $("#JSBetUI-CurrentBetTarget").html("Betting: " + $betColor);
  $("#JSBetUI-CurrentStreak").html("Streak: " + $currentStreak);
  $("#JSBetUI-Banked").html("Banked: " + $banked);
  $("#JSBetUI-RunningTime").html("Running Time: " + msToTime(Date.now()-$startTime));  
}

function setBet(i) {  
  document.getElementById("roulette-input-bet").value = Math.floor(i);
}

function placeBet(r) {
  // r = red, black, green
  switch (r) {
  case 'r':
    //id = red_button
    $("#red_button > button").click();
    break;
  case 'b':
    //id = black_button
    $("#black_button > button").click();
    break;
  case 'g':
    //id = green_button
    $("#green_button > button").click();
    break;
  }
  
}

function getLastResult() {
  $cList = $("#last-results > a")[0].classList;
  if ($cList.contains("red")) {
    return 'r';
  }
  if ($cList.contains("black")) {
    return 'b';
  }
  if ($cList.contains("green")) {
    return 'g';
  }
}

function getResult(i) {
  $cList = $("#last-results > a")[i].classList;
  if ($cList.contains("red")) {
    return 'r';
  }
  if ($cList.contains("black")) {
    return 'b';
  }
  if ($cList.contains("green")) {
    return 'g';
  }
}

function updateStreak() {
  var $last = getLastResult();
  var $lastt = '';
  var $current = '';
  $list = "";
  
  for (var i = 0; i < 8; i++) {
    $cList = $("#last-results > a")[i].classList;
    if ($cList.contains("red")) {
      $current = 'r';
    }
    if ($cList.contains("black")) {
      $current = 'b';
    }
    if ($cList.contains("green")) {
      $current = 'g';
    }
    $list = $list + $current;
    
    if ($last == $current || $current == 'g' || ($last == 'g' && i == 1) || ($last == 'g' && $current == $lastt)) {

      $currentStreak = $currentStreak + 1;
    } else {
      //console.log($lastt + " / " + $last + " / " + $current + "::" + i);
      //console.log($list);
      return;
    }
    $lastt = $last;
    $last = $current;
  }
  
}

async function mainLoop() {
  if($betPlaced == false) {
    if (getLastResult() == 'r') { $betColor = 'b'; }
    if (getLastResult() == 'b') { $betColor = 'r'; }
    if (getLastResult() == 'g') {
        var $x = 1;
        var $c = 'g';
        while ($c == 'g') {
          $c = getResult($x);
          $x = $x + 1;
        }
        if ($c == 'r') { $betColor = 'b'; }
        if ($c == 'b') { $betColor = 'r'; }
    }
  }
  
  updateUI();
  //Wait for a streak
  if ($currentStreak < $streakRequired) {
    $currentStreak = 0;
    updateStreak();
    setTimeout(mainLoop,1500);
    return;
  }
  
  //Bet opposite to streak
  if($betPlaced == false) {
    if ($currentBet > $toPlayWith) {
      console.log("Run out of money!");
      return;
    }
    setBet($currentBet);
    console.log("Placing bet...");
      
    if( $("#red_button > button").attr("disabled") == "disabled" ) {
      console.log("Spinning, waiting to bet.");
      setTimeout(mainLoop,1500);
      return;
    }
    placeBet($betColor);
    $toPlayWith = $toPlayWith - $currentBet;
    await sleep(7000);
    console.log("Bet placed: " + $currentBet + " on " + $betColor);
    $betPlaced = true;
    setTimeout(mainLoop,1500);
    return;
  }  
  
  //Wait for bet result
  $bet_red = $("#red_button > .row > .header > b").html();
  $bet_black = $("#black_button > .row > .header > b").html();
  if ($bet_red > 0 || $bet_black > 0) {
    setTimeout(mainLoop, 1500);
    return;
  }
  
  //If won reset streak and wait for another
  if (getLastResult() == $betColor) {
    $betPlaced = false;
    $currentStreak = 0;
    $toPlayWith = $toPlayWith + ($currentBet*2);
    console.log("We Won!, New ToPlayWith: " + $toPlayWith);
    $currentBet = Math.round($toPlayWith * Math.pow(0.5,  6));
    setBet($currentBet);
    setTimeout(mainLoop,1500);
    return;
  }
  
  //if lost double bet and bet again
  $betPlaced = false;
  $currentBet = $currentBet * 2;
  $currentStreak = 0;
  updateStreak();
  console.log("Lost, new ToPlayWith: " + $toPlayWith);
  

  //if profit level reached, bank it
  if($bankEvery == -1) {
    if($toPlayWith > $origToPlaywith*2) {
      $toPlayWith = $origToPlaywith;
      $banked = $banked + ($toPlayWith - $origToPlaywith);
    }
  } else if($toPlayWith - $origToPlaywith > $bankEvery) {
    $banked = $bankEvery;
    $toPlayWith = $toPlayWith - $bankEvery;
  }
  
  setTimeout(mainLoop,1500);
    
}

init(); //-