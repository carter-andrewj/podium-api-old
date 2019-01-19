"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _immutable = require("immutable");

var _radixdlt = require("radixdlt");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

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

function _getAccount(seed) {
  var hash = _radixdlt.RadixUtil.hash(Buffer.from(seed));

  return new _radixdlt.RadixAccount(_radixdlt.RadixKeyPair.fromPrivate(hash));
}

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

var Routes =
/*#__PURE__*/
function () {
  function Routes() {
    _classCallCheck(this, Routes);
  }

  _createClass(Routes, [{
    key: "faucet",
    value: function faucet() {
      return _radixdlt.RadixAccount.fromAddress('9he94tVfQGAVr4xoUpG3uJfB2exURExzFV6E7dq4bxUWRbM5Edd', true);
    } // Users

  }, {
    key: "forProfileOf",
    value: function forProfileOf(address) {
      return _radixdlt.RadixAccount.fromAddress(address);
    }
  }, {
    key: "forKeystoreOf",
    value: function forKeystoreOf(id, pw) {
      return _getAccount("podium-keystore-for-" + id.toLowerCase() + pw);
    }
  }, {
    key: "forProfileWithID",
    value: function forProfileWithID(id) {
      return _getAccount("podium-ownership-of-id-" + id.toLowerCase());
    }
  }, {
    key: "forIntegrityOf",
    value: function forIntegrityOf(address) {
      return _getAccount("podium-integrity-score-of-" + address);
    } // Tokens

  }, {
    key: "forPODof",
    value: function forPODof(address) {
      return _getAccount("podium-token-transactions-of-" + address);
    }
  }, {
    key: "forAUDof",
    value: function forAUDof(address) {
      return _getAccount("audium-token-transactions-of-" + address);
    } // Topics

  }, {
    key: "forTopic",
    value: function forTopic(address) {
      return _radixdlt.RadixAccount.fromAddress(address);
    }
  }, {
    key: "forTopicWithID",
    value: function forTopicWithID(id) {
      return _getAccount("podium-topic-with-id-" + id.toLowerCase());
    }
  }, {
    key: "forPostsAboutTopic",
    value: function forPostsAboutTopic(address) {
      return _getAccount("podium-posts-about-topic-" + address);
    } // Posts

  }, {
    key: "forPostsBy",
    value: function forPostsBy(address) {
      return _getAccount("podium-posts-by-user-" + address);
    }
  }, {
    key: "forPost",
    value: function forPost(address) {
      return _radixdlt.RadixAccount.fromAddress(address);
    }
  }, {
    key: "forNextPostBy",
    value: function forNextPostBy(user) {
      // TODO - Fix this so posts are stored deterministicly again
      return _getAccount("podium-post-by-" + user.get("address") + "-" + (user.get("posts") + user.get("pending")));
    }
  }, {
    key: "forNewPost",
    value: function forNewPost(post) {
      return _getAccount("podium-post-with-content-" + post);
    } // Media

  }, {
    key: "forMedia",
    value: function forMedia(file) {
      return _getAccount(JSON.stringify(file));
    }
  }, {
    key: "forMediaFrom",
    value: function forMediaFrom(address) {
      return _getAccount("podium-media-uploaded-by-" + address);
    } // Follows

  }, {
    key: "forUsersFollowing",
    value: function forUsersFollowing(address) {
      return _getAccount("podium-user-followers-" + address);
    }
  }, {
    key: "forUsersFollowedBy",
    value: function forUsersFollowedBy(address) {
      return _getAccount("podium-user-following-" + address);
    }
  }, {
    key: "forRelationOf",
    value: function forRelationOf(address1, address2) {
      return _getAccount("podium-user-" + address1 + "-follows-user-" + address2);
    } // Alerts

  }, {
    key: "forAlertsTo",
    value: function forAlertsTo(address) {
      return _getAccount("podium-user-alerts-" + address);
    }
  }]);

  return Routes;
}();

