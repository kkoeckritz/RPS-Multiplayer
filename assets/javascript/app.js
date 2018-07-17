var data = {
	// shared
	ready1: false,
	ready2: false,
	reset: false,

	move1: -1,
	move2: -1,

	// local
	player: -1

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

			// should we run (or continue) game or wait for other player?
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

			ref.update({
				ready1: true
			});
		}
		else {
			console.log("we are player 2");
			data.player = 2;
			init.run_next = false;

			ref.update({
				ready2: true
			});
		}
	},

	// interpret game state based on sync'd vars
	playGame: function() {
		console.log("go");
		var ref = init.ref;

		// if someone disconnected, reset local vars
		if (data.reset == true) {
			console.log("ready");
			ref.update({
				reset: false
			});
		}
		else {
			// if either player not ready, find out which one we are
			if (data.ready1 == false || data.ready2 == false) {
				console.log("not ready");
				init.run_next = false;
				game.assignPlayer();
			}
			else {
				console.log("shouldn't make it to here");
			}
		}
	}
};

$().ready(function() {
	init.linkDB();
	init.setReset();
	init.startGame();
});

/* STEPS:

'<' = read DB once
'>' = write to DB

- <
- if (ready1 == true || reset == false):
	- player = 2
	- ready2 = true;
	else:
		- player = 1
		- ready1 = true
		- reset = false;
- >




*/