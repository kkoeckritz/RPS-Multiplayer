var data = {
	// shared
	ready1: false,
	ready2: false,
	reset: false,

	move1: -1,
	move2: -1,

	// local
	player: -1,
	wins: 0,
	losses: 0,
	ties: 0
}

var init = {
	db: null,
	ref: null,
	run_next: true,

	// Initialize Firebase
	linkDB: function() {
		var config = {
		apiKey: "AIzaSyDdklB2C3OXCe6pou_vPyJdZKgl-o84dAI",
		authDomain: "multirps-3d932.firebaseapp.com",
		databaseURL: "https://multirps-3d932.firebaseio.com",
		projectId: "multirps-3d932",
		storageBucket: "multirps-3d932.appspot.com",
		messagingSenderId: "828311058734"
		};

		firebase.initializeApp(config);
		init.db = firebase.database();
		init.ref = init.db.ref();
	},

	// reset remote vars if a connection is lost
	setReset: function() {
		init.ref.onDisconnect().set({
			ready1: false,
			ready2: false,

			move1: -1,
			move2: -1,

			reset: true
			// full: false
		});
	},

	// listen for changes in remote; trigger game events as needed
	startGame: function() {
		init.ref.on("value", function(snapshot) {
			var in_data = snapshot.val();

			data.ready1 = in_data.ready1;
			data.ready2 = in_data.ready2;
			data.reset = in_data.reset;

			data.move1 = in_data.move1;
			data.move2 = in_data.move2;

			console.log(in_data);

			// continue with game or wait
			if (init.run_next == true) {
				console.log("set");
				game.playGame();
			}
			else {
				console.log("not set");
				init.run_next = true;
			}
		});
	}
};

var game = {
	assignPlayer: function() {
		// if we are first, we are player 1; else, player 2
		var ref = init.ref;

		if (data.ready1 == false) {

			console.log("we are player 1");
			data.player = 1;

			$("#status_player").html(`<h4>Player ${data.player}</h4>`);

			ref.update({
				ready1: true
			});

			$("#app_alert").html("<h2>Waiting for Player 2</h2>");
		}
		else if (data.ready2 == false) {
			console.log("we are player 2");
			data.player = 2;
			init.run_next = true;

			$("#status_player").html(`<h4>Player ${data.player}</h4>`);

			ref.update({
				ready2: true,
			});
		}
		else {
			// game is full
			console.log("That's too many people, man!")
			$("#app_alert").html("<h2>Game in progress.</h2><h3>Please wait for players to finish.</h3>");

			// cancel disconnect action so game state isn't ruined for other players
			init.ref.onDisconnect().cancel();
		}
	},

	// GOTTA BE A WAY TO COMBINE THESE... ALSO CANNOT MOVE FORWARD AS-IS
	doRPS: function() {
		console.log("Playing...");
		// am I player 1?
		if (data.player == 1) {
			// have I moved yet?
			console.log("...as Player 1.");
			if (data.move1 == -1) {
				// has player 2 already moved?
				console.log("I need to move.");
				if (data.move2 != -1) {
					$("#app_alert").html("<h2>Hurry up!</h2>");
				}
				else {
					$("#app_alert").html("<h2>Make your move!</h2>");
				}
				
				$(".control_button").prop("disabled", false);

				// set listener for buttons, update DB accordingly
				$(".control_button").one("click", function() {
					var choice = $(this).data("choice");
					init.ref.update({
						move1: choice
					});

					$(".control_button").prop("disabled", true);
					$(".control_button").off("click");
				});
			}
			else {
				console.log("I am waiting on Player 2");
				$("#app_alert").html("<h2>Player 2 is taking their time...</h2>");
			}
		}
		// am I player 2?
		else {
			// have I moved yet?
			console.log("...as Player2.");
			if (data.move2 == -1) {
				// has player 2 already moved?
				console.log("I need to move.");
				if (data.move1 != -1) {
					$("#app_alert").html("<h2>Hurry up!</h2>");
				}
				else {
					$("#app_alert").html("<h2>Make your move!</h2>");
				}

				$(".control_button").prop("disabled", false);

				// set listener for buttons, update DB accordingly
				$(".control_button").on("click", function() {
					var choice = $(this).data("choice");
					init.ref.update({
						move2: choice
					});

					$(".control_button").prop("disabled", true);
					$(".control_button").off("click");
				});
			}
			else {
				console.log("I am waiting on Player 1.");
				$("#app_alert").html("<h2>Player 1 is taking their time...</h2>");
			}
		}
	},

	// score based on player choices
	doScore: function() {
		console.log("Scoring...")
		$("#app_alert").html("<h2>Showdown:</h2>");

		// determine if we won depending on which user we are
		if (data.player == 1) {
			var our_guess = data.move1;
			var their_guess = data.move2;
		}
		else {
			var our_guess = data.move2;
			var their_guess = data.move1;
		}

		if (our_guess == their_guess)
		{
			data.ties++;
		}
		else
		{
			// user wins
			if (our_guess == "r" && their_guess == "s")
			{
				data.wins++;
				console.log("win");
			}
			else if (our_guess == "p" && their_guess == "r")
			{
				data.wins++;
				console.log("win");
			}
			else if (our_guess == "s" && their_guess == "p")
			{
				data.wins++;
				console.log("win");
			}

			// user losses
			else if (our_guess == "r" && their_guess == "p")
			{
				data.losses++;
				console.log("lose");
			}
			else if (our_guess == "p" && their_guess == "s")
			{
				data.losses++;
				console.log("lose");
			}
			else if (our_guess == "s" && their_guess == "r")
			{
				data.losses++;
				console.log("lose");
			}
		}

		// if total score not greater than max || tied, keep playing
	},

	// interpret game state based on sync'd vars
	playGame: function() {
		console.log("go");
		var ref = init.ref;

		// if someone disconnected, reset game state
		if (data.reset == true) {
			console.log("someone disconnected");
			$("#app_alert").html("<h2>Someone disconnected</h2>");

			data.player = -1;
			data.wins = 0;
			data.losses = 0;

			ref.update({
				reset: false
			});
		}
		else {
			// which player are we?
			if (data.player == -1) {
				console.log("not ready");
				init.run_next = false;
				game.assignPlayer();
			}
			// start actual game
			else {
				if (data.move1 == -1 || data.move2 == -1) {
					console.log("Let's play.");
					game.doRPS();
				}
				else {
					console.log("Both players have chosen");
					game.doScore();
				}

			}
		}			
	}
};

$().ready(function() {
	init.linkDB();
	init.setReset();
	init.startGame();
});


