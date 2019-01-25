"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _immutable = require("immutable");

var _formData = _interopRequireDefault(require("form-data"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _radixdlt = require("radixdlt");

var _podiumUser = _interopRequireDefault(require("podiumUser"));

var _podiumError = _interopRequireDefault(require("podiumError"));

var _podiumRoutes = _interopRequireDefault(require("podiumRoutes"));

var _utils = require("utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Podium =
/*#__PURE__*/
function () {
  // INITIALIZATION
  function Podium() {
    var _this = this;

    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, Podium);

    // Set up global variables
    this.route = new Routes();
    this.channels = (0, _immutable.Map)({});
    this.timers = (0, _immutable.Map)({}); // Set logging level

    this.setDebug(debug); // Load remote config if none supplied

    if (!config) {
      this.server = "https://api.podium-network.com";
      (0, _nodeFetch.default)(this.server).then(function (response) {
        if (!response.ok) {
          throw new _podiumError.default("Server Offline").withCode(0);
        } else {
          (0, _nodeFetch.default)(_this.server + "/config").then(function (response) {
            return response.json();
          }).then(function (config) {
            return _this.connect(config);
          });
        }
      });
    } else {
      this.connect(config);
    }
  }

  _createClass(Podium, [{
    key: "connect",
    value: function connect(config) {
      // Extract settings from config
      this.app = config.ApplicationID;
      this.timeout = config.Timeout;
      this.lifetime = config.Lifetime;
      this.server = "http://" + config.API; // "https://" + config.API

      this.media = config.MediaStore; // Connect to radix network
      //TODO - Test radix connection

      switch (config.Universe) {
        case "sunstone":
          _radixdlt.radixUniverse.bootstrap(_radixdlt.RadixUniverse.SUNSTONE);

          break;

        case "highgarden":
          _radixdlt.radixUniverse.bootstrap(_radixdlt.RadixUniverse.HIGHGARDEN);

          break;

        case "alphanet":
          _radixdlt.radixUniverse.bootstrap(_radixdlt.RadixUniverse.ALPHANET);

          break;

        default:
          throw new Error("Unknown Radix Universe.");
      }
    } // UTILITIES

  }, {
    key: "getAccount",
    value: function getAccount(seed) {
      return (0, _utils.getAccount)(seed);
    }
  }, {
    key: "cleanUp",
    value: function cleanUp() {
      this.cleanUpTimers();
      this.cleanUpChannels();
    }
  }, {
    key: "setDebug",
    value: function setDebug(debug) {
      this.debug = debug;

      if (!debug) {
        _radixdlt.RadixLogger.setLevel('error');
      } else {
        console.log("Debug Mode On");
      }
    }
  }, {
    key: "debugOut",
    value: function debugOut() {
      if (this.debug) {
        var _console;

        (_console = console).log.apply(_console, ["PODIUM > "].concat(Array.prototype.slice.call(arguments)));
      }
    } // TIMERS

  }, {
    key: "newTimer",
    value: function newTimer(id, // Identifier of timer
    duration, // Duration of timer
    callback // Function to be called upon timer completion
    ) {
      var _this2 = this;

      // Start timer
      var timer = setTimeout(function () {
        // Run callback
        callback(); // Delete record of this timer

        _this2.timers.delete(id);
      }, duration); // Store timer

      this.timers.id = {
        timer: timer,
        callback: callback,
        duration: duration
      };
    }
  }, {
    key: "resetTimer",
    value: function resetTimer(id // Identifier of timer to be restarted
    ) {
      // Stop timer
      clearTimeout(this.timers.id.timer); // Recreate timer

      this.newTimer(id, this.timers.callback, this.timers.duration);
    }
  }, {
    key: "stopTimer",
    value: function stopTimer(id // Identifier of timer to be stopped
    ) {
      // Stop timer
      clearTimeout(this.timers.id.timer); // Delete record of this timer

      this.timers.delete("id");
    }
  }, {
    key: "cleanUpTimers",
    value: function cleanUpTimers() {
      var _this3 = this;

      // Stops all timers
      this.timers.map(function (t) {
        return _this3.stopTimer(t);
      });
    } // WRITE DATA TO RADIX

  }, {
    key: "sendRecord",
    value: function sendRecord(accounts, // Destination accounts for record [Array]
    payload) // Encrypt record with user's identity?
    {
      var _this4 = this;

      var identity = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.user;
      var encrypt = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      if (!identity) {
        throw new Error("Missing Identity");
      }

      return new Promise(function (resolve, reject) {
        if (accounts.length === 0) {
          reject(new Error("Received empty accounts array"));
        } else {
          _this4.debugOut("Writing to Ledger (x", accounts.length, "):", payload);

          _radixdlt.RadixTransactionBuilder.createPayloadAtom(accounts, _this4.app, JSON.stringify(payload), encrypt).signAndSubmit(identity).subscribe({
            complete: function complete() {
              return resolve(true);
            },
            next: function next(status) {
              return _this4.debugOut(" > ", status);
            },
            error: function error(_error) {
              return reject(_error);
            }
          });
        }
      });
    }
  }, {
    key: "sendRecords",
    value: function sendRecords() {
      var _this5 = this,
          _arguments = arguments;

      return new Promise(function (resolve, reject) {
        // Unpack arg list
        var args = Array.prototype.slice.call(_arguments); // Check if identity was provided

        var identity;

        if (args.length % 2 === 1) {
          identity = args[0];
          args = args.slice(1, args.length);
        } else if (_this5.user) {
          identity = _this5.user;
        } else {
          throw new Error("Missing Identity");
        } // Dispatch records


        _this5.sendRecord(args[0], args[1], identity).then(function (result) {
          if (args.length > 2) {
            _this5.sendRecords.apply(_this5, [identity].concat(_toConsumableArray(args.slice(2, args.length)))).then(function (result) {
              return resolve(result);
            }).catch(function (error) {
              return reject(error);
            });
          } else {
            resolve(true);
          }
        }).catch(function (error) {
          return reject(error);
        });
      });
    } // FETCH DATA FROM RADIX

  }, {
    key: "getHistory",
    value: function getHistory(account) // Assume history is empty after X seconds inactivity
    {
      var _this6 = this;

      var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.timeout;
      // Pulls all current values from a radix
      // -account- and closes the channel connection.
      this.debugOut("Fetching Account History (timeout: " + timeout + ")");
      return new Promise(function (resolve, reject) {
        // Open the account connection
        account.openNodeConnection(); // Connect to account data

        var stream = account.dataSystem.getApplicationData(_this6.app); // Fetch all data from target channel

        var skipper;
        var history = List([]);
        var channel = stream.subscribe({
          //TODO - Rewrite to pull until up-to-date once
          //		 radix provides the required flag.
          //		 Currently, this just collates all
          //		 input until timeout.
          next: function next(item) {
            // Log debug
            _this6.debugOut(" > Received: ", item.data.payload); // Cancel shortcut timer


            if (skipper) {
              clearTimeout(skipper);
            } // Unpack record


            var record = (0, _immutable.Map)(fromJS(JSON.parse(item.data.payload))).set("received", new Date().getTime()).set("created", item.data.timestamp); // Add record to history

            history = history.push(record); // Assume all records collated 1 second after first
            // (This won't work long-term, but serves as an
            // efficient fix for the timeout issue until the
            // radix lib can flag a channel as up to date).

            skipper = setTimeout(function () {
              _this6.debugOut(" > No record received for 1s. Resolving early.");

              channel.unsubscribe();
              resolve(history.sort(function (a, b) {
                return a.get("created") > b.get("created") ? 1 : -1;
              }));
            }, 1000);
          },
          error: function error(_error2) {
            channel.unsubscribe();
            reject(_error2);
          }
        }); // Set timeout

        setTimeout(function () {
          channel.unsubscribe();

          if (history.size > 0) {
            _this6.debugOut(" > Timed out. Resolving with current history.");

            resolve(history.sort(function (a, b) {
              return a.get("created") > b.get("created") ? 1 : -1;
            }));
          } else {
            _this6.debugOut(" > Timed out. No history received.");

            reject(new _podiumError.default().withCode(2));
          }
        }, timeout * 1000);
      }); // TODO - Close node connection
    }
  }, {
    key: "getLatest",
    value: function getLatest(account) // Assume account is empty after X seconds inactivity
    {
      var _this7 = this;

      var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.timeout;
      // Returns the most recent payload among all
      // data for the provided -account-.
      // Get account history
      return new Promise(function (resolve, reject) {
        _this7.getHistory(account, timeout).then(function (history) {
          return resolve(history.sort(function (a, b) {
            return a.get("created") > b.get("created") ? 1 : -1;
          }).last());
        }).catch(function (error) {
          return reject(error);
        });
      });
    } // SUBSCRIBE TO RADIX DATA

  }, {
    key: "openChannel",
    value: function openChannel(account, // Radix account to be queried
    callback) // Close channel after X seconds of inactivity
    {
      var _this8 = this;

      var onError = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var lifetime = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : this.lifetime;
      // Creates and manages a subscription to new data
      // updates for a given -account-, running
      // -callback- whenever a new item is received.
      // Will run -onError- callback in case of error.
      // Will timeout after -lifetime- ms of inactivity,
      // or will remain open indefinitely if -lifetime-
      // is not provided or set to 0.
      //TODO - Close channels after a period of inactivity
      //		 and reopen automatically on resume.
      // Check channel to this account is not already open
      var address = account.getAddress();

      if (address in this.channels) {
        return this.channels.get(address);
      } // Connect to the account


      account.openNodeConnection(); // Initialize data request

      var stream = account.dataSystem.applicationDataSubject; // Set up timeout, if required

      var timer;

      if (lifetime > 0) {
        timer = this.newTimer(address, lifetime, function (a) {
          _this8.closeChannel(a);
        });
      } // Subscribe to data stream


      var channel = stream.subscribe({
        next: function () {
          var _next2 = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee(item) {
            var result;
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    // Reset timeout
                    if (lifetime > 0) {
                      _this8.resetTimer(address);
                    } // Run callback


                    result = (0, _immutable.Map)(fromJS(JSON.parse(item.data.payload)));
                    callback(result);

                  case 3:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee, this);
          }));

          function next(_x) {
            return _next2.apply(this, arguments);
          }

          return next;
        }(),
        error: function error(_error3) {
          // Run callback
          if (typeof onError === "function") {
            onError(_error3);
          } else {
            _this8.closeChannel(address);

            throw _error3;
          }
        }
      }); // Log open channel

      this.channels.set("address", (0, _immutable.Map)({
        timer: timer,
        channel: channel
      })); // Return the channel

      return channel;
    }
  }, {
    key: "closeChannel",
    value: function closeChannel(address // Radix address of channel to be closed
    ) {
      // Closes and cleans up a channel created by
      // openChannel
      // Stop channel timeout
      if (address in this.channels) {
        this.stopTimer(this.channels.get(address).timer);
        this.channels.get(address).channel.unsubscribe();
        this.channels.delete(address);
      } //TODO - Close radix node connection

    }
  }, {
    key: "cleanUpChannels",
    value: function cleanUpChannels() {
      var _this9 = this;

      // Closes all open Channels
      this.channels.map(function (c) {
        return _this9.closeChannel(c);
      });
    } // SERVER

  }, {
    key: "dispatch",
    value: function dispatch(route, data) {
      var _this10 = this;

      this.debugOut("Posting to ".concat(this.server, "/").concat(route, ":"), data);
      return new Promise(function (resolve, reject) {
        var body = new _formData.default();
        Object.keys(data).forEach(function (k) {
          return body.append(k, data[k]);
        });
        (0, _nodeFetch.default)("".concat(_this10.server, "/").concat(route), {
          method: "POST",
          body: body
        }).then(function (result) {
          if (result.ok) {
            return result;
          } else {
            throw new Error("Request failed with status:" + result.status);
          }
        }).then(function (result) {
          var output = result.json();

          _this10.debugOut(" > Response: ", output);

          resolve(fromJS(output));
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "uploadMedia",
    value: function uploadMedia(mediaFile, address) {
      var _this11 = this;

      // Dispatches a media file to the server, which
      // returns an ID address for that image in the
      // public store.
      return new Promise(function (resolve, reject) {
        // const body = new FormData()
        // body.append("file", mediaFile)
        // body.append("address", address)
        _this11.dispatch("media", {
          address: address,
          file: mediaFile
        }).then(function (response) {
          return resolve(response);
        }).catch(function (error) {
          return reject(error);
        });
      });
    } // CREATE USERS

  }, {
    key: "createUser",
    value: function createUser(id, // Podium @ ID of new user account
    pw, // Password for new user account
    name, // Display name of new user account
    bio, // Bio of new user account
    picture, // Picture, as base64 string
    ext) {
      var _this12 = this;

      return new Promise(function (resolve, reject) {
        _this12.dispatch("user", {
          id: id,
          pw: pw,
          name: name,
          bio: bio,
          picture: picture,
          ext: ext
        }).then(function (response) {
          return resolve(_this12.getUser(id, pw));
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "newUser",
    value: function newUser(id, // Podium @ ID of new user account
    pw, // Password for new user account
    name, // Display name of new user account
    bio) // Bio of new user account
    {
      var _this13 = this;

      // Registers a new podium user.
      // Podium users are represented on the ledger by 6 records
      //	1) Profile Record - stores information about the user,
      //			including their display name and bio
      //	2) POD Record - stores transactions of Podium Tokens
      //			by the user, which can be compiled to calculate
      //			the user's current POD balance
      //	3) AUD Record - stores transactions of Audium Tokens
      //			by the user, which can be compiled to calculate
      //			the user's current AUD balance
      //	4) Integrity Record - stores gains/losses of Integrity
      //			for this user, which can be compiled to calculate
      //			the user's current Integrity
      //	5) Permissions - stores records dictating the user's
      //			current permissions on Podium
      //	6) ID Ownership Record - stores a reference for the user's
      //			address to their Podium @ ID. Used to confirm
      //			account ownership, track account history, and to
      //			permit users to freely transfer their IDs
      //TODO - Require ID and pw to obey certain rulesets
      //TODO - Replace with scrypto smart contract
      // Create output promise
      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee3(resolve, reject) {
          var identityManager, identity, address, profileAccount, profilePayload, podAccount, podPayload, audAccount, audPayload, integrityAccount, integrityPayload, ownershipAccount, ownershipPayload, keyStore;
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  //TODO - Ensure user does not already exist
                  // Create user identity
                  identityManager = new _radixdlt.RadixIdentityManager();
                  identity = identityManager.generateSimpleIdentity();
                  address = identity.account.getAddress(); // Generate user public record

                  profileAccount = _this13.route.forProfileOf(address);
                  profilePayload = {
                    record: "profile",
                    type: "profile",
                    id: id,
                    name: name,
                    bio: bio || "",
                    picture: "",
                    address: address // Generate user POD account

                  };
                  podAccount = _this13.route.forPODof(address);
                  podPayload = {
                    owner: address,
                    pod: 500,
                    from: "" // Generate user AUD account

                  };
                  audAccount = _this13.route.forAUDof(address);
                  audPayload = {
                    owner: address,
                    pod: 10,
                    from: "" // Generate user integrity record

                  };
                  integrityAccount = _this13.route.forIntegrityOf(address);
                  integrityPayload = {
                    owner: address,
                    i: 0.5,
                    from: "" // Generate record of this user's address owning this ID

                  };
                  ownershipAccount = _this13.route.forProfileWithID(id);
                  ownershipPayload = {
                    record: "ownership",
                    type: "username",
                    id: id,
                    owner: address
                  }; // Encrypt keypair

                  keyStore = _this13.route.forKeystoreOf(id, pw);

                  _radixdlt.RadixKeyStore.encryptKey(identity.keyPair, pw).then(
                  /*#__PURE__*/
                  function () {
                    var _ref2 = _asyncToGenerator(
                    /*#__PURE__*/
                    regeneratorRuntime.mark(function _callee2(encryptedKey) {
                      return regeneratorRuntime.wrap(function _callee2$(_context2) {
                        while (1) {
                          switch (_context2.prev = _context2.next) {
                            case 0:
                              return _context2.abrupt("return", _this13.sendRecords(identity, [keyStore], encryptedKey, [profileAccount], profilePayload, [podAccount], podPayload, [audAccount], audPayload, [integrityAccount], integrityPayload, [ownershipAccount], ownershipPayload));

                            case 1:
                            case "end":
                              return _context2.stop();
                          }
                        }
                      }, _callee2, this);
                    }));

                    return function (_x4) {
                      return _ref2.apply(this, arguments);
                    };
                  }()) //TODO - Auto-follow Podium master account
                  .then(function (result) {
                    return resolve(_this13.getUser(id, pw));
                  }).catch(function (error) {
                    return reject(error);
                  });

                case 15:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, this);
        }));

        return function (_x2, _x3) {
          return _ref.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "withUser",
    value: function withUser(id, pw) {
      return new _podiumUser.default(id, pw, this, {
        debug: this.debug
      });
    } // FETCH RECORDS
    //TODO - handle multiple simultaneous requests
    //		 for the same record without multiple
    //		 calls to the network

  }, {
    key: "fetchProfile",
    value: function fetchProfile(target) // Set true if passing an ID instead of an address
    {
      var _this14 = this;

      var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return new Promise(function (resolve, reject) {
        // Search on ID or Address
        if (id) {
          // Search on ID
          _this14.getLatest(_this14.route.forProfileWithID(target)).then(function (reference) {
            return resolve(_this14.fetchProfile(reference.get("owner")));
          }).catch(function (error) {
            return reject(error);
          });
        } else {
          // Search on address
          _this14.getHistory(_this14.route.forProfileOf(target)).then(function (history) {
            var profile = history.reduce(function (a, b) {
              return a.mergeDeep(b);
            });
            resolve(profile.set("pictureURL", "https://".concat(_this14.media, "/").concat(profile.get("picture"))));
          }).catch(function (error) {
            return reject(error);
          });
        }
      });
    }
  }, {
    key: "fetchPost",
    value: function fetchPost(address) {
      var _this15 = this;

      return new Promise(function (resolve, reject) {
        _this15.getHistory(_this15.route.forPost(address)) // Collate post history into a single object
        .then(function (postHistory) {
          return postHistory.reduce(function (post, next) {
            // TODO - Merge edits and retractions
            //		  into a single cohesive map
            // Collate timestamps
            var lastTime = post.get("created");
            var nextTime = next.get("created");
            var created;
            var latest;

            if (lastTime && nextTime) {
              created = Math.min(lastTime, nextTime);
              latest = Math.max(lastTime, nextTime);
            } else {
              created = lastTime || nextTime;
              latest = lastTime || nextTime;
            } // Return completed post


            resolve(post.mergeDeep(next).set("created", created).set("latest", latest));
          }, (0, _immutable.Map)({}));
        }) // Handle errors
        .catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "fetchRepliesTo",
    value: function fetchRepliesTo(address) {
      var _this16 = this;

      return new Promise(function (resolve, reject) {
        _this16.getHistory(_this16.route.forRepliesToPost(address)).then(function (replies) {
          return replies.map(function (r) {
            return r.get("address");
          }).toList();
        }).then(function (replies) {
          return resolve(replies);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "fetchPromotionsOf",
    value: function fetchPromotionsOf(address) {
      var _this17 = this;

      return new Promise(function (resolve, reject) {
        _this17.getHistory(_this17.route.forPromosOfPost(address)).then(function (promos) {
          return resolve(promos);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "fetchTopic",
    value: function fetchTopic(target) // Set true if passing an ID instead of an address
    {
      var _this18 = this;

      var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return new Promise(function (resolve, reject) {
        // Search on ID or Address
        if (id) {
          // Search on ID
          _this18.getLatest(_this18.route.forTopicWithID(target)).then(function (reference) {
            return resolve(_this18.fetchTopic(reference.get("owner")));
          }).catch(function (error) {
            return reject(error);
          });
        } else {
          // Search on address
          _this18.getLatest(_this18.route.forTopic(target)).then(function (topic) {
            return resolve(topic);
          }).catch(function (error) {
            return reject(error);
          });
        }
      });
    } // LISTENERS

  }, {
    key: "listenPosts",
    value: function listenPosts(address, callback) {
      this.openChannel(this.route.forPostsBy(address), callback);
    }
  }]);

  return Podium;
}();

exports.default = Podium;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var PodiumError =
/*#__PURE__*/
function (_Error) {
  _inherits(PodiumError, _Error);

  function PodiumError() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, PodiumError);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(PodiumError)).call.apply(_getPrototypeOf2, [this].concat(args)));
    _this.podiumError = true;
    Error.captureStackTrace(_assertThisInitialized(_assertThisInitialized(_this)), PodiumError);
    return _this;
  }

  _createClass(PodiumError, [{
    key: "withCode",
    value: function withCode(code) {
      this.code = code;
      this.message = this.report(code);
      return this;
    }
  }, {
    key: "report",
    value: function report() {
      switch (this.code) {
        case 0:
          return "Server Offline.";

        case 1:
          return "No data received.";

        case 2:
          return "Timed out.";

        default:
          return "Unknown error.";
      }
    }
  }]);

  return PodiumError;
}(_wrapNativeSuper(Error));

exports.default = PodiumError;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utils = require("utils");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PodiumRoutes =
/*#__PURE__*/
function () {
  function PodiumRoutes() {
    _classCallCheck(this, PodiumRoutes);
  }

  _createClass(PodiumRoutes, [{
    key: "faucet",
    value: function faucet() {
      return RadixAccount.fromAddress('9he94tVfQGAVr4xoUpG3uJfB2exURExzFV6E7dq4bxUWRbM5Edd', true);
    } // Users

  }, {
    key: "forProfileOf",
    value: function forProfileOf(address) {
      return RadixAccount.fromAddress(address);
    }
  }, {
    key: "forKeystoreOf",
    value: function forKeystoreOf(id, pw) {
      return (0, _utils.getAccount)("podium-keystore-for-" + id.toLowerCase() + pw);
    }
  }, {
    key: "forProfileWithID",
    value: function forProfileWithID(id) {
      return (0, _utils.getAccount)("podium-ownership-of-id-" + id.toLowerCase());
    }
  }, {
    key: "forIntegrityOf",
    value: function forIntegrityOf(address) {
      return (0, _utils.getAccount)("podium-integrity-score-of-" + address);
    } // Tokens

  }, {
    key: "forPODof",
    value: function forPODof(address) {
      return (0, _utils.getAccount)("podium-token-transactions-of-" + address);
    }
  }, {
    key: "forAUDof",
    value: function forAUDof(address) {
      return (0, _utils.getAccount)("audium-token-transactions-of-" + address);
    } // Topics

  }, {
    key: "forTopic",
    value: function forTopic(address) {
      return RadixAccount.fromAddress(address);
    }
  }, {
    key: "forTopicWithID",
    value: function forTopicWithID(id) {
      return (0, _utils.getAccount)("podium-topic-with-id-" + id.toLowerCase());
    }
  }, {
    key: "forPostsAboutTopic",
    value: function forPostsAboutTopic(address) {
      return (0, _utils.getAccount)("podium-posts-about-topic-" + address);
    } // Posts

  }, {
    key: "forPostsBy",
    value: function forPostsBy(address) {
      return (0, _utils.getAccount)("podium-posts-by-user-" + address);
    }
  }, {
    key: "forPost",
    value: function forPost(address) {
      return RadixAccount.fromAddress(address);
    }
  }, {
    key: "forNextPostBy",
    value: function forNextPostBy(user) {
      // TODO - Fix this so posts are stored deterministicly again
      return (0, _utils.getAccount)("podium-post-by-" + user.get("address") + "-" + (user.get("posts") + user.get("pending")));
    }
  }, {
    key: "forNewPost",
    value: function forNewPost(post) {
      return (0, _utils.getAccount)("podium-post-with-content-" + post);
    }
  }, {
    key: "forRepliesToPost",
    value: function forRepliesToPost(address) {
      return (0, _utils.getAccount)("podium-replies-to-post-" + address);
    }
  }, {
    key: "forPromotionsOfPost",
    value: function forPromotionsOfPost(address) {
      return (0, _utils.getAccount)("podium-promotions-of-post-" + address);
    } // Media

  }, {
    key: "forMedia",
    value: function forMedia(file) {
      return (0, _utils.getAccount)(JSON.stringify(file));
    }
  }, {
    key: "forMediaFrom",
    value: function forMediaFrom(address) {
      return (0, _utils.getAccount)("podium-media-uploaded-by-" + address);
    } // Follows

  }, {
    key: "forUsersFollowing",
    value: function forUsersFollowing(address) {
      return (0, _utils.getAccount)("podium-user-followers-" + address);
    }
  }, {
    key: "forUsersFollowedBy",
    value: function forUsersFollowedBy(address) {
      return (0, _utils.getAccount)("podium-user-following-" + address);
    }
  }, {
    key: "forRelationOf",
    value: function forRelationOf(address1, address2) {
      var addresses = [address1, address2].sort();
      return (0, _utils.getAccount)("podium-user-relation-between-" + addresses[0] + "-and-" + addresses[1]);
    } // Alerts

  }, {
    key: "forAlertsTo",
    value: function forAlertsTo(address) {
      return (0, _utils.getAccount)("podium-user-alerts-" + address);
    }
  }]);

  return PodiumRoutes;
}();

exports.default = PodiumRoutes;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _immutable = require("immutable");

var _radixdlt = require("radixdlt");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PodiumUser =
/*#__PURE__*/
function () {
  function PodiumUser(id, // User Identifier
  pw, // User password
  podium) {
    var config = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : (0, _immutable.Map)({});

    _classCallCheck(this, PodiumUser);

    // Set podium
    this.podium = podium;
    this.config = config; // Set debug

    this.setDebug(config.get("debug")); // Sign in

    return signIn(id, pw);
  }

  _createClass(PodiumUser, [{
    key: "signIn",
    value: function signIn(id, pw) {
      var _this = this;

      this.debugOut("Signing In: ", id, pw);
      return new Promise(function (resolve, reject) {
        _this.podium // Retrieve keypair
        .getLatest(_this.podium.route.forKeystoreOf(id, pw)) // Decrypt keypair
        .then(function (encryptedKey) {
          _this.debugOut("Received Keypair");

          return _radixdlt.RadixKeyStore.decryptKey(encryptedKey.toJS(), pw);
        }) // Construct and save identity from keypair
        .then(function (keyPair) {
          _this.debugOut("Decrypted Keypair: ", keyPair);

          var ident = new _radixdlt.RadixSimpleIdentity(keyPair);
          _this.identity = ident;
          _this.address = ident.account.getAddress();
          resolve(_this);
        }) // Handle errors
        .catch(function (error) {
          return reject(error);
        });
      });
    } // DEBUG

  }, {
    key: "setDebug",
    value: function setDebug(debug) {
      this.debug = debug;

      if (!debug) {
        RadixLogger.setLevel('error');
      } else {
        console.log("Debug Mode On");
      }

      return this;
    }
  }, {
    key: "debugOut",
    value: function debugOut() {
      if (this.debug) {
        var _console;

        (_console = console).log.apply(_console, ["PODIUM USER > "].concat(Array.prototype.slice.call(arguments)));
      }

      return this;
    } // ACCOUNT UPDATING

  }, {
    key: "updateUserIdentifier",
    value: function updateUserIdentifier() {}
  }, {
    key: "updatePassword",
    value: function updatePassword() {} // USER PROFILES

  }, {
    key: "getProfile",
    value: function getProfile() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        if (_this2.profile) {
          resolve(_this2.profile);
        } else {
          _this2.debugOut("Fetching Profile...");

          _this2.podium.fetchProfile(_this2.address).then(function (profile) {
            return resolve(profile);
          }).catch(function (error) {
            return reject(error);
          });
        }
      });
    }
  }, {
    key: "updateProfileName",
    value: function updateProfileName(name) {
      var _this3 = this;

      this.debugOut("Updating profile name: ".concat(name));
      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee(resolve, reject) {
          var profileAccount, profilePayload;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  // Generate user public record
                  profileAccount = _this3.podium.route.forProfileOf(_this3.address);
                  profilePayload = {
                    record: "profile",
                    type: "image",
                    name: name // Write record

                  };

                  _this3.podium.sendRecord([profileAccount], profilePayload, _this3.identity).then(function () {
                    return resolve();
                  }).catch(function (error) {
                    return reject(error);
                  });

                case 3:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "updateProfileBio",
    value: function updateProfileBio(bio) {
      var _this4 = this;

      this.debugOut("Updating profile bio: ".concat(bio));
      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref2 = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee2(resolve, reject) {
          var profileAccount, profilePayload;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  // Generate user public record
                  profileAccount = _this4.podium.route.forProfileOf(_this4.address);
                  profilePayload = {
                    record: "profile",
                    type: "bio",
                    bio: bio // Write record

                  };

                  _this4.podium.sendRecord([profileAccount], profilePayload, _this4.identity).then(function () {
                    return resolve();
                  }).catch(function (error) {
                    return reject(error);
                  });

                case 3:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        return function (_x3, _x4) {
          return _ref2.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "updateProfilePicture",
    value: function updateProfilePicture(pictureAddress) {
      var _this5 = this;

      this.debugOut("Updating profile picture: ".concat(pictureAddress));
      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref3 = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee3(resolve, reject) {
          var profileAccount, profilePayload;
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  // Generate user public record
                  profileAccount = _this5.podium.route.forProfileOf(_this5.address);
                  profilePayload = {
                    record: "profile",
                    type: "image",
                    picture: pictureAddress // Write record

                  };

                  _this5.podium.sendRecord([profileAccount], profilePayload, _this5.identity).then(function () {
                    return resolve();
                  }).catch(function (error) {
                    return reject(error);
                  });

                case 3:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, this);
        }));

        return function (_x5, _x6) {
          return _ref3.apply(this, arguments);
        };
      }());
    } // MEDIA

  }, {
    key: "registerMedia",
    value: function registerMedia(image, ext) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        //TODO - Validate media with 3rd party service
        //		 to detect image manipulation, etc...
        // Register media on ledger
        var imageAccount = _this6.podium.route.forMedia(image);

        var imageAddress = imageAccount.getAddress();
        var imageURL = "".concat(imageAddress, ".").concat(ext); // Generate file record
        //TODO - Ensure media address is independent of
        //		 the uploading user so the same image
        //		 uploaded by different users is still
        //		 only stored once on S3.

        var imagePayload = {
          record: "media",
          type: "image",
          address: imageAddress,
          ext: ext,
          uploader: address // Register media on ledger
          //TODO - Check if media already exists and skip
          //		 this step, if required

        };

        _this6.debugOut("Registering Media: ".concat(imageAddress));

        _this6.podium.sendRecord([imageAccount], imagePayload, _this6.identity).then(function () {
          return resolve(imageURL);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "createMedia",
    value: function createMedia(image, ext) {
      var _this7 = this;

      this.debugOut("Creating Media");
      return new Promise(function (resolve, reject) {
        // Register media on ledger and upload
        //TODO - Check if media already exists and skip
        //		 this step, if required
        _this7.registerMedia(image, ext).then(function (address) {
          return _this7.podium.uploadMedia(image, address);
        }).catch(function (error) {
          return reject(error);
        });
      });
    } // TOPICS

  }, {
    key: "createTopic",
    value: function createTopic(id, // Unique identifier for topic
    name, // Display name of topic
    description // Description of topic
    ) {
      var _this8 = this;

      this.debugOut("Creating Topic: ".concat(id));
      return new Promise(function (resolve, reject) {
        // Resolve topic address
        var topicAccount = _this8.podium.route.forTopicWithID(id);

        var topicAddress = topicAccount.getAddress(); // Build topic record

        var topicRecord = {
          record: "topic",
          type: "topic",
          id: id,
          name: name,
          description: description,
          owner: _this8.address,
          address: topicAddress //TODO - Topic ownership record
          // Store topic

        };

        _this8.podium.sendRecord([topicAccount], topicRecord, _this8.identity) //TODO - Add topic to index database
        .then(function (result) {
          return resolve(topicRecord);
        }).catch(function (error) {
          return reject(error);
        });
      });
    } // POSTS

  }, {
    key: "createPost",
    value: function createPost(content) // Record of post being replied to (if any)
    {
      var _this9 = this;

      var references = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var parent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      this.debugOut("Creating Post: ".concat(content));
      return new Promise(function (resolve, reject) {
        // Build post accounts
        //TODO - Fix deterministic posting addresses
        //const postAccount = this.route.forNextPostBy(this.state.data.get("user"));
        var postAccount = _this9.podium.route.forNewPost(content);

        var postAddress = postAccount.getAddress(); // Build post record

        var postRecord = {
          record: "post",
          type: "post",
          content: content,
          address: postAddress,
          author: _this9.address,
          parent: parent ? parent.get("address") : null,
          grandparent: parent ? parent.get("parent") : null,
          origin: parent ? parent.get("origin") : postAddress,
          depth: parent ? parent.get("depth") + 1 : 0,
          mentions: references.filter(function (ref) {
            return ref.get("type") === "mention";
          }).map(function (ref) {
            return ref.get("address");
          }).toList().toJS(),
          topics: references.filter(function (ref) {
            return ref.get("type") === "topics";
          }).map(function (ref) {
            return ref.get("address");
          }).toList().toJS(),
          media: [] // Build destination accounts for references

        };
        var refAccounts = references.map(function (ref) {
          var refAddress = ref.get("address");

          switch (ref.get("type")) {
            case "topic":
              return _this9.podium.route.forPostsAboutTopic(refAddress);
            //TODO - Links and other references
            //TODO - Mentions of users...?

            default:
              return List();
          }
        }).toList(); // Build destination accounts for index record

        var indexAccounts = [_this9.podium.route.forPostsBy(_this9.address)].concat(_toConsumableArray(replyIndex), _toConsumableArray(refAccounts));
        var indexRecord = {
          record: "post",
          type: "index",
          address: postAddress // Build alert payload

        };
        var mentionAccounts = references //.filter(ref => ref.get("address") !== userAddress)
        .map(function (ref) {
          var refAddress = ref.get("address");

          switch (ref.get("type")) {
            case "mention":
              return _this9.podium.route.forAlertsTo(refAddress);

            default:
              return List();
          }
        }).toList();
        var mentionRecord = {
          record: "alert",
          type: "mention",
          post: postAddress,
          user: _this9.address // Check if post is a reply

        };

        if (parent) {
          // Build reply index
          var replyAccount = _this9.podium.route.forRepliesToPost(parent.get("address")); // Build reply alert


          var replyAlertAccount = _this9.podium.route.forAlertsTo(parent.get("author"));

          var replyAlertRecord = {
            record: "alert",
            type: "reply",
            post: postAddress,
            user: _this9.address // Store records in ledger

          };

          _this9.podium.sendRecords(_this9.identity, [postAccount], postRecord, [replyAccount].concat(_toConsumableArray(indexAccounts)), indexRecord, mentionAccounts, mentionRecord, [replyAlertAccount], replyAlertRecord).then(function (result) {
            return resolve(fromJS(postRecord));
          }).catch(function (error) {
            return reject(error);
          }); // ...otherwise, send the basic records

        } else {
          // Store records in ledger
          _this9.podium.sendRecords(_this9.identity, [postAccount], postRecord, indexAccounts, indexRecord, mentionAccounts, mentionRecord).then(function (result) {
            return resolve(fromJS(postRecord));
          }).catch(function (error) {
            return reject(error);
          });
        }
      });
    }
  }, {
    key: "promotePost",
    value: function promotePost(postAddress, // Address of the promoted post
    authorAddress // Address of the post's author
    ) {
      var _this10 = this;

      this.debugOut("Promoting Post ".concat(postAddress));
      return new Promise(function (resolve, reject) {
        // Get account for the promoting user's posts
        var postAccount = _this10.podium.route.forPostsBy(_this10.address);

        var postRecord = {
          record: "post",
          type: "promotion",
          address: postAddress // Get account for logging promotions of target post

        };

        var promoteAccount = _this10.podium.route.forPromosOfPost(postAddress);

        var promoteRecord = {
          record: "post",
          type: "promotion",
          address: postAddress,
          by: _this10.address // Build alert payload

        };

        var alertAccount = _this10.podium.route.forAlertsTo(authorAddress);

        var alertRecord = {
          record: "alert",
          type: "promotion",
          post: postAddress,
          user: _this10.userAddress // Store records in ledger

        };

        _this10.podium.sendRecords(_this10.identity, [postAccount], postRecord, [promoteAccount], promoteRecord, [alertAccount], alertRecord).then(function (result) {
          return resolve(fromJS(postRecord));
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "amendPost",
    value: function amendPost() {}
  }, {
    key: "retractPost",
    value: function retractPost() {} // REPORTING

  }, {
    key: "createReport",
    value: function createReport() {} // ALERTS

  }, {
    key: "onAlert",
    value: function onAlert(callback) {
      this.podium.openChannel(this.podium.route.forAlertsTo(this.address), callback);
    } // FOLLOWING

  }, {
    key: "forEachUserFollowed",
    value: function forEachUserFollowed(callback) {
      this.podium.openChannel(this.podium.route.forUsersFollowedBy(this.address), callback);
    }
  }, {
    key: "forEachFollower",
    value: function forEachFollower(callback) {
      this.podium.openChannel(this.podium.route.forUsersFollowing(this.address), callback);
    }
  }, {
    key: "follow",
    value: function follow(address) {
      var _this11 = this;

      this.debugOut("Following ".concat(address));
      return new Promise(function (resolve, reject) {
        // Check user is not currently following the user to be followed
        _this11.isFollowing(address).then(function (following) {
          if (!following) {
            var _followingRecord;

            // Build follow account payload
            var followAccount = _this11.podium.route.forUsersFollowing(address);

            var followRecord = {
              record: "follower",
              type: "index",
              address: _this11.address
            }; // Build relation account and payload

            var relationAccount = _this11.podium.route.forRelationOf(_this11.address, address);

            var relationRecord = {
              record: "follower",
              type: "relation"
            };
            relationRecord[_this11.address] = true; // Build following payload

            var followingAccount = _this11.podium.route.forUsersFollowedBy(_this11.address);

            var followingRecord = (_followingRecord = {
              type: "following"
            }, _defineProperty(_followingRecord, "type", "index"), _defineProperty(_followingRecord, "address", address), _followingRecord); // Build alert payload

            var alertAccount = _this11.podium.route.forAlertsTo(address);

            var alertRecord = {
              record: "alert",
              type: "follow",
              user: _this11.address // Store following record

            };

            _this11.podium.sendRecords(_this11.identity, [followAccount], followRecord, [relationAccount], relationRecord, [followingAccount], followingRecord, [alertAccount], alertRecord).then(function (result) {
              return resolve(result);
            }).catch(function (error) {
              return reject(error);
            });
          } else {
            resolve();
          }
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "isFollowing",
    value: function isFollowing(address) {
      var _this12 = this;

      this.debugOut("Testing if following ".concat(address));
      return new Promise(function (resolve, reject) {
        var relationAccount = _this12.podium.route.forRelationOf(_this12.address, address);

        _this12.podium.getLatest(relationAccount).then(function (relation) {
          return resolve(relation.get(_this12.address));
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "isFollowedBy",
    value: function isFollowedBy(address) {
      var _this13 = this;

      this.debugOut("Testing if followed by ".concat(address));
      return new Promise(function (resolve, reject) {
        var relationAccount = _this13.podium.route.forRelationOf(_this13.address, subject);

        _this13.podium.getLatest(relationAccount).then(function (relation) {
          return resolve(relation.get(address));
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "getUsersFollowed",
    value: function getUsersFollowed() {
      var _this14 = this;

      this.debugOut("Fetching users I follow");
      return new Promise(function (resolve, reject) {
        // Get location for records of followed users
        var followingAccount = _this14.podium.route.forUsersFollowing(_this14.address); // Load following users


        _this14.podium.getHistory(followingAccount).then(function (followed) {
          return followed.filter(
          /*#__PURE__*/
          function () {
            var _ref4 = _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee4(f) {
              return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      _context4.next = 2;
                      return _this14.isFollowing(f.get("address"));

                    case 2:
                      return _context4.abrupt("return", _context4.sent);

                    case 3:
                    case "end":
                      return _context4.stop();
                  }
                }
              }, _callee4, this);
            }));

            return function (_x7) {
              return _ref4.apply(this, arguments);
            };
          }());
        }).then(function (followed) {
          return resolve(followed);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "getFollowers",
    value: function getFollowers() {
      var _this15 = this;

      this.debugOut("Fetching users who follow me");
      return new Promise(function (resolve, reject) {
        // Get location for records of followed users
        var followAccount = _this15.podium.route.forUsersFollowedBy(_this15.address); // Load followers


        _this15.podium.getHistory(followAccount).then(function (followed) {
          return followed.filter(
          /*#__PURE__*/
          function () {
            var _ref5 = _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee5(f) {
              return regeneratorRuntime.wrap(function _callee5$(_context5) {
                while (1) {
                  switch (_context5.prev = _context5.next) {
                    case 0:
                      _context5.next = 2;
                      return _this15.isFollowedBy(f.get("address"));

                    case 2:
                      return _context5.abrupt("return", _context5.sent);

                    case 3:
                    case "end":
                      return _context5.stop();
                  }
                }
              }, _callee5, this);
            }));

            return function (_x8) {
              return _ref5.apply(this, arguments);
            };
          }());
        }).then(function (followed) {
          return resolve(followed);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "unfollow",
    value: function unfollow(address) {
      var _this16 = this;

      this.debugOut("Unfollowing ".concat(address));
      return new Promise(function (resolve, reject) {
        // Check user is currently following the user to be unfollowed
        _this16.isFollowing(address).then(function (following) {
          if (following) {
            // Build relation account and payload
            var relationAccount = _this16.podium.route.forRelationOf(_this16.address, address);

            var relationRecord = {
              record: "follower",
              type: "relation"
            };
            relationRecord[_this16.user] = false; // Store following record

            _this16.podium.sendRecord([relationAccount], relationRecord, _this16.identity).then(function (result) {
              return resolve(result);
            }).catch(function (error) {
              return reject(error);
            });
          } else {
            resolve();
          }
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }]);

  return PodiumUser;
}();

exports.default = PodiumUser;
"use strict";

function getAccount(seed) {
  var hash = RadixUtil.hash(Buffer.from(seed));
  return new RadixAccount(RadixKeyPair.fromPrivate(hash));
}
