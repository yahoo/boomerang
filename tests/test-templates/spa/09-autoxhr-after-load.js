/*eslint-env mocha*/
/*global BOOMR_test,assert*/
BOOMR_test.templates.SPA = BOOMR_test.templates.SPA || {};
BOOMR_test.templates.SPA["09-autoxhr-after-load"] = function() {
	var tf = BOOMR.plugins.TestFramework;
	var t = BOOMR_test;

	it("Should have only sent one beacon (if AutoXHR is not enabled)", function(done) {
		t.ifAutoXHR(
			done,
			this.skip.bind(this),
			function() {
				t.ensureBeaconCount(done, 1);
			});
	});

	it("Should have sent three beacons (if AutoXHR is enabled)", function(done) {
		var _this = this;
		t.ifAutoXHR(
			done,
			function() {
				_this.timeout(10000);
				t.ensureBeaconCount(done, 3);
			},
			this.skip.bind(this));
	});

	//
	// Beacon 1 (page load)
	//
	describe("Beacon 1 (spa_hard)", function() {
		var i = 0;

		it("Should have sent the first beacon as http.initiator = spa_hard", function() {
			assert.equal(tf.beacons[i]["http.initiator"], "spa_hard");
		});

		it("Should send the first beacon (page load) with the time it took to load img.jpg?id=home (if NavigationTiming and MutationObserver is supported)", function(done) {
			if (typeof BOOMR.plugins.RT.navigationStart() !== "undefined" && t.isMutationObserverSupported()) {
				t.ifAutoXHR(
					done,
					function() {
						t.validateBeaconWasSentAfter(i, "support/img.jpg?id=home", 500, 0, 30000, 0);
						done();
					},
					this.skip.bind(this));
			}
			else {
				this.skip();
			}
		});

		it("Should send the first beacon (page load) with the time it took to load widgets.json (if NavigationTiming is supported and MutationObserver is not)", function(done) {
			if (typeof BOOMR.plugins.RT.navigationStart() !== "undefined" && !t.isMutationObserverSupported()) {
				t.ifAutoXHR(
					done,
					function() {
						t.validateBeaconWasSentAfter(i, "support/widgets.json", 500, 0, 30000, 0);
						done();
					},
					this.skip.bind(this));
			}
			else {
				this.skip();
			}
		});

		it("Should send the first beacon (page load) without any load time (if NavigationTiming is not supported)", function(done) {
			if (typeof BOOMR.plugins.RT.navigationStart() === "undefined") {
				t.ifAutoXHR(
					done,
					function() {
						var b = tf.beacons[i];
						assert.equal(b.t_done, undefined);
						assert.equal(b["rt.start"], "none");
						done();
					},
					this.skip.bind(this));
			}
			else {
				this.skip();
			}
		});

		it("Should send the first beacon (page load) with the page URL as the 'u' parameter", function(done) {
			t.ifAutoXHR(
				done,
				function() {
					assert.include(tf.beacons[i].u, "09-autoxhr-after-load.html");
					done();
				},
				this.skip.bind(this));
		});
	});

	//
	// Beacon 2 (XHR)
	//
	describe("Beacon 2 (xhr)", function() {
		var i = 1;

		it("Should have sent the first beacon as http.initiator = xhr", function() {
			assert.equal(tf.beacons[i]["http.initiator"], "xhr");
		});

		it("Should send the second beacon (XHR) with the 3s it took to load the widgets.json XHR", function(done) {
			t.ifAutoXHR(
				done,
				function() {
					assert.closeTo(tf.beacons[i].t_done, 3000, 500);
					done();
				},
				this.skip.bind(this));
		});

		it("Should send the second beacon (XHR) with widgets.json as the 'u' parameter", function(done) {
			t.ifAutoXHR(
				done,
				function() {
					assert.include(tf.beacons[i].u, "widgets.json");
					done();
				},
				this.skip.bind(this));
		});
	});

	//
	// Beacon 3 (XHR)
	//
	describe("Beacon 3 (xhr)", function() {
		var i = 2;

		it("Should have sent the first beacon as http.initiator = xhr", function() {
			assert.equal(tf.beacons[i]["http.initiator"], "xhr");
		});

		it("Should send the third beacon (XHR) with the 1s it took to load the widgets.json XHR", function(done) {
			t.ifAutoXHR(
				done,
				function() {
					assert.closeTo(tf.beacons[i].t_done, 1000, 250);
					done();
				},
				this.skip.bind(this));
		});

		it("Should send the third beacon (XHR) with widgets.json as the 'u' parameter", function(done) {
			t.ifAutoXHR(
				done,
				function() {
					assert.include(tf.beacons[i].u, "widgets.json");
					done();
				},
				this.skip.bind(this));
		});
	});
};
