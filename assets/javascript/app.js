var data = {
	// shared
	ready: false,

	// local
	first_player: false
}

var init = {
	// Initialize Firebase
	linkFirebase: function() {
		var config = {
		apiKey: "AIzaSyDdklB2C3OXCe6pou_vPyJdZKgl-o84dAI",
		authDomain: "multirps-3d932.firebaseapp.com",
		databaseURL: "https://multirps-3d932.firebaseio.com",
		projectId: "multirps-3d932",
		storageBucket: "multirps-3d932.appspot.com",
		messagingSenderId: "828311058734"
		};
		firebase.initializeApp(config);
	},
	watchFirebase: function() {
		var db = firebase.database();
		var ref = db.ref();

		ref.on("value", function(snapshot) {
			var in_data = snapshot.val();
			data.ready = in_data.ready;
		})
	}
};

var game = {
	assignPlayer: function() {

	}
};

$().ready(function() {
	init.linkFirebase();
});