var Podix =
/*#__PURE__*/
function () {
  // INITIALIZATION
  function Podix() {
    var _this2 = this;

    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, Podix);

    // Set up global variables
    this.user = null;
    this.route = new Routes();
    this.channels = (0, _immutable.Map)({});
    this.timers = (0, _immutable.Map)({}); // Set logging level

    this.setDebug(debug); // Load remote config if none supplied

    if (!config) {
      this.server = "https://api.podium-network.com";
      fetch(this.server).then(function (response) {
        if (!response.ok) {
          throw new PodiumError("Server Offline").withCode(0);
        } else {
          fetch(_this2.server + "/config").then(function (response) {
            return response.json();
          }).then(function (config) {
            return _this2.connect(config);
          });
        }
      });
    } else {
      this.connect(config);
    }
  }

  _createClass(Podix, [{
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
      return _getAccount(seed);
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

        (_console = console).log.apply(_console, arguments);
      }
    } // TIMERS

  }, {
    key: "newTimer",
    value: function newTimer(id, // Identifier of timer
    duration, // Duration of timer
    callback // Function to be called upon timer completion
    ) {
      var _this3 = this;

      // Start timer
      var timer = setTimeout(function () {
        // Run callback
        callback(); // Delete record of this timer

        _this3.timers.delete(id);
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
      var _this4 = this;

      // Stops all timers
      this.timers.map(function (t) {
        return _this4.stopTimer(t);
      });
    } // WRITE DATA TO RADIX

  }, {
    key: "sendRecord",
    value: function sendRecord(accounts, // Destination accounts for record [Array]
    payload) // Encrypt record with user's identity?
    {
      var _this5 = this;

      var identity = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.user;
      var encrypt = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      if (!identity) {
        throw new Error("Missing Identity");
      }

      return new Promise(function (resolve, reject) {
        if (accounts.length === 0) {
          reject(new Error("Received empty accounts array"));
        } else {
          _this5.debugOut("Writing to Ledger (x", accounts.length, "):", payload);

          _radixdlt.RadixTransactionBuilder.createPayloadAtom(accounts, _this5.app, JSON.stringify(payload), encrypt).signAndSubmit(identity).subscribe({
            complete: function complete() {
              return resolve(true);
            },
            next: function next(status) {
              return _this5.debugOut(" > ", status);
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
      var _this6 = this,
          _arguments = arguments;

      return new Promise(function (resolve, reject) {
        // Unpack arg list
        var args = Array.prototype.slice.call(_arguments); // Check if identity was provided

        var identity;

        if (args.length % 2 === 1) {
          identity = args[0];
          args = args.slice(1, args.length);
        } else if (_this6.user) {
          identity = _this6.user;
        } else {
          throw new Error("Missing Identity");
        } // Dispatch records


        _this6.sendRecord(args[0], args[1], identity).then(function (result) {
          if (args.length > 2) {
            _this6.sendRecords.apply(_this6, [identity].concat(_toConsumableArray(args.slice(2, args.length)))).then(function (result) {
              return resolve(result);
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
      var _this7 = this;

      var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.timeout;
      // Pulls all current values from a radix
      // -account- and closes the channel connection.
      this.debugOut("Fetching Account History (timeout: " + timeout + ")");
      return new Promise(function (resolve, reject) {
        // Open the account connection
        account.openNodeConnection(); // Connect to account data

        var stream = account.dataSystem.getApplicationData(_this7.app); // Fetch all data from target channel

        var skipper;
        var history = (0, _immutable.List)([]);
        var channel = stream.subscribe({
          //TODO - Rewrite to pull until up-to-date once
          //		 radix provides the required flag.
          //		 Currently, this just collates all
          //		 input until timeout.
          next: function next(item) {
            _this7.debugOut(" > Received: ", item.data.payload);

            if (skipper) {
              clearTimeout(skipper);
            }

            var record = (0, _immutable.Map)((0, _immutable.fromJS)(JSON.parse(item.data.payload))).set("received", new Date().getTime()).set("created", item.data.timestamp);
            history = history.push(record); // Assume all records collated 1 second after first
            // (This won't work long-term, but serves as an
            // efficient fix for the timeout issue until the
            // radix lib can flag a channel as up to date).

            skipper = setTimeout(function () {
              _this7.debugOut(" > No record received for 1s. Resolving early.");

              channel.unsubscribe();
              resolve(history);
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
            _this7.debugOut(" > Timed out. Resolving with current history.");

            resolve(history);
          } else {
            _this7.debugOut(" > Timed out. No history received.");

            reject(new PodiumError().withCode(2));
          }
        }, timeout * 1000);
      }); // TODO - Close node connection
    }
  }, {
    key: "getLatest",
    value: function getLatest(account) // Assume account is empty after X seconds inactivity
    {
      var _this8 = this;

      var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.timeout;
      // Returns the most recent payload among all
      // data for the provided -account-.
      // Get account history
      return new Promise(function (resolve, reject) {
        _this8.getHistory(account, timeout).then(function (history) {
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
      var _this9 = this;

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
          _this9.closeChannel(a);
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
                      _this9.resetTimer(address);
                    } // Run callback


                    result = (0, _immutable.Map)((0, _immutable.fromJS)(JSON.parse(item.data.payload)));
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
            _this9.closeChannel(address);

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
      var _this10 = this;

      // Closes all open Channels
      this.channels.map(function (c) {
        return _this10.closeChannel(c);
      });
    } // MEDIA

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
    }
  }, {
    key: "createMedia",
    value: function createMedia(file) {
      var _this12 = this;

      var identity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.user;

      if (!identity) {
        throw new Error("Missing Identity");
      }

      return new Promise(function (resolve, reject) {
        //TODO - Validate media with 3rd party service
        //		 to detect image manipulation, etc...
        // Register media on ledger
        var address = identity.account.getAddress();
        var fileAddress = _this12.route.forMedia(file).getAddress() + "." + file.split(",")[0].split("/")[1].split(";")[0]; // Generate file record
        //TODO - Ensure media address is independent of
        //		 the uploading user so the same image
        //		 uploaded by different users is still
        //		 only stored once on S3.

        var mediaAccount = _this12.route.forMediaFrom(address);

        var mediaPayload = {
          record: "media",
          type: "image",
          address: fileAddress // Register media on ledger
          //TODO - Check if media already exists and skip
          //		 this step, if required

        };

        _this12.sendRecord([mediaAccount], mediaPayload, identity).then(function () {
          return _this12.uploadMedia(file, fileAddress);
        }).then(function () {
          return resolve(fileAddress);
        }).catch(function (error) {
          return reject(error);
        });
      });
    } // SERVER

  }, {
    key: "dispatch",
    value: function dispatch(route, data) {
      var _this13 = this;

      this.debugOut("Posting to ".concat(this.server, "/").concat(route, ":"), data);
      return new Promise(function (resolve, reject) {
        var body = new FormData();
        Object.keys(data).forEach(function (k) {
          return body.append(k, data[k]);
        });
        fetch("".concat(_this13.server, "/").concat(route), {
          method: "POST",
          body: body
        }).then(function (result) {
          _this13.debugOut(" > Response: ", result.json());

          resolve((0, _immutable.fromJS)(result.json()));
        }).catch(function (error) {
          return reject(error);
        });
      });
    } // USERS

  }, {
    key: "createUser",
    value: function createUser(id, // Podium @ ID of new user account
    pw, // Password for new user account
    name, // Display name of new user account
    bio, // Bio of new user account
    picture) // Picture address (in media archive) of user's profile picture
    {
      var _this14 = this;

      return new Promise(function (resolve, reject) {
        _this14.dispatch("user", {
          id: id,
          pw: pw,
          name: name,
          bio: bio,
          picture: picture
        }).then(function (response) {
          return resolve(response);
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
    bio, // Bio of new user account
    picture // Picture address (in media archive) of user's profile picture
    ) {
      var _this15 = this;

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
          var identityManager, identity, address, pictureAddress, profileAccount, profilePayload, podAccount, podPayload, audAccount, audPayload, integrityAccount, integrityPayload, ownershipAccount, ownershipPayload, keyStore;
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  // Create user identity
                  identityManager = new _radixdlt.RadixIdentityManager();
                  identity = identityManager.generateSimpleIdentity();
                  address = identity.account.getAddress(); //TODO - Store picture, if present

                  if (!picture) {
                    _context3.next = 7;
                    break;
                  }

                  _context3.next = 6;
                  return _this15.createMedia(picture, identity).catch(function (error) {
                    return reject(error);
                  });

                case 6:
                  pictureAddress = _context3.sent;

                case 7:
                  // Generate user public record
                  profileAccount = _this15.route.forProfileOf(address);
                  profilePayload = {
                    record: "user",
                    type: "profile",
                    id: id,
                    name: name,
                    bio: bio,
                    picture: pictureAddress,
                    address: address // Generate user POD account

                  };
                  podAccount = _this15.route.forPODof(address);
                  podPayload = {
                    owner: address,
                    pod: 500,
                    from: "" // Generate user AUD account

                  };
                  audAccount = _this15.route.forAUDof(address);
                  audPayload = {
                    owner: address,
                    pod: 10,
                    from: "" // Generate user integrity record

                  };
                  integrityAccount = _this15.route.forIntegrityOf(address);
                  integrityPayload = {
                    owner: address,
                    i: 0.5,
                    from: "" // Generate record of this user's address owning this ID

                  };
                  ownershipAccount = _this15.route.forProfileWithID(id);
                  ownershipPayload = {
                    id: id,
                    owner: address
                  }; // Encrypt keypair

                  keyStore = _this15.route.forKeystoreOf(id, pw);

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
                              return _context2.abrupt("return", _this15.sendRecords(identity, [keyStore], encryptedKey, [profileAccount], profilePayload, [podAccount], podPayload, [audAccount], audPayload, [integrityAccount], integrityPayload, [ownershipAccount], ownershipPayload));

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
                    return resolve(address);
                  }).catch(function (error) {
                    return reject(error);
                  });

                case 19:
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
    key: "setUser",
    value: function setUser(id, // User Identifier
    pw // User password
    ) {
      var _this16 = this;

      this.debugOut("Signing In: ", id, pw);
      return new Promise(function (resolve, reject) {
        _this16.getLatest(_this16.route.forKeystoreOf(id, pw)).then(function (encryptedKey) {
          _this16.debugOut("Received Keypair");

          return _radixdlt.RadixKeyStore.decryptKey(encryptedKey.toJS(), pw);
        }).then(function (keyPair) {
          _this16.debugOut("Decrypted Keypair: ", keyPair);

          _this16.user = new _radixdlt.RadixSimpleIdentity(keyPair);
          resolve(_this16.user);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "clearUser",
    value: function clearUser() {
      this.cleanUp();
      this.user = null;
    }
  }, {
    key: "updateUserIdentifier",
    value: function updateUserIdentifier() {}
  }, {
    key: "swapUserIdentifiers",
    value: function swapUserIdentifiers() {} // USER PROFILES

  }, {
    key: "updateUserDisplayName",
    value: function updateUserDisplayName() {}
  }, {
    key: "updateUserBio",
    value: function updateUserBio() {}
  }, {
    key: "updateUserPicture",
    value: function updateUserPicture() {} //TODO - handle multiple simultaneous requests
    //		 for the same record without multiple
    //		 calls to the network

  }, {
    key: "fetchProfile",
    value: function fetchProfile(target) // Set true if passing an ID instead of an address
    {
      var _this17 = this;

      var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return new Promise(function (resolve, reject) {
        // Search on ID or Address
        if (id) {
          // Search on ID
          _this17.getLatest(_this17.route.forProfileWithID(target)).then(function (reference) {
            return resolve(_this17.fetchProfile(reference.get("address")));
          }).catch(function (error) {
            return reject(error);
          });
        } else {
          // Search on address
          _this17.getLatest(_this17.route.forProfileOf(target)).then(function (result) {
            var profile = result.update("picture", function (p) {
              return "".concat(_this17.media, "/").concat(p);
            });
            resolve(profile);
          }).catch(function (error) {
            return reject(error);
          });
        }
      });
    } // TOPICS

  }, {
    key: "createTopic",
    value: function createTopic(id, // Unique identifier for topic
    name, // Display name of topic
    description, // Description of topic
    owner) {
      var _this18 = this;

      var identity = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : this.user;

      if (!identity) {
        throw new Error("Missing Identity");
      }

      return new Promise(function (resolve, reject) {
        // Resolve topic address
        var topicAccount = _this18.route.forTopicWithID(id);

        var topicAddress = topicAccount.getAddress(); // Build topic record

        var topicRecord = {
          record: "topic",
          type: "topic",
          id: id,
          name: name,
          description: description,
          owner: owner,
          address: topicAddress // Store topic

        };

        _this18.sendRecord([topicAccount], topicRecord, identity) //TODO - Add topic to index database
        .then(function (result) {
          return resolve((0, _immutable.fromJS)(topicRecord));
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "fetchTopic",
    value: function fetchTopic(target) // Set true if passing an ID instead of an address
    {
      var _this19 = this;

      var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return new Promise(function (resolve, reject) {
        // Search on ID or Address
        if (id) {
          // Search on ID
          _this19.getLatest(_this19.route.forTopicWithID(target)).then(function (reference) {
            return resolve(_this19.fetchTopic(reference.get("address")));
          }).catch(function (error) {
            return reject(error);
          });
        } else {
          // Search on address
          _this19.getLatest(_this19.route.forTopic(target)).then(function (topic) {
            return resolve(topic);
          }).catch(function (error) {
            return reject(error);
          });
        }
      });
    } // POSTS

  }, {
    key: "createPost",
    value: function createPost(content) {
      var _this20 = this;

      var references = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var parent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var identity = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : this.user;

      if (!identity) {
        throw new Error("Missing Identity");
      }

      return new Promise(function (resolve, reject) {
        // Get user data
        var userAddress = identity.account.getAddress(); // Build post accounts
        //TODO - Fix deterministic posting addresses
        //const postAccount = this.route.forNextPostBy(this.state.data.get("user"));

        var postAccount = _this20.route.forNewPost(content);

        var postAddress = postAccount.getAddress(); // Build post record

        var postRecord = {
          record: "post",
          // origin, amendment, retraction
          type: "post",
          content: content,
          address: postAddress,
          author: userAddress,
          parent: parent ? parent.get("address") : null,
          origin: parent ? parent.get("origin") : postAddress,
          depth: parent ? parent.get("depth") + 1 : 0 // Build reference payload and destination accounts

        };
        var refAccounts = [_this20.route.forPostsBy(userAddress) //TODO - Add to other indexes for topics, mentions, links
        ];
        var refRecord = {
          record: "post",
          type: "reference",
          address: postAddress // Build alert payload
          //TODO - build alerts system
          // const alertAccounts = []
          // const alertRecord = {
          // 	record: "alert",
          // 	type: "mention",
          // 	address: postAddress,
          // 	by: userAddress
          // 	created: time
          // }
          // Store records in ledger

        };

        _this20.sendRecords(identity, [postAccount], postRecord, refAccounts, refRecord).then(function (result) {
          return resolve((0, _immutable.fromJS)(postRecord));
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "fetchPost",
    value: function fetchPost(address) {
      var _this21 = this;

      return new Promise(function (resolve, reject) {
        _this21.getHistory(_this21.route.forPost(address)).then(function (postHistory) {
          return resolve(postHistory.reduce(function (p, nxt) {
            // TODO - Merge edits and retractions
            //		  into a single cohesive map
            return p.mergeDeep(nxt);
          }, (0, _immutable.Map)({})));
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "listenPosts",
    value: function listenPosts(address, callback) {
      this.openChannel(this.route.forPostsBy(address), callback);
    }
  }, {
    key: "promotePost",
    value: function promotePost(address, // Radix address of post to be promoted
    promoter, // Radix address of user promoting said post
    pod) // Audium spent promoting the post
    {
      var aud = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      console.log("PROMOTED POST ", address);
    }
  }, {
    key: "reportPost",
    value: function reportPost() {}
  }, {
    key: "amendPost",
    value: function amendPost() {}
  }, {
    key: "retractPost",
    value: function retractPost() {} // ALERTS

  }, {
    key: "listenAlerts",
    value: function listenAlerts(address, callback) {
      this.openChannel(this.route.forAlertsTo(address), callback);
    } // FOLLOWING

  }, {
    key: "listenFollow",
    value: function listenFollow(address, callback) {
      this.openChannel(this.route.forUsersFollowedBy(address), callback);
    }
  }, {
    key: "followUser",
    value: function followUser(followAddress) {
      var _this22 = this;

      var identity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.user;

      if (identity) {
        throw new Error("Missing Identity");
      }

      return new Promise(function (resolve, reject) {
        // Get user data
        var userAddress = identity.account.getAddress(); // Build follow account payload

        var followAccount = _this22.route.forFollowing(userAddress);

        var followRecord = {
          type: "follower index",
          address: userAddress
        }; // Build relation account and payload

        var relationAccount = _this22.route.forRelationOf(userAddress, followAddress);

        var relationRecord = {
          type: "follower record",
          users: [userAddress, followAddress],
          follow: true
        }; // Build following payload

        var followingAccount = _this22.route.forFollowsBy(userAddress);

        var followingRecord = {
          type: "following index",
          address: followAddress
        }; // Store following record

        _this22.sendRecords(identity, [followAccount], followRecord, [relationAccount], relationRecord, [followingAccount], followingRecord) //TODO - Alerts system
        .then(function (result) {
          return resolve(result);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "unfollowUser",
    value: function unfollowUser() {}
  }]);

  return Podix;
}();

exports.default = Podix;
